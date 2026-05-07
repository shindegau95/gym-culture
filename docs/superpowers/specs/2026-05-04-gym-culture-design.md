# GymCulture Pro — Product Requirements Specification

**Owner:** thegymculture.in  
**Date:** 2026-05-04  
**Version:** 1.0  
**Status:** Draft — awaiting final review

---

## 1. Overview

GymCulture Pro is a three-app fitness platform for **thegymculture.in** — a multi-branch gym chain currently operating 7 branches (Kandivali, Borivali, Mira Road, Malad East, Orlem, Haridwar, Sundar Nagar) with a stated goal of 100 gyms in 5 years. The platform consists of:

- **Client App** (iOS + Android) — for gym members with active Personal Training (PT) membership
- **Trainer App** (iOS + Android) — for Personal Trainers
- **Admin Web** (Browser) — for Branch Staff and Owners

All three apps share a single backend API and database. Every data entity is branch-scoped from day one to support multi-branch scale.

> **Configuration constant:** The owner identifier `thegymculture.in` is stored as `OWNER_NAME` throughout the codebase and must be changeable from a single location.

---

## 2. User Personas

### 2.1 Client
A gym member who has paid for a membership at a branch. Clients are divided into two tiers:

- **General Member** — has paid gym membership (active or inactive). Exists in the system but does not get app access.
- **PT Member** — has opted into Personal Training on top of their gym membership. Gets access to the Client App only when their PT membership is active.

### 2.2 Trainer
A Personal Trainer employed at one or more branches of thegymculture.in. Has access to the Trainer App. Manages PT sessions, workout plans, nutrition plans, and client progress.

### 2.3 Admin — Branch Staff
A staff or reception member at a specific branch. Has access to the Admin Web app scoped to their branch only. Can manage members, trainers, send reminders, and log membership payments.

### 2.4 Admin — Owner (Super User)
An owner of thegymculture.in. Has access to the Admin Web app with visibility across all branches. There can be multiple owners. Owners see aggregate stats, revenue, trainer performance, and branch health.

---

## 3. Authentication

All three apps use the same authentication mechanism:

- **Google Sign-In** (OAuth 2.0)
- **Apple Sign-In** (iOS required)
- **Phone Number OTP** (Indian mobile numbers, via Firebase Auth)

**Provider:** Firebase Authentication  
**Backend validation:** Spring Boot validates Firebase ID tokens (JWT) on every API request via Spring Security. The token carries the user's UID, which is mapped to a role and branch in the application database.

**Role assignment:** Users are created in the system by Admin (Staff activates a member, Owner creates a trainer or staff account). A phone number or email that hasn't been assigned a role by Admin is shown a "Your account is pending activation" screen.

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Client App | React Native (iOS + Android) |
| Trainer App | React Native (iOS + Android) |
| Admin Web | Angular |
| Backend API | Java + Spring Boot (REST) |
| Database | PostgreSQL (hosted on Neon — free tier, always-on) |
| Authentication | Firebase Auth (Google, Apple, Phone OTP) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| WhatsApp / SMS | Twilio or Meta Cloud API (pay-per-message) |
| Backend Hosting | Google Cloud Run (containerised Spring Boot — free: 2M req/mo) |
| Admin/Web Hosting | Vercel or Netlify (free tier) |
| File Storage | Cloudflare R2 (avatars, progress photos — free: 10GB/mo egress) |
| AI Service | OpenAI API or equivalent (exercise suggestions + macro generation) |
| Health Integration | Apple HealthKit (iOS) + Google Fit / Health Connect (Android) |

### 4.1 Phase 0 Milestone
Before any feature work: Firebase Auth integrated with Spring Boot JWT validation, PostgreSQL schema with multi-branch data model, and role-based API endpoints. All three apps can authenticate and perform scoped reads/writes. No product features yet — just a verified, scalable foundation.

### 4.2 Infra Cost Model
The stack is effectively free until meaningful scale. Cloud Run charges only on request volume beyond the free tier. Neon scales to paid at 0.5GB. Firebase Auth phone OTP has a 10K/month free tier; Google/Apple sign-in is unlimited. The platform crosses into paid territory as real users join — no idle cost before launch.

---

## 5. Multi-Branch Data Model

Every core entity (members, trainers, sessions, plans) is scoped to a `branch_id`. The database schema enforces this. Branch Staff can only query/mutate data for their `branch_id`. Owners can query across all branches.

**Branches table** stores: id, name, address, city, created_at.  
**Users table** stores: id, firebase_uid, name, phone, email, role (CLIENT | TRAINER | STAFF | OWNER), branch_id (nullable for OWNER), created_at.

---

## 6. Data Import

Each branch can import existing member data via CSV or Excel upload in the Admin Web. The import maps columns to: name, phone, email, membership_type, membership_start, membership_end, pt_start, pt_end, trainer_assigned. Duplicate detection is by phone number.

---

## 7. Client App

### 7.1 Access Gate
A client only receives app access when:
1. Branch Staff activates a PT membership for them in the Admin Web.
2. The system sends a push notification and/or WhatsApp message inviting them to download and log in.
3. The client logs in and their PT membership is verified as active.

If the PT membership lapses, the app shows a "Your PT membership has expired" screen with a prompt to contact the gym. Data is retained.

### 7.2 Onboarding Flow
1. Sign in (Google / Apple / Phone OTP)
2. System verifies active PT membership — if none, show pending/expired screen
3. **Body Profile setup:** height (cm), weight (kg), body measurements (chest, waist, hips, arms, thighs in cm), body fat % (optional), fitness goal (Weight Loss / Muscle Gain / Body Recomposition / Endurance / General Fitness)
4. **Trainer Selection:** Browse trainer leaderboard for their assigned branch. See trainer name, photo, specialisation, and three independent rating dimensions (Experience, Client Feedback, Client Progress). Select a trainer.
5. Home screen unlocked.

### 7.3 Home Tab
- Personalised greeting with first name and date
- **Today's Workout Card:** trainer-assigned workout name, week/day indicator, exercises remaining, completion ring (% done). "Resume" or "Start" CTA.
- **Weekly Streak Tracker:** Mon–Sun attendance heatmap for the current week, with streak count
- **Today's Stats (from Apple Health / Google Fit):** calories burned, resting heart rate, active minutes, water intake
- **Up Next:** next scheduled workout day with exercise count and estimated duration
- **Muscle Recovery Status:** colour-coded chips for each muscle group — green (recovered) or red (hours remaining). Muscle groups tracked: Chest, Upper Back, Lower Back, Shoulders, Biceps, Triceps, Forearms, Quads, Hamstrings, Glutes, Calves, Core. Recovery is computed from the last session that trained that group.

### 7.4 Workout Tab
- **Today's Plan** (trainer-assigned): workout name, list of exercises with sets × reps × weight targets
- **Weekly Schedule:** Mon–Sun view showing assigned workout or rest day per day
- **Active Session View** (during a PT session):
  - Each exercise shown with set-by-set logging rows (set number, reps, weight, done checkbox)
  - "+ Add Exercise" — search by name or filter by muscle group
  - Both trainer and client can update the same session simultaneously (last-write-wins per set row)
- Rest days are shown distinctly and excluded from streak/completion calculations

### 7.5 Progress Tab
- **Body Measurements over time:** weight, body fat %, chest/waist/hip/arm/thigh — line charts
- **Strength Progress:** estimated 1RM per exercise over time (computed from logged sets)
- **Attendance Calendar:** heatmap of gym visits, colour intensity by workout volume

### 7.6 Nutrition Tab
- **Today's Diet Plan** (trainer-set, read-only for client): total calories, macros (protein/carbs/fat)
- **Meals breakdown:** Breakfast, Pre-workout, Lunch, Post-workout, Dinner — each with food items, quantities, and macros
- Clients cannot edit nutrition; they view what the trainer has set.

### 7.7 Profile Tab
- Name, photo, branch name
- Membership status (Active / Expired) and PT membership expiry date + sessions remaining
- **Gym Visit Schedule:** set a default daily visit time (e.g. 7:00 AM). Override any specific day with a different time. Mark specific days as rest days.
- Fitness goals and current body stats summary
- Assigned trainer name and photo

---

## 8. Trainer App

### 8.1 Home Tab (Today)
- Date header
- **Focused Client Ring Card** (shown when a session is active): client name, goal/focus area, live session timer, sessions count, active days, adherence %. Animated ring.
- **Client Avatar Row:** scrollable row of today's clients as avatar initials — tap to switch focused client
- **Search bar** to find a client quickly
- **Schedule List:** full day's sessions in chronological order. Each row shows time, duration, client avatar(s), client name (+N if multiple in slot), workout name. Visual states:
  - **Completed** — greyed out with checkmark
  - **Active** — highlighted row with live timer
  - **Pending** — default state
- **Quick Actions:** New Plan (build from template), Add Client (generates a QR code the client scans to self-register at the branch), AI Diet (generate macros), Reports (weekly summary)
- **Insights strip:** client adherence 7d and other key metrics

### 8.2 Clients Tab
- Count of active clients
- Search bar (by name, goal, plan name)
- Filter chips: All / On Plan / Flagged / New
- Client list rows: avatar, name, goal/focus, adherence score, last active, LIVE indicator if in session, Onboard CTA if new
- Tap a client → Client Detail screen:
  - Body profile and goals
  - Progress charts (same as client's Progress tab — weight, measurements, strength)
  - Assigned workout plan with ability to edit
  - Nutrition plan with ability to edit
  - Session history

### 8.3 Plan Tab
- **Plan Builder:**
  - Plan name, goal, length (weeks), days per week
  - Week day selector (Mon–Sun)
  - Per day: muscle group label (e.g. Lower · Quads · Glutes), reorderable exercise list
  - Each exercise: name, sets × reps (or time), RPE target, exercise type tag (Compound / Machine / Isolation / Bodyweight / Core)
  - "+ Add Exercise" with search + muscle group filter
  - AI suggestions: given the client's goal and today's muscle recovery status, the AI recommends exercises to include (light suggestions, not full plan generation)
- **Templates:** save any plan as a reusable template. Browse and fork from own templates when creating a new plan.
- **Nutrition Plan Builder:**
  - Total calories and macro targets (protein/carbs/fat)
  - Per meal: food items with portion sizes and macro contributions
  - **AI Macro Generation:** input client's goal, body weight, activity level → AI suggests calorie target and macro split. Trainer reviews and saves.

### 8.4 Profile Tab
- Trainer name, photo, branch(es)
- **Multidimensional Ratings** (three independent dimensions, each on their own scale):
  - **Experience** — based on years active and certifications (set by admin)
  - **Client Feedback** — aggregate of client ratings submitted after sessions
  - **Client Progress** — computed from clients' measured progress against their stated goals
- Session count, active clients count, tenure

---

## 9. Active Session — Shared Behaviour

During a PT session, both the Trainer App and the Client App show the active session view simultaneously:

- Exercise list from the assigned plan for that day
- Per exercise: set logging rows with reps, weight (kg), and done toggle
- Both trainer and client can tap into any set row and update it — last write wins per set
- "+ Add Exercise" available to both — search by name or filter by muscle group
- Session ends when trainer marks it complete or the scheduled duration elapses

---

## 10. Admin Web

### 10.1 Navigation
Sidebar with: Overview, Members, Trainers, Branches (Owner only), Reminders, Settings.

### 10.2 Overview Dashboard
**Owner view (all branches):**
- KPI cards: Active Members (total + this month delta), MRR (₹, vs previous month), Churn rate (rolling 90d), NPS (last survey)
- Monthly Revenue chart (12 months, all branches)
- Members by branch — colour-coded breakdown bar
- Top Trainers leaderboard (by client count, hours logged, rating)
- Recent Activity feed (sign-ups, renewals, cancellations, trainer changes)

**Branch Staff view (single branch):**
- KPI cards scoped to their branch: Active Members, PT Members, Sessions today, Expiring memberships this week
- Recent activity for that branch

### 10.3 Members
- Member list with search and filters (Active / Inactive / PT / Expiring)
- Member detail: personal info, membership history, PT history, payment log
- **Activate / Deactivate Membership:** staff sets membership type, start/end dates. Activation triggers a welcome push + WhatsApp to the client.
- **Activate PT Membership:** sets PT start/end, sessions total, assigned trainer. This grants the client app access.
- **Log Payment:** staff records payment amount, date, method (Cash / UPI / Card) when collecting fees. This feeds into the admin MRR tracking.
- **Send Reminder:** individual reminder via push + WhatsApp (e.g. membership expiring, missed sessions)
- **CSV / Excel Import:** bulk import member data for a branch

### 10.4 Trainers
- Trainer list with search
- Trainer detail: profile, assigned clients, session history, ratings breakdown
- Add / deactivate trainers per branch
- View trainer's plan templates

### 10.5 Branches (Owner only)
- Branch list: name, location, active members count, trainer count, MRR
- Add new branch
- Assign staff to branch

### 10.6 Reminders
- Compose and send bulk reminders to a filtered segment (e.g. "all members whose PT expires in 7 days")
- Channel: Push Notification + WhatsApp/SMS
- Scheduled sends supported

---

## 11. Notifications

| Trigger | Channel | Recipient |
|---|---|---|
| PT membership activated | Push + WhatsApp | Client |
| PT membership expiring (7 days) | Push + WhatsApp | Client |
| PT membership expired | Push | Client |
| Session scheduled (day before) | Push | Client |
| Admin bulk reminder | Push + WhatsApp/SMS | Target segment |
| New client assigned | Push | Trainer |
| Client logs a PR (personal record) | Push | Trainer |

---

## 12. AI Features

### 12.1 Exercise Suggestions
When a trainer is building or editing a workout plan, the AI receives: client's fitness goal, client's current muscle recovery status, and the exercises already in today's plan. It returns a ranked list of suggested exercises to add, with a short rationale for each (e.g. "Quad-dominant compound — supports hypertrophy goal, quads fully recovered").

### 12.2 Macro Generation
When a trainer opens the Nutrition Plan Builder and triggers "AI Diet", the AI receives: client's weight (kg), fitness goal, estimated activity level (Low / Moderate / High). It returns a suggested daily calorie target and macro split (protein/carbs/fat in grams). The trainer reviews, adjusts, and saves. The AI does not generate meal-level food items — that remains the trainer's expertise.

---

## 13. Apple Health / Google Fit Integration

The Client App requests permission to read from Apple HealthKit (iOS) and Google Health Connect (Android).

**Data read (not written by the app):**
- Active energy burned (kcal/day)
- Resting heart rate (bpm)
- Active minutes (min/day)
- Water intake (litres/day)
- Steps (optional)

This data is displayed on the Client Home screen under "Today's Stats". It is not stored on the platform's backend — read from the device on each app open.

---

## 14. Muscle Groups Reference

The following muscle groups are tracked for recovery status and used for exercise filtering:

| Group | Sub-groups |
|---|---|
| Chest | Pectorals (upper, mid, lower) |
| Back | Upper Back (traps, rhomboids), Lats, Lower Back (erectors) |
| Shoulders | Front Delt, Side Delt, Rear Delt |
| Arms | Biceps, Triceps, Forearms |
| Legs | Quads, Hamstrings, Glutes, Calves |
| Core | Abs, Obliques |

Recovery time defaults (configurable by admin): Chest 48h, Back 48h, Legs 72h, Shoulders 48h, Arms 24–48h, Core 24h.

---

## 15. Trainer Leaderboard (Client Trainer Selection)

Displayed during client onboarding and accessible from the client Profile tab. Shows all active trainers at the client's branch.

Each trainer card displays:
- Photo, name, specialisation tags
- Three rating dimensions (each shown as a score out of 5.0):
  - **Experience** (set by admin — certifications, years)
  - **Client Feedback** (average of client-submitted ratings)
  - **Client Progress** (system-computed from goal achievement metrics)
- Number of active clients
- A short bio (optional, trainer-written)

---

## 16. Out of Scope (v1)

- In-app payments or payment gateway integration (payments are in-person; app reflects status)
- Group classes
- In-app messaging / chat (WhatsApp handles trainer–client communication)
- Apple Health / Google Fit data write-back
- Video content or exercise demonstration videos
- Member-facing web portal
- Third-party gym management system API integration (CSV/Excel import covers this for v1; API integration is a future milestone)

---

## 17. Key Open Questions (Deferred)

- Which specific AI provider (OpenAI, Gemini, Claude) for exercise suggestions and macro generation? Requires evaluation of cost per call vs. quality at scale.
- Client feedback / rating submission flow — when and how does a client rate their trainer? (Post-session prompt, or any time from Profile?)
- Exact session scheduling model — does the trainer set the session time, or does it auto-derive from the client's gym visit schedule?
