# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Required Skills

Always invoke these skills before any frontend or coding work — no exceptions:

- **`/frontend-design:frontend-design`** — invoke before building or modifying any UI component, screen, or layout. Establishes aesthetic direction, design quality bar, and animation/typography standards.
- **`/karpathy-guidelines`** — invoke before any implementation task. Enforces simplicity-first thinking, surgical edits, and goal-driven execution to avoid common LLM coding mistakes.

Both skills must be invoked at the start of the task, not after. If a task touches both design and code (which most tasks in this project do), invoke both.

- **`/caveman`** — invoke at the start of every session, no exceptions. Reduces token usage by ~75% by dropping filler words while preserving full technical accuracy.

---

## Linear Issue Workflow

Whenever the user asks to work on any issue:

1. **Fetch the issue** from Linear using the MCP tools (`get_issue`) to load the full description and acceptance criteria.
2. **Set status to "In Progress"** (`save_issue`) before starting work.
3. **Implement** the feature/fix, verifying each acceptance criterion as you go.
4. **Set status to "In Review"** once implementation is complete and all acceptance criteria are met.

Never start coding without first fetching and reading the Linear issue.

---

## Commit Convention

Every commit message **must** be prefixed with the Linear story number in the format `GC-<story-number>: <message>`. Ask the user for the story number if it is not known. Always push after committing.

Example: `GC-42: add user authentication filter`

---

## Self-Correction Protocol

Whenever you make a mistake in this project — wrong assumption, incorrect tool usage, bad approach, or anything the user corrects — immediately add a lesson to the **Lessons Learned** section at the bottom of this file. Format:

```
- **[Category]** What went wrong → What to do instead.
```

Do this before moving on. The goal is that future sessions never repeat the same mistake.

---

## Resume Instructions

If context is lost mid-session, read `PLAN.md` first, then the spec at `docs/superpowers/specs/2026-05-04-gym-culture-design.md`, then the plan file for the current phase. Pick up from the first unchecked task.

Phase plans are in `docs/superpowers/plans/`:
- `2026-05-04-phase-0-foundation.md` — auth + DB schema + all three app shells
- `2026-05-04-admin-web.md` — Angular admin web
- `2026-05-04-trainer-app.md` — React Native trainer app
- `2026-05-04-client-app.md` — React Native client app

Phases must execute in order (0 → 1 → 2 → 3). Check `PLAN.md` for current status.

---

## Project Structure

```
backend/          Java 21 + Spring Boot 3 REST API
client-app/       React Native — PT member app (iOS + Android)
trainer-app/      React Native — Personal Trainer app (iOS + Android)
admin-web/        Angular — Branch Staff and Owner web app
```

---

## Build & Run Commands

### Backend (`backend/`)

```bash
# Start local PostgreSQL
docker-compose up -d

# Run the backend
export DATABASE_URL=jdbc:postgresql://localhost:5432/gymculture
export DATABASE_USER=gymculture
export DATABASE_PASSWORD=gymculture
export FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
export FIREBASE_PROJECT_ID=your-firebase-project-id
mvn spring-boot:run

# Run all tests
mvn test

# Run a single test class
mvn test -Dtest=FirebaseAuthFilterTest

# Run a single test method
mvn test -Dtest=UserServiceTest#getByFirebaseUid_existingUser_returnsResponse

# Build Docker image
mvn package -DskipTests
docker build -t gymculture-backend .

# Run Flyway migrations manually
mvn flyway:migrate
```

### React Native Apps (`client-app/`, `trainer-app/`)

```bash
cd client-app  # or trainer-app

# Install dependencies
npm install
npx pod-install  # iOS only

# Run on iOS simulator
npx react-native run-ios

# Run on Android emulator
npx react-native run-android

# Start Metro bundler
npx react-native start
```

### Admin Web (`admin-web/`)

```bash
cd admin-web
npm install

# Dev server
ng serve

# Build for production
ng build --configuration production

# Run tests
ng test

# Run a single spec
ng test --include='**/firebase.service.spec.ts'
```

---

## Key Architecture

### Authentication Flow

Firebase Auth issues tokens in all three apps. Every API request includes `Authorization: Bearer <firebase-id-token>`. The backend `FirebaseAuthFilter` validates the JWT, extracts the Firebase UID, then `UserService` looks up the user's role and branch in PostgreSQL and attaches it to the Spring Security context.

A user with a valid Firebase token but no matching database record is treated as pending (not registered by admin yet).

### Multi-Branch Scoping

Every core entity is scoped to a `branch_id`. The roles enforce query scope:
- `STAFF` — can only read/write data for their `branch_id`
- `TRAINER` — same branch scope
- `CLIENT` — same branch scope
- `OWNER` — no branch filter, sees all branches

Branch enforcement is applied at the service layer, not controller layer.

### Backend Package Structure

```
in.gymculture/
  config/       FirebaseConfig, SecurityConfig, CorsConfig
  filter/       FirebaseAuthFilter (validates JWT, sets SecurityContext)
  model/        JPA entities (Branch, User, ...)
  enums/        Role (CLIENT | TRAINER | STAFF | OWNER)
  repository/   Spring Data JPA repositories
  service/      Business logic + branch enforcement
  controller/   REST endpoints
  dto/          Request/response records
  exception/    GlobalExceptionHandler, typed exceptions
```

### Testing Approach

- Unit tests: Mockito for services and filter logic
- Controller tests: `@WebMvcTest` slice tests with `MockBean` — Firebase filter is mocked to skip JWT validation
- Integration tests: Testcontainers PostgreSQL (configured via `spring.datasource.url=jdbc:tc:postgresql:16:///gymculture` in `application-test.properties`)

### Firebase Config Files

Firebase config is not stored in code:
- Android: `google-services.json` → `android/app/`
- iOS: `GoogleService-Info.plist` → `ios/`
- Backend: `firebase-service-account.json` in `backend/` (gitignored)

### Key Constants

- `app.owner-name=thegymculture.in` in `application.properties` — change in one place for a different gym chain
- Backend API base URL in React Native apps is `http://localhost:8080` in dev, Cloud Run URL in production
- Angular environments are in `admin-web/src/environments/`

### Active Session Real-Time Sync

Both Trainer App and Client App can update the same session simultaneously (set rows). The spec specifies last-write-wins per set row. This is not yet implemented — flag the approach (polling vs WebSocket) when reaching Phase 2/3.

---

## Out of Scope (v1)

- In-app payments or payment gateway (payments are in-person; staff log amounts in Admin Web)
- Group classes
- In-app messaging (WhatsApp handles trainer–client communication)
- Apple Health / Google Fit data write-back (read-only on device, not stored in backend)
- Video content
- Member-facing web portal

---

## Lessons Learned

- **Prototype styling** Used inline `style={{}}` objects throughout all JSX components → Write all static styles in CSS modules (`.module.css`). Only use inline styles for truly dynamic computed values (percentage widths, SVG dashoffsets, data-driven color selection). Use CSS custom properties (`var(--gc-*)`) for all token values so the cascade does the work.

- **Linear MCP** `save_cycle` does not exist — the MCP server only supports `save_milestone`. To create actual Cycles (sprints), the user must create them in the Linear web UI; then issues can be assigned via MCP. Do not promise cycle-based sprints without confirming the tool exists first.
- **Linear issue list size** Fetching all team issues with `list_issues` at limit 250 can exceed token limits (~87K chars). Fetch by project or filter by specific criteria instead of pulling the full team backlog at once.
- **Linear title consistency** When creating issues across phases, verify the separator convention (colon vs dash) matches all other issues in the same phase before saving. Inconsistencies require a second pass of `save_issue` calls to fix.
