# Vis — Product Requirements Specification

**Owner:** vis  
**Date:** 2026-05-04  
**Version:** 1.0  
**Status:** Draft — awaiting final review

---

## 1. Overview

Vis is a three-app fitness platform for **vis** — a multi-branch gym chain currently operating 7 branches (Kandivali, Borivali, Mira Road, Malad East, Orlem, Haridwar, Sundar Nagar) with a stated goal of 100 gyms in 5 years. The platform consists of:

- **Client App** (iOS + Android) — for gym members with active Personal Training (PT) membership
- **Trainer App** (iOS + Android) — for Personal Trainers
- **Admin Web** (Browser) — for Branch Staff and Owners

All three apps share a single backend API and database. Every data entity is branch-scoped from day one to support multi-branch scale.

> **Configuration constant:** The owner identifier `vis` is stored as `OWNER_NAME` throughout the codebase and must be changeable from a single location.

---

## 2. User Personas

### 2.1 Client
A gym member who has paid for a membership at a branch. Clients are divided into two tiers:

- **General Member** — has paid gym membership (active or inactive). Exists in the system but does not get app access.
- **PT Member** — has opted into Personal Training on top of their gym membership. Gets access to the Client App only when their PT membership is active.

### 2.2 Trainer
A Personal Trainer employed at one or more branches of vis. Has access to the Trainer App. Manages PT sessions, workout plans, nutrition plans, and client progress.

### 2.3 Admin — Branch Staff
A staff or reception member at a specific branch. Has access to the Admin Web app scoped to their branch only. Can manage members, trainers, send reminders, and log membership payments.

### 2.4 Admin — Owner (Super User)
An owner of vis. Has access to the Admin Web app with visibility across all branches. There can be multiple owners. Owners see aggregate stats, revenue, trainer performance, and branch health.

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

## 5. Multi-Branch & Multi-Tenant Data Model

Vis is a multi-tenant SaaS — each gym brand (e.g. "Vis Fitness", "Iron Den", "Cult Arena") operates as a separate tenant with its own branches, members, trainers, and revenue books. Within a tenant, every core entity (members, trainers, sessions, plans) is scoped to a `branch_id`. Cross-tenant data leakage is forbidden at every query layer.

**GymBrands table** (top-level tenant): id, name, slug, logo_url, primary_color, owner_user_id, plan_tier, created_at.  
**Branches table**: id, gym_brand_id, name, address, city, created_at.  
**Users table**: id, firebase_uid, gym_brand_id, name, phone, email, role (CLIENT | TRAINER | STAFF | OWNER | PLATFORM_ADMIN), branch_id (nullable for OWNER and PLATFORM_ADMIN), created_at.

Role scope inside a brand:
- `STAFF` / `TRAINER` / `CLIENT` — single branch within their brand.
- `OWNER` — all branches within their brand, but no visibility into other brands.
- `PLATFORM_ADMIN` — Vis internal staff; cross-brand observability for support, never edit access without an audit-logged impersonation request.

The `app.owner-name` config (currently `vis`) becomes a per-brand `gym_brand.slug` lookup; backend resolves brand from the authenticated user's `gym_brand_id` on every request.

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

**Visual metaphor — tension & progression** (see `docs/brand-ref/design_1.png` and `design_2.png`):

The Workout tab is the brand's signature canvas for the orb-as-organism metaphor. Each exercise card carries a *tension state* sphere alongside its set rows:

| Set state | Orb appearance | Animation |
|---|---|---|
| **At rest** (unstarted set) | smooth glossy sphere, neutral peach | gentle 6s breathing |
| **Under load** (active set in progress) | sphere squeezed taller, deeper saturation | pulse synced to expected rep tempo |
| **Peak tension** (last rep of last working set) | sphere with visible vertical stress lines, deepest rust shadow | tight, fast micro-shake |
| **Recovered** (set complete) | sphere settles to soft glow, faint orange halo | one-shot 800 ms ease-out settle |

Stacked orbs (concept #3 "Motion & progression") render in the weekly schedule strip — each day's completed volume contributes one orb layer ascending. The connection orb (concept #4) appears in the Active Session header when the trainer joins live — two orbs linked by a tension stem visualises the trainer↔client bond.

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

### 8.3 Plan Tab — Templates, Bespoke Plans, Real-Time Sync

The trainer's authoring model has two tracks: **templates** (reusable starting points) and **bespoke plans** (assigned to a specific client). Every assigned plan is a clone of either a template or another plan, then customised per client. Edits made by the trainer (any time — pre-session, mid-session, or off-session) must sync to the client's app in real time, and exercise logs made by the client must sync back to the trainer.

**Plan template builder** (not client-scoped):
- Template name, goal preset (Muscle Gain | Fat Loss | Strength | Body Recomp | Mobility)
- Length (weeks) and days/week
- Pattern tag (Push/Pull/Legs, Upper/Lower, Full-Body, Bro Split, custom)
- Per day: muscle group label, reorderable exercise list
- Per exercise: name, sets × reps (or time), RPE target, exercise type (Compound / Machine / Isolation / Bodyweight / Core), notes
- "+ Add Exercise" with search + muscle group filter
- AI suggestions: given goal and split, recommend exercises (light suggestions only, not full plan generation)
- Save / duplicate / archive

**Assigning a plan to a client**:
1. Trainer picks a template or a previously-assigned client plan → "Customise for [client]".
2. System creates a *bespoke plan* tied to `(client_id, trainer_id, gym_brand_id, branch_id)`.
3. Trainer edits the bespoke plan freely without affecting the source template.
4. Edits can change pattern (e.g. switch Push/Pull → Upper/Lower mid-cycle), add or remove muscle groups, add or remove exercises.

**Editing & ad-hoc changes during an active session**:
- Trainer can open the session screen and add or remove exercises *for today only* (these become an "ad-hoc overlay" on top of the plan day; the underlying plan is not mutated unless trainer chooses "Save to plan").
- Client sees the overlay within ~2 seconds via the real-time sync channel.
- Either side can log sets as they're completed; conflicts on the same set row follow last-write-wins.

**Off-session edits**:
- Trainer can edit a future day's plan from the Plan tab.
- Client's Workout tab reflects the new plan on next view; if the client is mid-day, an "Updated by Coach" banner appears and changes apply on next exercise transition.

**Sync model**:
- Real-time WebSocket channel per `(client_id, plan_id)` carries: `plan.exercises.added`, `plan.exercises.removed`, `plan.exercises.reordered`, `plan.dayPattern.changed`, `set.logged`, `set.updated`, `session.started`, `session.ended`, `notes.updated`.
- Polling fallback at 10 s interval if WS unavailable.
- Server is authoritative; both apps optimistically apply local writes then reconcile on ack.

**Nutrition plan builder**:
- Total calories and macro targets (protein/carbs/fat).
- Per meal: food items with portion sizes and macro contributions.
- **AI macro generation:** input client's goal, body weight, activity level → AI suggests calorie target and macro split. Trainer reviews and saves.
- Nutrition follows the same template + bespoke + sync pattern as plans.

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

## 17. UI Prototype & Brand Language (VIS-61)

A static Vite + React demo app in `prototype/` for showcasing the design to gym stakeholders before full implementation. No backend, no auth, all mock data. All three apps (Client, Trainer, Admin) share the same brand system defined below.

### 17.1 Brand Identity

The Vis identity is built around a single orange sphere paired with a custom lowercase "vis" wordmark. Brand-ref source: `docs/brand-ref/`.

**Logo concepts** (from `docs/brand-ref/`):
1. **Tension point** — the sphere is under controlled load; strength comes from restraint, not force.
2. **Hidden "V" in the form** — negative space inside the sphere implies victory and vitality.
3. **Motion & progression** — stacked, layered orbs hint at upward growth.
4. **Connection & collaboration** — two orbs connected by a stem symbolise trainer ↔ client alignment.
5. **Custom typography** — the dot above the "i" is replaced by the orange orb; the "v" is a sharp 45° wedge; the "s" has tight horizontal terminals.

The sphere is the *only* repeating visual icon in the system. Avoid introducing other illustrative motifs.

### 17.2 Color System — Warm Orange Family Only

Restraint is the rule: limit accent variation to gradients within the logo's warm orange spectrum plus neutral grays. Semantic colors (good/warn/bad) are kept muted so the brand orange always leads.

**Warm orange palette** (light → dark):

| Token | Hex | Use |
|---|---|---|
| `--vis-peach`     | `#FFD1A8` | Top-light highlight on orb / light-theme gradient start |
| `--vis-coral`     | `#FF8A5C` | Soft accent, hover states |
| `--vis-flame`     | `#FF6A2C` | Dark-theme primary accent |
| `--vis-ember`     | `#F25A1F` | Light-theme primary accent (logo core) |
| `--vis-rust`      | `#C44510` | Mid-shadow on orb |
| `--vis-burnt`     | `#8A2E08` | Deep shadow, dark-theme gradient end |
| `--vis-charcoal`  | `#1B0F08` | Background tint, dark theme |

**Gradients**:

```css
/* Orb (logo sphere) — radial, used wherever the brand mark appears */
--vis-orb: radial-gradient(circle at 32% 28%, #FFD1A8 0%, #FF8A5C 35%, #F25A1F 65%, #8A2E08 100%);

/* Light theme — peach to ember (soft, airy) */
--vis-grad-light: linear-gradient(135deg, #FFD1A8 0%, #FF8A5C 45%, #F25A1F 100%);

/* Dark theme — flame to burnt (moody, glowing) */
--vis-grad-dark:  linear-gradient(135deg, #FF8A5C 0%, #F25A1F 50%, #8A2E08 100%);

/* Surface glow — soft alpha gradient for cards */
--vis-grad-soft-light: linear-gradient(135deg, rgba(255,138,92,0.10), rgba(242,90,31,0.10));
--vis-grad-soft-dark:  linear-gradient(135deg, rgba(255,138,92,0.16), rgba(138,46,8,0.20));
```

**Rule of restraint:** A screen should rarely use more than one orange gradient surface at full saturation. Secondary surfaces use the *soft* variants. Pure white and black are forbidden — always use warm-tinted neutrals (`#FAF6F2` on light, `#0F0A07` on dark).

### 17.3 Typography

Use **Geist** (sans) for display + UI body and **Geist Mono** for tabular/numeric values. Geist is geometric, smooth, with humanist proportions — closest free match to the custom "vis" wordmark's character. Hosted via Google Fonts.

```css
--vis-font-display: 'Geist', -apple-system, system-ui, sans-serif;
--vis-font-ui:      'Geist', -apple-system, system-ui, sans-serif;
--vis-font-mono:    'Geist Mono', 'SF Mono', ui-monospace, Menlo, monospace;
```

**Type scale** (4px baseline grid, smooth via `-webkit-font-smoothing: antialiased` + `text-rendering: optimizeLegibility`):

| Token | Size / Line | Weight | Letter-spacing |
|---|---|---|---|
| Display XL | 40 / 44 | 600 | -0.02em |
| Display    | 28 / 32 | 600 | -0.015em |
| Title      | 20 / 26 | 600 | -0.01em |
| Body       | 15 / 22 | 400 | 0 |
| Caption    | 13 / 18 | 500 | 0.005em |
| Eyebrow    | 11 / 14 | 600 | 0.08em (UPPER) |
| Numeric    | varies  | 500 | 0 (Geist Mono, tabular) |

**Spacing scale** (use only): `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 72`. No off-grid values.

### 17.4 Liquid Glass Design Language

Vis surfaces follow Apple's **Liquid Glass** material system (iOS 26 / macOS 26): translucent, refractive panels that float above content, with motion that suggests the movement of a liquid drop. Reference: [Apple liquid glass design](https://medium.com/@expertappdevs/liquid-glass-2026-apples-new-design-language-6a709e49ca8b).

**Core principles** (apply *appropriately*, not everywhere):

1. **Content leads.** Glass is the chrome around content, never the content itself. Lists, charts, and data stay on solid surfaces; only navigation, controls, modals, and "hero" cards use glass.
2. **Contextual blur.** `backdrop-filter: blur(20–40px) saturate(140%)` adapts to what's behind it. A glass nav over a warm photo absorbs that warmth; over the bg gradient it picks up the orange glow.
3. **Refractive edges.** Each glass surface has a 1px inner highlight (`inset 0 1px 0 rgba(255,255,255,0.18)`) and a 1px outer hairline (`0 0 0 0.5px rgba(255,255,255,0.10)`) to suggest a lens edge.
4. **Specular highlights.** Concave/convex hint via a soft gradient overlay (top: white-alpha 12% → 0).
5. **Motion responsiveness.** Glass elements gently `transform: translateY(-1px)` on hover and `scale(0.98)` on active. Cards "breathe" with a 4–6s opacity/scale loop on idle hero surfaces only. Avoid page-wide motion that competes with content.
6. **Accessibility fallback.** Honour `@media (prefers-reduced-transparency: reduce)` and `(prefers-reduced-motion: reduce)` — collapse glass to solid neutrals and disable breathing/shimmer loops.

**Where to use glass:**
- Top navigation bar, bottom tab bar (always)
- Session-active "hero" card (Client home, Trainer focused-client)
- Modals, sheets, alerts
- Pinned filter chips, search field
- Live indicators (timer ring, "Live" pill)

**Where NOT to use glass:**
- Tables, lists, dense data rows
- Body paragraphs, captions
- Charts and progress bars (must be solid for legibility)
- Settings forms

**Sample CSS:**

```css
.vis-glass {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%),
    var(--vis-grad-soft-dark);             /* warm tint shows through */
  backdrop-filter: blur(28px) saturate(150%);
  -webkit-backdrop-filter: blur(28px) saturate(150%);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.16),
    0 0 0 0.5px rgba(255,255,255,0.10),
    0 24px 60px -20px rgba(138,46,8,0.45);
}
```

### 17.5 Animation Language

Keep motion purposeful and warm — never showy.

- **Easing default:** `cubic-bezier(0.32, 0.72, 0, 1)` (Apple's spring-like out-curve).
- **Duration scale:** micro `120ms` · short `200ms` · medium `360ms` · long `560ms`.
- **Breathing loops** (hero hero card only): 5s alternate `opacity 1 → 0.94`, `scale 1 → 1.005`.
- **Shimmer** on the orb logo: a 6s slow diagonal sweep of a 12%-alpha highlight.
- **Page transitions:** 240ms fade + 4px translateY-in.
- **Number tickers:** count-up over 360ms with `ease-out`.
- **Touch feedback:** opacity 1 → 0.85 in 80ms, then back.

Respect `prefers-reduced-motion: reduce` — collapse all loops, keep only enter/exit fades.

### 17.6 Theme Strategy

| Theme | Bg | Primary gradient | Card surface | Text |
|---|---|---|---|---|
| **Light** | `#FAF6F2` (warm cream) | `--vis-grad-light` (peach → ember) | white + warm tint, glass on hero only | `#1B0F08` |
| **Dark**  | `#0F0A07` (warm charcoal) | `--vis-grad-dark` (flame → burnt) | `#1A1108` + glass | `#FAF6F2` |

Both themes share the *same* orange family — only luminance and gradient direction shift. Never introduce cool-tone accents.

### 17.7 Prototype Structure

Top tab bar switches between the three apps. Client and Trainer apps render inside a 375×812 phone frame. Admin Web fills the full browser viewport.

**Screens to prototype** (subset of the full spec — all content from sections above):

| App | Screens |
|---|---|
| Client App | Home, Workout, Active Session, Progress, Nutrition |
| Trainer App | Today, Clients, Client Detail, Plan Builder, Nutrition Builder, Profile |
| Admin Web | Owner Dashboard, Staff Dashboard, Members List, Member Detail, Trainers |

Admin Web shows both Staff view (single branch) and Owner view (cross-branch) via a role toggle in the header.

**Mock data profiles:**
- Clients: Arjun Mehta (Kandivali, Muscle Gain), Priya Shah (Borivali, Weight Loss), Rahul Desai (Mira Road, Body Recomposition)
- Trainers: Vikram Nair (Kandivali, Strength & Hypertrophy), Sneha Kulkarni (Borivali, Weight Loss & Endurance)
- All monetary amounts in ₹ (membership ₹2,500/mo, PT ₹8,000/mo)

**Clickable flows:** Home → Active Session, Workout → Active Session, Trainer Today → Client Detail, Trainer Clients → Client Detail, Admin Members list → Member Detail.

---

## 18. Key Open Questions (Deferred)

- Which specific AI provider (OpenAI, Gemini, Claude) for exercise suggestions and macro generation? Requires evaluation of cost per call vs. quality at scale.
- Client feedback / rating submission flow — when and how does a client rate their trainer? (Post-session prompt, or any time from Profile?)
- Exact session scheduling model — does the trainer set the session time, or does it auto-derive from the client's gym visit schedule?
