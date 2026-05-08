# GymCulture Pro — UI Prototype Design Spec

**Linear Issue:** GC-61  
**Date:** 2026-05-09  
**Status:** Approved  

---

## Goal

Build a static Vite + React prototype that visualises the GymCulture Pro design to stakeholders at thegymculture.in before full implementation begins. Demonstration only — no backend, no auth, no real data.

---

## Design Decisions

| Decision | Choice |
|---|---|
| Visual style | Dark Gradient — deep dark backgrounds, red-orange gradient accents (#E53935 → #ff6b35), glassmorphism cards |
| Top-level switcher | Top tabs (Client App / Trainer App / Admin Web) — always visible, one click to jump |
| Mobile frame | 375×812 phone frame centred on screen for Client and Trainer apps |
| Admin layout | Full browser viewport with sidebar nav |
| Prototype depth | Rich — 5–7 screens per app with clickable navigation flows |
| Admin roles shown | Both Staff view (branch-scoped) and Owner view (cross-branch) |

---

## Tech Stack

- **Vite + React** (TypeScript optional, JS fine for prototype speed)
- **React Router v6** — top-level tabs + sub-routes per app
- **No external UI library** — custom CSS matching the dark gradient design
- **No backend** — all data hardcoded in mock data files
- All in `prototype/` directory in the project root

---

## Mock Data

Three realistic profiles seeded throughout all screens:

**Clients:**
- Arjun Mehta — Kandivali branch, Goal: Muscle Gain, Trainer: Vikram
- Priya Shah — Borivali branch, Goal: Weight Loss, Trainer: Sneha
- Rahul Desai — Mira Road branch, Goal: Body Recomposition, Trainer: Vikram

**Trainers:**
- Vikram Nair — Kandivali, specialisation: Strength & Hypertrophy, 4.8★ experience
- Sneha Kulkarni — Borivali, specialisation: Weight Loss & Endurance, 4.6★ experience

**Branches:** Kandivali, Borivali, Mira Road, Malad East, Orlem, Haridwar, Sundar Nagar

**Amounts:** All in ₹ (INR). Membership ₹2,500/mo, PT ₹8,000/mo.

---

## Screen Map

### Client App (phone frame 375×812)

Bottom tab nav: Home · Workout · Progress · Nutrition · Profile

| Screen | Route | Key Content |
|---|---|---|
| **Home** | `/client/home` | Personalised greeting, today's workout card with progress ring (68%), weekly streak heatmap Mon–Sun, health stats (kcal/bpm/active mins), muscle recovery chips (colour-coded) |
| **Workout** | `/client/workout` | Today's plan — exercise list with sets×reps×weight targets, weekly schedule Mon–Sun, "Start Session" CTA |
| **Active Session** | `/client/session` | Live set-logging table (set / reps / weight / ✓), session timer, "+ Add Exercise" button, "End Session" CTA |
| **Progress** | `/client/progress` | Body weight line chart (3 months), body fat % chart, strength progress for Bench Press + Squat, attendance heatmap |
| **Nutrition** | `/client/nutrition` | Daily macro ring (protein/carbs/fat), meals breakdown: Breakfast → Pre-workout → Lunch → Post-workout → Dinner with food items and gram amounts |

---

### Trainer App (phone frame 375×812)

Bottom tab nav: Today · Clients · Plans · Profile

| Screen | Route | Key Content |
|---|---|---|
| **Today** | `/trainer/today` | Focused client ring card (animated ring, session timer), client avatar row, schedule list with pending/active/done states, quick actions strip |
| **Clients** | `/trainer/clients` | Client count, search bar, filter chips (All / On Plan / Flagged), client list rows with adherence score and LIVE indicator |
| **Client Detail** | `/trainer/clients/:id` | Body profile summary, progress snapshot, assigned plan name, nutrition plan name, session history list |
| **Plan Builder** | `/trainer/plans/builder` | Plan name + goal + weeks, week/day selector, exercise list per day (sets×reps, RPE, muscle group tag), "+ Add Exercise", AI suggestions button (static mock result) |
| **Nutrition Builder** | `/trainer/nutrition/builder` | Total kcal + macro targets, per-meal food items, "Generate with AI" button showing mock macro suggestion |
| **Profile** | `/trainer/profile` | Trainer photo + name + branch, three rating bars (Experience / Client Feedback / Client Progress), session count, active clients count |

---

### Admin Web (full browser viewport)

Sidebar nav: Overview · Members · Trainers · Branches (Owner only)

Role switcher in the header — toggle between **Staff view** (Kandivali branch) and **Owner view** (all branches). This controls what the dashboard and member list show.

| Screen | Route | Role | Key Content |
|---|---|---|---|
| **Owner Dashboard** | `/admin/overview` | Owner | KPI cards: Active Members (847 +12%), MRR ₹21.4L (+8%), Churn 3.2%, NPS 72. Monthly revenue bar chart (12 months). Members by branch stacked bar. Top trainers leaderboard. Recent activity feed. |
| **Staff Dashboard** | `/admin/overview` | Staff | KPI cards scoped to Kandivali: Active Members 124, PT Members 38, Sessions Today 12, Expiring This Week 5. Recent activity for branch. |
| **Members List** | `/admin/members` | Both | Search bar, filter tabs (Active / Inactive / PT / Expiring), member table with name / branch / membership type / expiry / status badge |
| **Member Detail** | `/admin/members/:id` | Both | Personal info, membership history, activate PT membership form (trainer dropdown, start/end date, sessions count), log payment form (amount / method / date), send reminder button |
| **Trainers** | `/admin/trainers` | Owner | Trainer list with branch, rating, active clients. Trainer detail panel with ratings breakdown and assigned clients list. |

---

## Navigation Flows (clickable paths in prototype)

- Client Home → tap "Start Session" → Active Session
- Client Workout → tap exercise → Active Session
- Trainer Today → tap client in schedule → Client Detail
- Trainer Clients → tap client row → Client Detail
- Admin Members list → tap member row → Member Detail
- Admin role toggle (Staff ↔ Owner) → Dashboard re-renders with correct scope

---

## Design Tokens

```css
--bg-primary: linear-gradient(135deg, #1a0a0a 0%, #0d0d1a 100%);
--bg-card: rgba(255, 255, 255, 0.07);
--border-card: rgba(255, 255, 255, 0.08);
--accent-gradient: linear-gradient(135deg, #E53935, #ff6b35);
--text-primary: #ffffff;
--text-secondary: rgba(255, 255, 255, 0.5);
--text-muted: rgba(255, 255, 255, 0.3);
--success: #4CAF50;
--warning: #FF9800;
--radius-card: 12px;
--radius-sm: 8px;
```

---

## Deliverable

Single Vite + React app in `prototype/`. Running via `npm run dev`. No build/deploy required for the demo — stakeholders view it locally or via a shared dev server.

---

## Out of Scope for Prototype

- Real Firebase auth
- Any API calls
- Apple Sign-In / Phone OTP UI
- Push notifications
- CSV import UI
- Onboarding flow (trainer selection, body profile)
- Settings screens
