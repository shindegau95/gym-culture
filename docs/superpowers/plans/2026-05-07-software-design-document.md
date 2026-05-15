# Software Design Document — Vis

**Version:** 1.0
**Date:** 2026-05-07
**Status:** Approved

---

## 1. System Overview

Vis is a three-app fitness platform for **vis** — a multi-branch gym chain (7 branches, target 100). All three apps share a single backend API and PostgreSQL database. Every data entity is branch-scoped from day one.

**Apps:**
- **Client App** — React Native (iOS + Android) — PT members
- **Trainer App** — React Native (iOS + Android) — Personal Trainers
- **Admin Web** — Angular — Branch Staff and Owners

**Configuration constant:** `app.owner-name=vis` in `application.properties` — change from one location to deploy for a different gym chain.

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Firebase Auth                        │
│  Google Sign-In · Apple Sign-In · Phone OTP (India)      │
└───────────────────┬──────────────────────────────────────┘
                    │ Firebase ID Token (JWT)
        ┌───────────┼───────────┐
        │           │           │
   Client App   Trainer App  Admin Web
  (React Native)(React Native)(Angular 17)
        │           │           │
        └───────────┼───────────┘
                    │ Bearer <firebase-id-token>
        ┌───────────▼──────────────────────────┐
        │        Spring Boot 3 REST API         │
        │  FirebaseAuthFilter → UserService     │
        │  → Spring Security Context (role)     │
        │                                       │
        │  Flyway-managed PostgreSQL schema     │
        │  Branch-scoped queries at svc layer   │
        └───────────┬──────────────────────────┘
                    │
        ┌───────────▼──────────────────────────┐
        │      PostgreSQL 16 (Neon)             │
        │  V1–V14 Flyway migrations             │
        └──────────────────────────────────────┘
```

**Hosting:**

| Component | Hosting |
|-----------|---------|
| Backend | Google Cloud Run (containerised, 2M req/mo free) |
| Database | Neon PostgreSQL (always-on free tier) |
| Admin Web | Vercel or Netlify (free tier) |
| File Storage | Cloudflare R2 (avatars, progress photos — 10GB egress free) |

---

## 3. Backend Design

### 3.1 Package Structure

```
in.vis/
  config/       FirebaseConfig, SecurityConfig, CorsConfig
  filter/       FirebaseAuthFilter
  model/        JPA entities (Branch, User, Membership, Session, …)
  enums/        Role { CLIENT | TRAINER | STAFF | OWNER }
  repository/   Spring Data JPA repositories (one per aggregate)
  service/      Business logic + branch enforcement
  controller/   REST endpoints (one controller per domain)
  dto/          Request and response records
  exception/    GlobalExceptionHandler, typed exceptions
```

### 3.2 Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| `filter/` | Validates Firebase JWT, extracts UID, loads user from DB, sets `SecurityContext` |
| `service/` | Branch scoping, business rules, orchestration |
| `controller/` | HTTP mapping, input validation (`@Valid`), response shaping |
| `repository/` | Data access; no business logic |
| `dto/` | Immutable Java records — never expose JPA entities directly |

### 3.3 Flyway Migration Registry

| Migration | Domain |
|-----------|--------|
| V1 | `branches` table |
| V2 | `users` table (firebase_uid, role, branch_id) |
| V3 | `memberships` (gym membership per user) |
| V4 | `pt_memberships` (PT membership + trainer assignment) |
| V5 | `payment_logs` |
| V6 | `trainer_profiles` |
| V7 | `trainer_ratings` |
| V8 | `exercises` (seeded catalogue, ~300 entries) |
| V9 | `workout_plans` + `workout_plan_days` + `plan_exercises` |
| V10 | `sessions` + `session_sets` |
| V11 | `nutrition_plans` + `meals` + `meal_items` |
| V12 | `body_measurements` |
| V13 | `gym_schedules` (client preferred visit days) |
| V14 | `users.fcm_token` column |

### 3.4 Testing Strategy

| Type | Tooling | Scope |
|------|---------|-------|
| Unit | JUnit 5 + Mockito | Services, filter logic |
| Controller slice | `@WebMvcTest` + `MockBean` | HTTP mapping, validation — Firebase filter mocked |
| Integration | Testcontainers (PostgreSQL 16) | Full DB stack; `application-test.properties` uses `jdbc:tc:postgresql:16:///vis` |

---

## 4. Database Schema

### 4.1 Core Design Principles

- Every data entity carries `branch_id` (FK to `branches.id`)
- `OWNER` role has `branch_id = NULL` — sees all branches
- All timestamps are `TIMESTAMPTZ` (UTC)
- Soft deletes are not used in v1 — records are deactivated by status column

### 4.2 Key Relationships

```
branches (1) ──────────< users (many)
branches (1) ──────────< memberships (many)
users/trainers (1) ────< workout_plans (many)
workout_plans (1) ─────< sessions (many)
sessions (1) ──────────< session_sets (many)
users/clients (1) ─────< body_measurements (many)
users/clients (1) ─────< gym_schedules (1)
trainer_profiles (1) ──< trainer_ratings (many)
```

### 4.3 Multi-Branch Enforcement

Branch scoping is enforced **at the service layer**, not the controller:

```java
// STAFF/TRAINER: filter by caller's branch_id
// OWNER: no filter
if (!caller.role().equals(Role.OWNER)) {
    return repository.findAllByBranchId(caller.branchId());
}
return repository.findAll();
```

---

## 5. Authentication & Authorization

### 5.1 Auth Flow

```
1. App signs in via Firebase (Google / Apple / Phone OTP)
2. Firebase issues an ID Token (JWT, 1-hour expiry)
3. App attaches token: Authorization: Bearer <token>
4. FirebaseAuthFilter.doFilterInternal():
   a. Extracts Bearer token
   b. FirebaseAuth.getInstance().verifyIdToken(token) → FirebaseToken
   c. Extracts uid from token
   d. UserService.getByFirebaseUid(uid) → UserEntity
   e. If no UserEntity → SecurityContext cleared (pending user)
   f. If UserEntity found → sets UsernamePasswordAuthenticationToken
      with role authorities
5. Controller receives authenticated request
```

### 5.2 Role Authorities

| Role | Authority String | Access |
|------|-----------------|--------|
| `CLIENT` | `ROLE_CLIENT` | Own branch data, own sessions, own measurements |
| `TRAINER` | `ROLE_TRAINER` | Own branch data, all clients in branch |
| `STAFF` | `ROLE_STAFF` | Own branch data, member management |
| `OWNER` | `ROLE_OWNER` | All branches, all data |

### 5.3 Pending User Handling

A Firebase-authenticated user with no DB record receives `403` with error code `PENDING_ACTIVATION`. The Admin Web must create/activate their record first.

---

## 6. API Design

### 6.1 Base URL

- **Development:** `http://localhost:8080`
- **Production:** Cloud Run URL (stored in app environment config)

### 6.2 Endpoint Registry

| Domain | Method | Path | Roles |
|--------|--------|------|-------|
| Auth | POST | `/auth/register` | Any Firebase user |
| Auth | GET | `/auth/me` | Any authenticated |
| Branches | GET | `/branches` | OWNER |
| Branches | GET | `/branches/{id}` | OWNER, STAFF (own) |
| Members | GET | `/members` | STAFF, OWNER |
| Members | POST | `/members/{id}/membership` | STAFF |
| Members | POST | `/members/{id}/pt-membership` | STAFF |
| Members | POST | `/members/{id}/payment` | STAFF |
| Trainers | GET | `/trainers` | STAFF, OWNER, CLIENT |
| Trainers | GET | `/trainers/{id}` | STAFF, OWNER, CLIENT |
| Stats | GET | `/stats/overview` | OWNER |
| Stats | GET | `/stats/branch` | STAFF |
| Exercises | GET | `/exercises` | TRAINER, CLIENT |
| Plans | GET/POST | `/plans` | TRAINER |
| Plans | GET/PUT | `/plans/{id}` | TRAINER |
| Sessions | GET/POST | `/sessions` | TRAINER, CLIENT |
| Sessions | GET/PATCH | `/sessions/{id}` | TRAINER, CLIENT |
| Sessions | PATCH | `/sessions/{id}/sets` | TRAINER, CLIENT |
| Nutrition | GET/POST | `/nutrition/plans` | TRAINER |
| Nutrition | GET | `/nutrition/daily-plan` | CLIENT |
| Body Measurements | GET/POST | `/body-measurements` | CLIENT |
| Recovery | GET | `/recovery/status` | CLIENT |
| Client Home | GET | `/client/home` | CLIENT |
| Gym Schedule | GET/PATCH | `/users/me/schedule` | CLIENT |
| FCM Token | POST | `/users/me/fcm-token` | CLIENT, TRAINER |
| AI | POST | `/ai/exercise-suggestions` | TRAINER |
| AI | POST | `/ai/macro-plan` | TRAINER |

### 6.3 Error Response Format

```json
{
  "error": "MEMBERSHIP_NOT_FOUND",
  "message": "No active PT membership found for user",
  "timestamp": "2026-05-07T06:00:00Z"
}
```

Standard HTTP status codes: 400 (validation), 401 (unauthenticated), 403 (unauthorized/pending), 404 (not found), 500 (server error).

---

## 7. Client App Design

### 7.1 Architecture

```
client-app/
  src/
    screens/          One file per screen (HomeScreen, WorkoutScreen, …)
    components/       Feature-scoped subdirectories (home/, workout/, progress/, …)
    hooks/            useSession (polling), useHealthData
    services/         workoutService, sessionService, nutritionService, …
    navigation/       RootNavigator, TabNavigator, AuthNavigator
    config/           firebase.js, axiosClient.ts (interceptor)
```

### 7.2 Navigation Structure

```
AuthNavigator
  └── LoginScreen
  └── PendingScreen

OnboardingNavigator (new user, active PT membership)
  └── BodyProfileScreen
  └── TrainerSelectionScreen

MainTabNavigator (fully onboarded)
  ├── HomeTab       → HomeScreen
  ├── WorkoutTab    → WorkoutScreen → ActiveSessionScreen
  ├── ProgressTab   → ProgressScreen (Measurements / Strength / Attendance sub-tabs)
  ├── NutritionTab  → NutritionScreen
  └── ProfileTab    → ProfileScreen
```

### 7.3 Active Session Polling

`useSession` hook implements 5-second polling for the active session:

```typescript
useEffect(() => {
  const id = setInterval(() => {
    sessionService.getSession(sessionId).then(setSession);
  }, 5000);
  return () => clearInterval(id); // clean up on unmount
}, [sessionId]);
```

Last-write-wins: no optimistic locking; the server applies the last `PATCH /sessions/:id/sets` payload for each `set_number`.

### 7.4 Firebase Auth Token Refresh

Axios interceptor attached in `axiosClient.ts`:
- On every request: `getIdToken(/* forceRefresh= */ false)` to get cached token
- On 401 response: `getIdToken(/* forceRefresh= */ true)` then retry once

### 7.5 Health Data

Apple HealthKit (iOS) and Google Health Connect (Android) data is read **on-device only** at app open. Data is never sent to the backend. Displayed on `HomeScreen` → HealthStatsRow.

---

## 8. Trainer App Design

### 8.1 Navigation Structure

```
MainTabNavigator
  ├── TodayTab    → TodayScreen → ActiveSessionScreen (shared with client)
  ├── ClientsTab  → ClientListScreen → ClientDetailScreen
  ├── PlanTab     → PlanBuilderScreen → NutritionPlanScreen
  └── ProfileTab  → TrainerProfileScreen
```

### 8.2 AI Integration

`AiController` proxies requests to OpenAI GPT-4o:

```
Trainer App → POST /ai/exercise-suggestions
  → Spring Boot → OpenAI API (system prompt + client context)
  → response filtered/formatted → Trainer App

Trainer App → POST /ai/macro-plan
  → Spring Boot → OpenAI API
  → calorie + macro split → Trainer App
```

The backend holds the OpenAI API key — clients never see it. Rate limiting is applied at the `AiController` layer.

---

## 9. Admin Web Design

### 9.1 Architecture

```
admin-web/src/
  app/
    core/           FirebaseService, AuthInterceptor, AuthGuard
    features/
      members/      MembersModule (list, detail, activate, payments)
      trainers/     TrainersModule
      overview/     OwnerDashboard, BranchDashboard
      reminders/    RemindersModule
    shared/         SharedModule (pipes, components)
  environments/     environment.ts, environment.production.ts
```

### 9.2 Route Guards

`AuthGuard` checks Firebase Auth state + user role from `/auth/me`. Routes:
- `/overview` — OWNER + STAFF
- `/branches` — OWNER only
- `/members` — OWNER + STAFF
- `/trainers` — OWNER + STAFF
- `/reminders` — OWNER + STAFF

### 9.3 Angular HTTP Interceptor

`AuthInterceptor` appends `Authorization: Bearer <token>` on every outgoing request. Token refresh is handled by `FirebaseService.getIdToken()`.

### 9.4 E2E Testing

Playwright tests in `e2e/admin/*.spec.ts`. Angular dev server runs at `localhost:4200`. Tests use a seeded test database via the backend.

---

## 10. Push Notifications

### 10.1 Flow

```
1. Client/Trainer App: @react-native-firebase/messaging.getToken()
2. POST /users/me/fcm-token → stored in users.fcm_token
3. On token refresh: messaging().onTokenRefresh → re-register
4. Backend NotificationService: FirebaseMessaging.send(Message) via Admin SDK
5. App foreground: messaging().onMessage → in-app toast
6. App background/killed: OS delivers to tray → tap → deep-link via onNotificationOpenedApp
```

### 10.2 Notification Triggers (Backend)

| Trigger | Mechanism |
|---------|-----------|
| PT membership activated | `MemberService.activatePT()` → `NotificationService.send()` |
| Expiry warning (7 days) | Spring `@Scheduled` cron at 08:00 daily |
| Session reminder | `@Scheduled` cron 30 min before session |
| Admin bulk reminder | `ReminderController.send()` → `NotificationService.sendBulk()` |

---

## 11. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Real-time session sync | 5-second polling | Simpler than WebSocket; 5 s lag acceptable for PT context; revisit in v2 |
| Auth provider | Firebase Auth | Phone OTP (India) + Google + Apple in one SDK; backend validates JWT without DB round-trip per user |
| Database | PostgreSQL (Neon) | ACID, branch scoping via `branch_id` FK, Flyway for schema versioning |
| AI proxy | Spring Boot intermediary | Keeps API key server-side; allows rate limiting and response formatting |
| Health data | Device-only, never stored | Privacy compliance, no backend complexity; display-only |
| Branch scoping | Service layer, not controller | Uniform enforcement across all access paths; controllers stay thin |
| Soft deletes | Not used (v1) | Status columns (active/inactive) are sufficient; reduces query complexity |
| Multi-branch visibility | `branch_id = NULL` for OWNER | Simplest model; OWNER queries skip the branch filter predicate |
