# Progressive Overload + Last-Session History — Design

**Status:** Draft
**Date:** 2026-05-18
**Linear:** parent issue to be created (sub-issues per phase cut on implementation plan)
**Supersedes:** Section 7.4 "Today's Plan" Target column in `2026-05-04-vis-design.md` (replaces static `weight` field with dynamic per-client target + history surface).

---

## 1. Problem

The current workout plan shows a static `Target` column (e.g., `Bench Press · 90 kg`). Two gaps:

1. The target never adapts to what the client actually did. No progressive overload — the client either grinds the same number forever or has to negotiate every bump with the trainer manually.
2. The client has zero context for what they did last time. Walking up to the bar, they have to remember whether they hit 90×8 or 92.5×7 last session and how it felt.

We need (a) an AI-driven target that bumps reps first, then weight, based on actual history, and (b) a way to surface "what you did last time" inline at the moment the client is about to start the set.

## 2. Goals

- AI computes the next target on session-end, server-side, for every exercise the client just performed.
- AI biases rep-progression first, weight-bump second (matches hypertrophy convention; predictable to the client).
- AI auto-publishes to the client; trainer can override any target any time. Trainer override pins the exercise (AI stops auto-bumping until re-enabled).
- Client sees last-session per-set stats inside Active Session ("Up next" card + tap-to-expand sheet) for every exercise.
- First-time exercise: AI suggests a starting weight from client profile, marked clearly.
- Partial history (last session had fewer sets than today's plan): show completed sets; missing sets render as dotted "extrapolated" placeholders.
- All AI calls are cheap, debuggable, and replayable.

## 3. Non-goals (v1)

- Muscle-recovery score as AI input.
- Cross-exercise proxy ("never did incline; show flat as similar pattern").
- Deload-week auto-detection.
- RPE auto-derivation from rep tempo / bar-speed.
- Trainer approval queue / pending state.
- Group-set AI adjustments mid-session.

## 4. Architecture

### 4.1 Data model (Postgres, new Flyway migration)

All tables scoped to `branch_id` per existing convention.

**`exercise_session_log`** — append-only per-set record.

| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `branch_id` | bigint NOT NULL | scope |
| `client_id` | bigint NOT NULL | FK users(id) |
| `exercise_id` | bigint NOT NULL | FK exercises(id) |
| `session_id` | bigint NOT NULL | FK workout_sessions(id) |
| `set_idx` | smallint NOT NULL | 1-based |
| `weight_kg` | numeric(6,2) | nullable for bodyweight |
| `reps` | smallint | 0 if attempted-but-failed |
| `rpe` | numeric(3,1) | nullable (RPE 1.0–10.0) |
| `completed` | bool NOT NULL | true if rep ≥ 1, else attempted-failed |
| `completed_at` | timestamptz NOT NULL | |

Indexes: `(client_id, exercise_id, completed_at DESC)`, `(session_id)`.

**`exercise_target`** — current target per `(client, exercise)`. Upserted by AI runs and trainer edits.

| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `branch_id` | bigint NOT NULL | scope |
| `client_id` | bigint NOT NULL | FK users(id) |
| `exercise_id` | bigint NOT NULL | FK exercises(id) |
| `weight_kg` | numeric(6,2) | nullable for bodyweight |
| `reps_low` | smallint NOT NULL | inclusive |
| `reps_high` | smallint NOT NULL | inclusive |
| `sets` | smallint NOT NULL | |
| `source` | text NOT NULL | enum: `TRAINER`, `AI`, `AI_BOOTSTRAP` |
| `ai_locked` | bool NOT NULL DEFAULT false | true when trainer overrides — AI stops auto-bumping |
| `ai_rationale` | text | last AI explanation (≤120 chars) |
| `ai_confidence` | numeric(3,2) | 0.00–1.00 |
| `updated_at` | timestamptz NOT NULL | |

Unique constraint: `(client_id, exercise_id)`.

**`ai_target_suggestion`** — append-only audit log.

| Column | Type | Notes |
|---|---|---|
| `id` | bigserial PK | |
| `branch_id` | bigint NOT NULL | scope |
| `client_id` | bigint NOT NULL | |
| `exercise_id` | bigint NOT NULL | |
| `session_id_trigger` | bigint NULL | null for `AI_BOOTSTRAP` |
| `model` | text NOT NULL | e.g., `claude-haiku-4-5` |
| `prompt_hash` | text NOT NULL | sha256 of prompt body — replay/dedupe |
| `prompt_body` | jsonb NOT NULL | input snapshot |
| `output_json` | jsonb NOT NULL | raw AI response |
| `applied` | bool NOT NULL | true if `exercise_target` was upserted from this |
| `reject_reason` | text NULL | populated when `applied=false` (schema fail / fallback) |
| `created_at` | timestamptz NOT NULL | |

Index: `(client_id, exercise_id, created_at DESC)`.

### 4.2 Backend flow

```
POST /api/sessions/{id}/complete
  SessionService.complete(sessionId):
    1. Mark session DONE
    2. Persist any not-yet-saved set rows to exercise_session_log
    3. Distinct exercise_ids in this session → for each:
         OverloadService.recomputeAsync(clientId, exerciseId, sessionId)
    4. Return 204
```

`OverloadService.recomputeAsync` (Spring `@Async`, ThreadPoolTaskExecutor, retry up to 3× with exponential backoff on AI failure):

```
recomputeAsync(client, exercise, sessionId):
  target = exerciseTargetRepo.find(client, exercise)

  if target.ai_locked:
    return  # trainer-pinned, skip

  history = sessionLogRepo.lastN(client, exercise, n=3)
  if history.size == 0:
    return  # bootstrap path handles this

  prompt = OverloadPromptBuilder.build(target, history, exercise.type)
  hash = sha256(prompt.body)

  if aiSuggestionRepo.existsRecent(client, exercise, hash, withinHours=1):
    return  # dedupe burst calls

  output = ClaudeAdapter.callJson(prompt, schema=NextTargetSchema)

  audit = aiSuggestionRepo.insert(...)  # always log, even if rejected

  if !output.validates():
    audit.applied = false; audit.reject_reason = "schema fail"
    return

  exerciseTargetRepo.upsert(
    client, exercise,
    weight=output.weight_kg, reps_low=output.reps_low, reps_high=output.reps_high,
    sets=output.sets, source=AI,
    ai_rationale=output.rationale, ai_confidence=output.confidence
  )
  audit.applied = true
```

### 4.3 AI prompt (locked template)

System:

> You are a strength-training progressive-overload coach. Given the last N sessions of one exercise plus the current target, return the next target as strict JSON. Bias rep-progression first (push to top of rep range), weight-bump second (when client hits top of range for all sets with avg RPE ≤ 8). For compound lifts increment 2.5 kg; for isolation 1.0 kg. Never bump more than one variable per call. If history is inconsistent (skipped sets, failed reps, very high RPE), prefer "maintain". Output JSON only.

User: structured JSON of:

```json
{
  "exercise": { "name": "...", "type": "COMPOUND|ISOLATION|MACHINE|BODYWEIGHT|CORE" },
  "currentTarget": { "weight_kg": 90, "reps_low": 6, "reps_high": 8, "sets": 4 },
  "history": [
    { "session_at": "2026-05-15", "sets": [{ "idx": 1, "weight": 90, "reps": 8, "rpe": 7 }, ...] },
    ...
  ]
}
```

Required output JSON schema:

```json
{
  "weight_kg": number,
  "reps_low": integer,
  "reps_high": integer,
  "sets": integer,
  "decision": "MAINTAIN|BUMP_REPS|BUMP_WEIGHT",
  "rationale": "string (<=120 chars)",
  "confidence": number (0..1)
}
```

Server validates output. Schema fail → reject + insert audit with `applied=false` + leave existing target intact.

Model selection: `claude-haiku-4-5` primary. Fallback to `claude-sonnet-4-6` only if Haiku errors. Always use prompt caching (system + schema cached; only history JSON varies).

### 4.4 Bootstrap (first time)

When (a) trainer first assigns an exercise to a client OR (b) client opens an exercise with neither target nor history, call `OverloadService.bootstrap(client, exercise)`:

Inputs to AI: `{ exercise, client: { body_weight_kg, training_age_months, goal } }`. Same schema response; persisted with `source=AI_BOOTSTRAP` and a stub `ai_rationale="bootstrap from profile"`. First actual set on the session lets client adjust.

### 4.5 Trainer override

Trainer app workout plan builder shows an `AI-set` chip next to any target where `source ∈ {AI, AI_BOOTSTRAP}`. Tap to edit. Save:

- Sets `source = TRAINER`
- Sets `ai_locked = true`
- Clears `ai_rationale` + `ai_confidence`

Trainer can untoggle `ai_locked` via a per-exercise toggle ("Let AI manage this") in the plan builder. When untoggled, `source` flips back to `AI` on next session-end recompute.

### 4.6 Client API — history endpoint

`GET /api/clients/me/exercises/{exerciseId}/history?limit=1`

Response:

```json
{
  "exercise": { "id": 12, "name": "Bench Press" },
  "target": { "weight_kg": 92.5, "reps_low": 6, "reps_high": 8, "sets": 4, "source": "AI" },
  "lastSession": {
    "session_id": 4521,
    "completed_at": "2026-05-15T10:32:00Z",
    "sets": [
      { "idx": 1, "weight_kg": 90, "reps": 8, "rpe": 7, "completed": true },
      { "idx": 2, "weight_kg": 92.5, "reps": 8, "rpe": 8, "completed": true },
      { "idx": 3, "weight_kg": 92.5, "reps": 7, "rpe": 9, "completed": true }
    ]
  },
  "plannedSetsToday": 4,
  "firstTime": false
}
```

If `lastSession` null → `firstTime: true` + show AI bootstrap target.

## 5. Client App UI

### 5.1 Active Session — "Up next" card

Inside `ClientSession` (prototype: `prototype/src/client/ClientApp.jsx:268`-ish; React Native equivalent in `client-app/`):

Each upcoming-exercise row gains a subtitle line below the existing `3 × 12 @ 14kg` meta:

- Has history, same set count today: `Last: 3×8 @ 90kg` — body text (`var(--gc-ink2)`), 11 px, `var(--gc-font-mono)` for the numbers.
- Has history, more sets today: `Last: 3×8 @ 90kg · 1 new set today`.
- Has history, fewer sets today: omit the "new set" clause; trust the user to read the planned count.
- First time: `First time · AI starting 70kg × 8` — same line style, but the "First time" word is a 9 px peach chip (`var(--vis-amber-soft)` background, `var(--gc-accent-ink)` text), rounded-full.

Row entire surface is now tappable → opens history sheet.

### 5.2 History bottom sheet

Slides up 70% screen height. Sections:

1. **Header**: exercise name, "Last session · 2 days ago" subtitle, close button.
2. **Today's target card** (compact): `4 × 6–8 @ 92.5 kg` + AI rationale line in 11 px ink3 ("Hit top of range last session — bumping weight").
3. **Last session set list**:
   - Each completed set row: `Set 1 · 90 kg × 8 · RPE 7` (mono, ink2).
   - If `plannedSetsToday > lastSession.sets.length`: render the missing sets at the bottom as dotted-border rows:
     - Border: `1px dashed var(--gc-accent-ring)`
     - Background: `var(--gc-accent-tint)`
     - Text: `Set 4 · ≈ 90 kg × ~7 (estimated)` in ink3.
4. **First-time state** (replaces 3): full-card AI message — peach background, 14 px ink. *"AI starting weight: 70 kg × 8. Adjust on set 1 — first time on this exercise."*

Color tokens already exist; no new CSS vars needed. Sheet primitive: extend existing modal pattern in `prototype/src/components/Primitives.jsx` if absent — keep one shared sheet component.

### 5.3 Workout Plan screen — no change

Workout plan (`ClientWorkout`) keeps its current target column. The history surface lives in Active Session per agreed scope.

## 6. Trainer App UI

### 6.1 Workout plan builder

Each exercise row's target field:

- `AI-set` chip (peach pill, 10 px) next to weight if `source ∈ {AI, AI_BOOTSTRAP}`. Tap chip → expands AI rationale + confidence.
- Edit any value → save flips `source=TRAINER`, `ai_locked=true`. Visual: chip swaps to `Locked` (gray pill).
- "Let AI manage this" toggle per exercise (in expanded view) flips `ai_locked` back to false.

### 6.2 No approval queue

Skipped per non-goals. Trainer reviews retroactively if AI gets it wrong.

## 7. Error / edge cases

| Case | Behavior |
|---|---|
| AI call fails 3× | Leave existing target; audit row with `applied=false`, `reject_reason="upstream timeout"`. No retry beyond async backoff. |
| AI returns invalid JSON | Reject; audit `applied=false`, `reject_reason="schema fail"`. |
| AI returns weight delta > 10 kg from current | Reject as "implausible"; audit logged. |
| Client never logged a set this session but pressed Complete | No exercises in distinct list → no AI calls. Idle. |
| Client logs sets after session.complete was called | Edge: late-arriving sets do not re-trigger AI. Documented limitation. |
| Trainer edits target mid-session | New target picked up on next `GET history` call; not pushed live. Active Session uses snapshot at start. |
| Bodyweight exercise (`weight_kg = null`) | AI never bumps weight; only reps. Schema validator enforces null weight stays null. |

## 8. Open questions (deferred, not blockers)

- Should AI consider time-of-day or weekday patterns? Out of scope v1.
- Should we show trend chart (last 5 sessions) in history sheet? Defer to v2.
- Cross-exercise muscle-group recovery weighting — out of scope v1.

## 9. Test plan

- **Unit:** `OverloadService.recomputeAsync` mocked-AI: schema-valid, schema-invalid, implausible-delta, locked-target paths.
- **Unit:** `OverloadPromptBuilder` snapshot tests for prompt body shape.
- **Integration:** Testcontainers Postgres — end-to-end `POST /sessions/{id}/complete` triggers async, eventually-consistent assert that `exercise_target` is upserted within 5 s.
- **Contract:** AI adapter against stub Claude responses (recorded JSONs).
- **Client app:** Jest snapshot for Up next subtitle states (with-history, first-time, partial). Detox e2e for tap → sheet → set list render.
- **Trainer app:** Jest snapshot for AI-chip + locked state. Editing target updates `source` and `ai_locked`.

## 10. Rollout

No feature flag — straight ship after backend + client app phases. Backfill: existing `exercise_target`-equivalent rows (if any from earlier plans) get `source=TRAINER`, `ai_locked=false` so AI starts taking over on next session-end.

Phasing (detailed in implementation plan):

1. Backend: schema + repos + `OverloadService` + Claude adapter + `/history` endpoint.
2. Client app: history fetch, Up next subtitle, history bottom sheet.
3. Trainer app: AI-set chip, override flow, "Let AI manage" toggle.

---
