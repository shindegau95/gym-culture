# Phase 0 — End-to-End Smoke Test (VIS-30)

Manual verification that all three apps (Admin Web, Client App, Trainer App) can authenticate against the local backend before Phase 1 starts.

## Prerequisites

- All Sprint 1 + Sprint 2 issues green (VIS-17 → VIS-29 + VIS-62).
- Firebase project `vis-prod` provisioned per VIS-62 with:
  - `backend/firebase-service-account.json` placed
  - `client-app/android/app/google-services.json` + `client-app/ios/ClientApp/GoogleService-Info.plist` placed
  - `trainer-app/android/app/google-services.json` + `trainer-app/ios/TrainerApp/GoogleService-Info.plist` placed
  - `admin-web/src/environments/environment.ts` filled in with `firebaseConfig`
  - `client-app/src/config.ts` and `trainer-app/src/config.ts` `googleWebClientId` filled in
- Three Google accounts to stand in for Staff / Trainer / Client roles (or one account that you re-use across simulators after each `Sign out` — Firebase users are scoped per-app, so this works fine for smoke purposes).

## Step 1 — Backend

```bash
cd backend
docker compose up -d
export DATABASE_URL=jdbc:postgresql://localhost:5432/vis
export DATABASE_USER=vis
export DATABASE_PASSWORD=vis
export FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
export FIREBASE_PROJECT_ID=vis-prod
mvn flyway:migrate
mvn spring-boot:run
```

Expect logs:
- `FirebaseApp initialized for project 'vis-prod'`
- `Started VisApplication`

Sanity-check the health endpoint:

```bash
curl -s http://localhost:8080/actuator/health
# {"status":"UP"}
```

## Step 2 — First sign-in to capture Firebase UIDs

Each role's UID has to be captured *after* its corresponding app signs that Google account into Firebase for the first time. This produces the "Pending" state in every app — that's expected.

For each app, sign in once, then visit Firebase Console → Authentication → Users tab to copy the freshly-created UID.

| Role     | App                      | Where the UID lands                                                          |
| -------- | ------------------------ | ---------------------------------------------------------------------------- |
| STAFF    | Admin Web (`localhost:4200`) | Sign in with `staff.test@vis` → "Account Pending" card → Firebase Console |
| TRAINER  | Trainer App iOS sim      | Sign in with `trainer.test@vis` → `PendingScreen`               |
| CLIENT   | Client App iOS sim       | Sign in with `client.test@vis` → `PendingScreen`                |

## Step 3 — Insert the user rows

Open `docs/smoke-test/users.sql` and replace the three `REPLACE_WITH_*_UID` placeholders with the UIDs captured in Step 2. Then run:

```bash
docker exec -i vis-postgres psql -U vis -d vis < docs/smoke-test/users.sql
```

Expect three rows in the `users` table with `role` = STAFF, TRAINER, CLIENT respectively, all on `branch_id = 1` (Kandivali).

## Step 4 — Re-verify each app

| Scenario | App | Expected |
| -------- | --- | -------- |
| 1 | Admin Web — refresh `/dashboard` | HTTP 200 to `/auth/me`, the JSON card renders with `role: STAFF`, `branchName: Kandivali`. No console errors. |
| 2 | Client App — kill + relaunch | `HomeShell` shows `Hey, Test`, account card lists `CLIENT` and `Kandivali`. |
| 3 | Trainer App — kill + relaunch | `HomeShell` shows the orange banner `Trainer App — Phase 0 auth verified.`, account card lists `TRAINER`. |

DevTools / native logs:
- All `/auth/me` requests carry `Authorization: Bearer <jwt>`.
- No `401` or `403` responses anywhere.
- No JS exceptions or red-screen errors on either RN app.

## Step 5 — Tag Phase 0 complete

Once all three scenarios pass:

```bash
git tag -a phase-0-complete -m "Phase 0 — Foundation complete (VIS-17..VIS-30)"
git push origin phase-0-complete
```

Then move VIS-30 in Linear from In Review → Done. Sprint 2 is sealed; Phase 1 (Admin Web) is unblocked.

## Troubleshooting

- **Admin Web shows "Account Pending" forever after Step 3** — `/auth/me` is being cached. Hard-refresh (Cmd+Shift+R) or sign out + back in. The `/auth/me` request fires once on Dashboard mount.
- **`401` from `/auth/me`** — token expired (Firebase ID tokens last 1h). Sign out + back in. If it persists, check `FIREBASE_PROJECT_ID` env var matches the project that issued the token.
- **`Connection refused` on `localhost:8080` from Android emulator** — the emulator can't reach `localhost`; `client-app/src/config.ts` already routes Android to `10.0.2.2:8080`, so just confirm you're on the latest commit.
- **`409`/duplicate key on `users` insert** — the user signed in on more than one app with the same Google account, generating a single Firebase UID. The `ON CONFLICT (firebase_uid) DO UPDATE` clause in `users.sql` handles this; just ensure all three placeholder UIDs are distinct (sign in with three different Google accounts) before re-running.
