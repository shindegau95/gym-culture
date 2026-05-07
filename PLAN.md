# GymCulture Pro — Master Plan & Progress Tracker

> **Resume instructions:** If context is lost, read this file first, then read the spec at `docs/superpowers/specs/2026-05-04-gym-culture-design.md`, then open the plan file for the current phase. Pick up from the first unchecked task.

---

## Project Context

| Item | Value |
|---|---|
| Owner constant | `thegymculture.in` (OWNER_NAME — change in one place) |
| Branches | 7 currently (Kandivali, Borivali, Mira Road, Malad East, Orlem, Haridwar, Sundar Nagar) |
| Spec | `docs/superpowers/specs/2026-05-04-gym-culture-design.md` |
| Stack | Java 21 + Spring Boot 3, PostgreSQL (Neon), Firebase Auth + FCM, React Native (Client + Trainer), Angular (Admin), Google Cloud Run, Cloudflare R2 |
| Auth | Firebase Auth — Google Sign-In, Apple Sign-In, Phone OTP. Spring Boot validates Firebase JWT on every request. |
| Payments | In-person only — no gateway. Staff log amounts when activating memberships. |
| Messaging | Out of scope (WhatsApp handles it) |
| AI | Exercise suggestions (light, goal+recovery-based) + Macro generation for nutrition |
| Health | Apple HealthKit (iOS) + Google Health Connect (Android) — read-only, not stored in backend |

---

## Execution Order

Plans must be executed in order — each phase depends on the previous.

```
Phase 0 (Foundation) → Phase 1 (Admin Web) → Phase 2 (Trainer App) → Phase 3 (Client App)
```

---

## Phase 0 — Foundation
**Plan:** `docs/superpowers/plans/2026-05-04-phase-0-foundation.md`  
**Goal:** Auth + DB schema + role-gated API + all three app auth shells working end-to-end  
**Status:** ⬜ Not started

- [ ] Task 1: Spring Boot project scaffold
- [ ] Task 2: Database schema + Flyway migrations (branches, users)
- [ ] Task 3: JPA entities and repositories
- [ ] Task 4: Firebase Admin SDK initialisation
- [ ] Task 5: Firebase auth filter
- [ ] Task 6: Spring Security configuration
- [ ] Task 7: DTOs and exceptions
- [ ] Task 8: UserService + AuthController
- [ ] Task 9: BranchController
- [ ] Task 10: Dockerfile + Cloud Run config
- [ ] Task 11: React Native Client App auth shell
- [ ] Task 12: React Native Trainer App auth shell
- [ ] Task 13: Angular Admin Web auth shell
- [ ] Task 14: End-to-end smoke test

---

## Phase 1 — Admin Web
**Plan:** `docs/superpowers/plans/2026-05-04-admin-web.md`  
**Goal:** Branch Staff and Owner can manage members, trainers, payments, reminders, and view dashboards  
**Depends on:** Phase 0 complete  
**Status:** ⬜ Not started

- [ ] Task 1: Backend migrations — memberships, PT memberships, payment logs
- [ ] Task 2: Backend — Membership models, repos, service
- [ ] Task 3: Backend — MemberController (CRUD, activate/deactivate)
- [ ] Task 4: Backend — PT membership activation + app access gate
- [ ] Task 5: Backend — Payment logging endpoint
- [ ] Task 6: Backend — Trainer profile + ratings models
- [ ] Task 7: Backend — TrainerController
- [ ] Task 8: Backend — Stats/overview endpoint (branch-scoped + owner aggregate)
- [ ] Task 9: Backend — Reminder endpoint (push + WhatsApp trigger)
- [ ] Task 10: Backend — CSV/Excel import endpoint
- [ ] Task 11: Angular — App shell layout (sidebar nav, route guards per role)
- [ ] Task 12: Angular — Members list + search + filters
- [ ] Task 13: Angular — Member detail + membership activation form
- [ ] Task 14: Angular — PT membership activation + trainer assignment
- [ ] Task 15: Angular — Payment log form
- [ ] Task 16: Angular — Trainer management screens
- [ ] Task 17: Angular — Reminders compose + send
- [ ] Task 18: Angular — Branch Staff dashboard (single branch KPIs)
- [ ] Task 19: Angular — Owner dashboard (cross-branch KPIs, revenue chart, top trainers)
- [ ] Task 20: Angular — Branches management (Owner only)
- [ ] Task 21: CSV/Excel import UI

---

## Phase 2 — Trainer App
**Plan:** `docs/superpowers/plans/2026-05-04-trainer-app.md`  
**Goal:** Trainers can manage their schedule, clients, workout plans, nutrition plans, and view their profile/ratings  
**Depends on:** Phase 1 complete (members + trainers must exist in DB)  
**Status:** ⬜ Not started

- [ ] Task 1: Backend migrations — exercises master list, workout plans, plan days, plan exercises
- [ ] Task 2: Backend migrations — sessions, session logs, templates
- [ ] Task 3: Backend migrations — nutrition plans, meals, meal items
- [ ] Task 4: Backend — Exercise models + ExerciseController (search + filter by muscle group)
- [ ] Task 5: Backend — WorkoutPlan models + PlanController (CRUD, assign to client)
- [ ] Task 6: Backend — Session + SessionLog models + SessionController (start, log sets, end)
- [ ] Task 7: Backend — NutritionPlan models + NutritionController
- [ ] Task 8: Backend — AI exercise suggestion endpoint
- [ ] Task 9: Backend — AI macro generation endpoint
- [ ] Task 10: Backend — Trainer schedule endpoint (today's sessions)
- [ ] Task 11: Backend — Client progress endpoint (measurements + strength history)
- [ ] Task 12: React Native — 4-tab navigation scaffold
- [ ] Task 13: React Native — Today tab: schedule list (pending/active/finished states)
- [ ] Task 14: React Native — Focused client ring card + live session timer
- [ ] Task 15: React Native — Active session view (set logging + add exercise)
- [ ] Task 16: React Native — Clients tab: list with filters + client detail screen
- [ ] Task 17: React Native — Plan builder: week/day structure + exercise list
- [ ] Task 18: React Native — Plan builder: AI exercise suggestions
- [ ] Task 19: React Native — Nutrition plan builder + AI macro generation
- [ ] Task 20: React Native — Plan templates (save + fork)
- [ ] Task 21: React Native — Profile tab: trainer info + multidimensional ratings

---

## Phase 3 — Client App
**Plan:** `docs/superpowers/plans/2026-05-04-client-app.md`  
**Goal:** PT members can view their schedule, log workouts, track progress, view nutrition, and manage their profile  
**Depends on:** Phase 2 complete (trainer must have assigned plans)  
**Status:** ⬜ Not started

- [ ] Task 1: Backend — Muscle recovery computation endpoint
- [ ] Task 2: Backend — Client home endpoint (today's workout, streak, up next)
- [ ] Task 3: Backend — Body measurements CRUD (client logs + trainer logs)
- [ ] Task 4: Backend — Gym schedule endpoint (default time + per-day overrides + rest days)
- [ ] Task 5: Backend — Trainer leaderboard endpoint (by branch)
- [ ] Task 6: Backend — Client feedback / trainer rating submission
- [ ] Task 7: React Native — 5-tab navigation + onboarding flow
- [ ] Task 8: React Native — Onboarding: body profile form
- [ ] Task 9: React Native — Onboarding: trainer leaderboard + selection
- [ ] Task 10: React Native — Home tab: workout card + weekly streak
- [ ] Task 11: React Native — Home tab: Apple Health / Google Fit integration
- [ ] Task 12: React Native — Home tab: muscle recovery status chips
- [ ] Task 13: React Native — Workout tab: today's plan + weekly schedule
- [ ] Task 14: React Native — Active session view (shared with trainer — real-time sync)
- [ ] Task 15: React Native — Progress tab: body measurement charts
- [ ] Task 16: React Native — Progress tab: strength progress + attendance calendar
- [ ] Task 17: React Native — Nutrition tab: read-only diet plan view
- [ ] Task 18: React Native — Profile tab: membership info + gym schedule settings
- [ ] Task 19: Push notification wiring (FCM) across all apps
- [ ] Task 20: End-to-end integration test (full user journey)

---

## User-Specified Requirements (always check here first)

> This section is updated whenever the user explicitly asks for something to be tracked.

- [x] Planning complete before execution starts
- [x] All 4 phase plans written and reviewed by user before any code is executed
- [ ] PLAN.md checked off as tasks are completed during execution

---

## Key Decisions Log

| Decision | Choice | Reason |
|---|---|---|
| App architecture | 3 separate apps | Client and Trainer UX diverge significantly |
| Payments | In-person only | No payment gateway needed |
| Messaging | Out of scope | WhatsApp handles it; adds real-time complexity |
| Health integration | In scope v1 | Read-only from device, not stored in backend |
| AI scope | Exercise suggestions + macro generation | Light suggestions, not full plan generation |
| Backend hosting | Google Cloud Run | Free 2M req/mo, scales to zero, no idle cost |
| Database | PostgreSQL on Neon | Relational data model, free tier always-on |
| Auth | Firebase Auth | Handles Google/Apple/OTP, free tier generous |
| Mobile framework | React Native | Fits React knowledge, shared codebase iOS+Android |
| Admin framework | Angular | User's existing expertise, good for data dashboards |
| Multi-branch | Branch-scoped from day 1 | 7 branches now, targeting 100 |
| Staff payments | Staff log amounts | Powers MRR in Owner dashboard |
