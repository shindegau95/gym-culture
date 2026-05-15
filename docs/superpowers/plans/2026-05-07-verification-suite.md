# Verification Suite — Claude-Driven Execution

**Version:** 1.0
**Date:** 2026-05-07
**Purpose:** Define how to verify each implementation issue during Claude-assisted execution so that every issue can be closed with confidence.

---

## 1. Philosophy

Each Linear issue contains its own **Definition of Done** and **Acceptance Criteria** — these are the primary verification targets. This document defines the *process* and *tooling* to work through them systematically.

Two rules govern every issue:
1. **Tests before merge.** No issue is Done unless the tests specified in its Definition of Done pass.
2. **Happy path + one negative.** At minimum, verify the primary happy path and one error or edge scenario. Empty states count as edge scenarios.

---

## 2. Per-Issue Verification Process

For every issue, follow this sequence:

```
1. Read the issue's Acceptance Criteria in full before writing any code.
2. Implement the feature.
3. Run the automated test suite for the relevant app (see sections below).
4. For each BDD scenario in the issue, manually verify or point to the test that covers it.
5. Check the Definition of Done checkboxes — all must be ticked.
6. Mark the issue Done in Linear.
```

**Never skip step 1.** The acceptance criteria define the contract. Implementation that passes tests but fails an AC scenario is not done.

---

## 3. Backend Verification (Spring Boot)

### 3.1 Running Tests

```bash
# All tests
cd backend && mvn test

# Single class
mvn test -Dtest=FirebaseAuthFilterTest

# Single method
mvn test -Dtest=UserServiceTest#getByFirebaseUid_existingUser_returnsResponse

# Integration tests only (requires Docker for Testcontainers)
mvn test -Dgroups=integration
```

### 3.2 Testcontainers Setup

Integration tests use a real PostgreSQL 16 container. Ensure Docker is running before executing integration tests. The `application-test.properties` datasource URL uses the Testcontainers JDBC URL format:

```
spring.datasource.url=jdbc:tc:postgresql:16:///vis
```

No manual database setup is required. Flyway migrations run automatically on the test container.

### 3.3 Backend Checklist (per issue)

- [ ] Unit tests cover the service method for both success and failure paths
- [ ] `@WebMvcTest` controller test covers the endpoint — 200 response shape, and at least one 4xx scenario
- [ ] Integration test hits a real Testcontainers DB (for any issue touching Flyway migrations)
- [ ] Branch scoping verified: STAFF/CLIENT/TRAINER cannot access another branch's data
- [ ] OWNER can access all branches (for multi-branch endpoints)
- [ ] Error responses use the standard format: `{ error, message, timestamp }`
- [ ] Flyway migration (if any) is idempotent and runs cleanly on a fresh DB

### 3.4 Flyway Migration Verification

After adding a new Flyway migration:

```bash
# Apply migration to local DB
mvn flyway:migrate

# Check status
mvn flyway:info

# If something went wrong, repair checksum (dev only)
mvn flyway:repair
```

Verify the migration applies cleanly to an empty database (run against a fresh Docker Compose instance).

### 3.5 Firebase Auth Filter (Controller Tests)

`FirebaseAuthFilter` is mocked in `@WebMvcTest` slices. To simulate an authenticated caller:

```java
@MockBean
private FirebaseAuthFilter firebaseAuthFilter;

// In test setup: configure SecurityContext with a mock UserEntity
SecurityContextHolder.getContext().setAuthentication(
    new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities())
);
```

Never test the filter in a `@WebMvcTest` slice — it has its own dedicated `FirebaseAuthFilterTest`.

---

## 4. Angular Verification (Admin Web)

### 4.1 Running Tests

```bash
cd admin-web

# All unit tests (Karma)
ng test

# Single spec file
ng test --include='**/members.component.spec.ts'

# E2E tests (Playwright) — requires dev server running
ng serve &
npx playwright test e2e/admin/

# Single E2E spec
npx playwright test e2e/admin/members.spec.ts
```

### 4.2 Angular Checklist (per issue)

- [ ] Component unit tests cover `@Input` bindings, template rendering, and user interaction
- [ ] Service unit tests mock `HttpClient` — verify correct URL, method, and payload
- [ ] `AuthGuard` unit test covers OWNER-only and STAFF-accessible routes
- [ ] `AuthInterceptor` unit test verifies `Authorization` header is appended
- [ ] Playwright E2E test covers the happy path scenario in the issue's Acceptance Criteria
- [ ] Playwright test covers at least one empty state or error state
- [ ] Component compiles without TypeScript errors: `ng build --configuration development`
- [ ] No `console.error` output during the Playwright test run

### 4.3 Playwright Test File Convention

```
e2e/admin/
  members.spec.ts        # Members module tests
  trainers.spec.ts       # Trainers module tests
  overview.spec.ts       # Dashboard tests (Owner + Staff)
  reminders.spec.ts      # Reminders module tests
  auth.spec.ts           # Login, guard, interceptor
```

Test names must match the `> Playwright/E2E:` hint in the issue's Acceptance Criteria. Example:

```typescript
test('members.list.renders-active-members', async ({ page }) => { … });
test('members.activate-membership.success-toast', async ({ page }) => { … });
```

### 4.4 Angular Dev Server

```bash
cd admin-web
ng serve          # localhost:4200
# or for API proxy:
ng serve --proxy-config proxy.conf.json
```

Playwright tests expect the app at `http://localhost:4200` and the backend at `http://localhost:8080`.

---

## 5. React Native Verification (Client App + Trainer App)

### 5.1 Running Tests

```bash
cd client-app   # or trainer-app

# Jest unit tests
npx react-native test
# or
npx jest

# Single test file
npx jest src/services/sessionService.test.ts
```

### 5.2 Running on Simulators

```bash
# iOS (requires macOS + Xcode)
npx react-native run-ios

# Android (requires Android Studio + emulator running)
npx react-native run-android

# Start Metro bundler separately
npx react-native start
```

### 5.3 React Native Checklist (per issue)

- [ ] Jest unit tests cover service layer functions (`workoutService`, `sessionService`, etc.) with Axios mocked
- [ ] Jest unit tests cover hook logic (`useSession` polling, timer cleanup on unmount)
- [ ] Manual smoke test on iOS simulator: happy path scenario from the issue's AC
- [ ] Manual smoke test on Android emulator: same happy path
- [ ] Empty state verified: simulate API returning empty array — no crash, empty state component renders
- [ ] Error state verified: simulate API returning 500 — error toast appears, no crash
- [ ] Loading state verified: simulate slow network — skeleton renders, CTA is disabled
- [ ] No red-screen errors or Metro bundle errors during smoke test
- [ ] `useSession` interval cleared on component unmount (verify via Jest fake timers)

### 5.4 Firebase Config Files

These files are gitignored. Must be present before running apps:

| File | Location |
|------|----------|
| `google-services.json` | `client-app/android/app/` and `trainer-app/android/app/` |
| `GoogleService-Info.plist` | `client-app/ios/` and `trainer-app/ios/` |
| `firebase-service-account.json` | `backend/` |

If missing, apps will crash at startup with a Firebase initialization error.

### 5.5 Manual Test Script — Session Sync

For active session sync verification (requires both Trainer App and Client App running):

1. Open Trainer App → Today tab → tap an active session
2. Open Client App → Workout tab → tap "Start Session" for the same session
3. On Trainer App: add a set row (Exercise A, Set 1, 100 kg, 10 reps)
4. Wait 5 seconds on Client App
5. **Expected:** Client App shows the new set row without manual refresh
6. On Client App: edit the set to 105 kg
7. **Expected:** Trainer App reflects 105 kg within 5 seconds (last-write-wins)

---

## 6. Phase Gate Criteria

A phase is complete and the next phase may begin only when ALL of the following pass:

### Phase 0 — Foundation Gate

- [ ] All 14 Phase 0 issues (VIS-17–VIS-30) are Done in Linear
- [ ] `mvn test` passes with zero failures on a fresh clone
- [ ] All three apps can sign in with Firebase and reach the backend
- [ ] `GET /auth/me` returns the correct role and branch for each role type
- [ ] Branch Staff cannot read another branch's members (403 verified)
- [ ] Owner can read all branches' members (200 verified)
- [ ] Flyway reports all V1–V2 migrations as "Success"

### Phase 1 — Admin Web Gate

- [ ] All 9 Phase 1 issues (VIS-31–VIS-39) are Done
- [ ] Playwright E2E suite (`e2e/admin/`) passes with zero failures
- [ ] Staff can activate a membership → client receives push notification
- [ ] Owner can view cross-branch revenue overview
- [ ] CSV import: upload a 10-row CSV, all rows imported, duplicate detected

### Phase 2 — Trainer App Gate

- [ ] All 6 Phase 2 issues (VIS-40–VIS-45) are Done
- [ ] Trainer can build a workout plan and assign it to a client
- [ ] Trainer can start a session and log sets
- [ ] `POST /ai/exercise-suggestions` returns a ranked list (live OpenAI call)
- [ ] Flyway reports all V8–V11 migrations as "Success"
- [ ] `mvn test` still passes (no regressions from Phase 0/1)

### Phase 3 — Client App Gate

- [ ] All 15 Phase 3 issues (VIS-46–VIS-60) are Done
- [ ] Full onboarding flow: new Firebase user → body profile → trainer selection → Home tab
- [ ] Session sync verified manually (see §5.5)
- [ ] All 5 tabs render on seeded account without crash on iOS and Android
- [ ] FCM push notification delivered and taps deep-link to correct screen
- [ ] Flyway reports all V12–V14 migrations as "Success"

---

## 7. Common Failure Patterns

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `FirebaseApp not initialized` on app start | Missing `google-services.json` or `GoogleService-Info.plist` | Add config files to correct location |
| Backend 401 on valid user | `FirebaseAuthFilter` not finding `firebase-service-account.json` | Set `FIREBASE_CREDENTIALS_PATH` env var |
| Testcontainers test fails with Docker error | Docker not running | Start Docker Desktop |
| Flyway checksum mismatch | Migration file edited after applying | `mvn flyway:repair` on dev; never edit applied migrations |
| Metro bundler: module not found | Missing `npm install` or `pod install` | Run `npm install && npx pod-install` |
| Angular `ng test` exits immediately | Karma browser config | Ensure `headless: true` in `karma.conf.js` for CI |
| `PENDING_ACTIVATION` (403) | User authenticated but no DB record | Staff must create the user in Admin Web first |
| Session set not updating in Client App | Polling interval cleared prematurely | Check `useSession` cleanup — ensure `clearInterval` only fires on unmount |
| Branch data leak (STAFF sees other branch) | Missing branch filter in service method | Add `findAllByBranchId(caller.branchId())` in service |
| `java.lang.NullPointerException` in filter | `UserService.getByFirebaseUid` returning null not empty Optional | Return `Optional.empty()` from repository, handle in filter |
