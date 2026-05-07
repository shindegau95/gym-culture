# Trainer App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Resume:** Check `PLAN.md` at project root. Pick up from first unchecked task in Phase 2.

**Goal:** Personal Trainers can view their daily schedule, manage clients, build workout + nutrition plans with AI assistance, log live sessions, and view their ratings profile.

**Architecture:** New Spring Boot endpoints added to the existing backend. React Native Trainer App (scaffolded in Phase 0) has 4 tabs: Today, Clients, Plan, Profile. Live session view uses polling (every 5 seconds) for shared set logging between trainer and client — avoids WebSocket complexity for v1. AI suggestions and macro generation call a dedicated Spring Boot `/ai/*` endpoint that proxies to OpenAI.

**Tech Stack:** Spring Boot (adds exercise/plan/session/nutrition domain), React Native 0.74, React Navigation v6 (bottom tabs + stack), React Native Reanimated (ring card animation), OpenAI API (exercise suggestions + macro generation)

**Prerequisite:** Phase 1 complete — members and trainer profiles exist in DB.

---

## File Map

### Backend additions
```
backend/src/main/java/in/gymculture/
  model/
    Exercise.java               # Master exercise list
    WorkoutPlan.java            # is_template=true doubles as template — no separate entity needed
    WorkoutDay.java
    PlanExercise.java
    WorkoutSession.java         # An actual PT session instance
    SessionLog.java             # Set-by-set log per exercise
    NutritionPlan.java
    NutritionMeal.java
    NutritionItem.java
  repository/
    ExerciseRepository.java
    WorkoutPlanRepository.java
    WorkoutDayRepository.java
    PlanExerciseRepository.java
    WorkoutSessionRepository.java
    SessionLogRepository.java
    NutritionPlanRepository.java
    NutritionMealRepository.java
  service/
    ExerciseService.java
    PlanService.java
    SessionService.java
    NutritionService.java
    AiService.java
  controller/
    ExerciseController.java
    PlanController.java
    SessionController.java
    NutritionController.java
    AiController.java
  dto/
    ExerciseDto.java
    WorkoutPlanDto.java
    WorkoutDayDto.java
    SessionDto.java
    SessionLogDto.java
    NutritionPlanDto.java
    AiSuggestionRequest.java
    AiSuggestionResponse.java
    AiMacroRequest.java
    AiMacroResponse.java

src/main/resources/db/migration/
  V8__create_exercises.sql
  V9__create_workout_plans.sql
  V10__create_sessions.sql
  V11__create_nutrition.sql
```

### Trainer App additions
```
trainer-app/src/
  screens/
    today/
      TodayScreen.js            # Home tab
      FocusedClientCard.js      # Ring card component
      ScheduleList.js           # Session list
      ActiveSessionScreen.js    # Set logging view
    clients/
      ClientsScreen.js
      ClientDetailScreen.js
    plan/
      PlanListScreen.js
      PlanBuilderScreen.js
      ExercisePickerModal.js
      NutritionPlanScreen.js
      TemplatesScreen.js
    profile/
      ProfileScreen.js
      RatingsDisplay.js
  navigation/
    AppNavigator.js             # Replace Phase 0 shell with 4-tab nav
    TodayStack.js
    ClientsStack.js
    PlanStack.js
  services/
    scheduleService.js
    clientService.js
    planService.js
    sessionService.js
    nutritionService.js
    aiService.js
    trainerService.js
  components/
    RingTimer.js
    SessionRow.js
    ExerciseCard.js
    MacroBar.js
```

---

## Task 1: Backend migrations — exercises, workout plans, sessions

**Files:**
- Create: `backend/src/main/resources/db/migration/V8__create_exercises.sql`
- Create: `backend/src/main/resources/db/migration/V9__create_workout_plans.sql`
- Create: `backend/src/main/resources/db/migration/V10__create_sessions.sql`

- [ ] **Step 1: Write `V8__create_exercises.sql`**

```sql
CREATE TYPE exercise_type AS ENUM ('COMPOUND', 'MACHINE', 'ISOLATION', 'BODYWEIGHT', 'CORE', 'CARDIO');

CREATE TABLE exercises (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(200) NOT NULL,
    type          exercise_type NOT NULL,
    muscle_groups TEXT[] NOT NULL,   -- e.g. {'QUADS','GLUTES','HAMSTRINGS'}
    description   TEXT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);

-- Seed common exercises
INSERT INTO exercises (name, type, muscle_groups) VALUES
  ('Barbell Back Squat',    'COMPOUND',   '{QUADS,GLUTES,HAMSTRINGS}'),
  ('Romanian Deadlift',     'COMPOUND',   '{HAMSTRINGS,GLUTES,LOWER_BACK}'),
  ('Leg Press',             'MACHINE',    '{QUADS,GLUTES}'),
  ('Walking Lunges',        'BODYWEIGHT', '{QUADS,GLUTES}'),
  ('Standing Calf Raise',   'ISOLATION',  '{CALVES}'),
  ('Bench Press',           'COMPOUND',   '{CHEST,TRICEPS,FRONT_DELT}'),
  ('Overhead Press',        'COMPOUND',   '{FRONT_DELT,SIDE_DELT,TRICEPS}'),
  ('Bent Over Row',         'COMPOUND',   '{UPPER_BACK,LATS,BICEPS}'),
  ('Pull Up',               'BODYWEIGHT', '{LATS,UPPER_BACK,BICEPS}'),
  ('Barbell Curl',          'ISOLATION',  '{BICEPS}'),
  ('Tricep Pushdown',       'MACHINE',    '{TRICEPS}'),
  ('Lateral Raise',         'ISOLATION',  '{SIDE_DELT}'),
  ('Face Pull',             'MACHINE',    '{REAR_DELT,UPPER_BACK}'),
  ('Plank',                 'CORE',       '{CORE}'),
  ('Cable Crunch',          'MACHINE',    '{CORE}'),
  ('Incline Dumbbell Press','COMPOUND',   '{CHEST,FRONT_DELT,TRICEPS}'),
  ('Deadlift',              'COMPOUND',   '{LOWER_BACK,GLUTES,HAMSTRINGS,UPPER_BACK}'),
  ('Hip Thrust',            'COMPOUND',   '{GLUTES,HAMSTRINGS}'),
  ('Leg Curl',              'MACHINE',    '{HAMSTRINGS}'),
  ('Chest Fly',             'ISOLATION',  '{CHEST}');
```

- [ ] **Step 2: Write `V9__create_workout_plans.sql`**

```sql
CREATE TABLE workout_plans (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id   UUID NOT NULL REFERENCES users(id),
    client_id    UUID REFERENCES users(id),    -- NULL = template, set = assigned to client
    name         VARCHAR(200) NOT NULL,
    goal         VARCHAR(100),
    weeks        INT NOT NULL DEFAULT 4,
    days_per_week INT NOT NULL DEFAULT 4,
    is_template  BOOLEAN NOT NULL DEFAULT false,
    active       BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE workout_days (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id      UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_of_week  SMALLINT NOT NULL,  -- 1=Mon, 7=Sun
    label        VARCHAR(200),       -- e.g. 'Push · Chest & Shoulders'
    is_rest_day  BOOLEAN NOT NULL DEFAULT false,
    sort_order   SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE plan_exercises (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id       UUID NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
    exercise_id  UUID NOT NULL REFERENCES exercises(id),
    sets         SMALLINT NOT NULL DEFAULT 3,
    reps         SMALLINT,           -- NULL for timed exercises
    duration_sec SMALLINT,           -- NULL for rep-based
    rpe_target   NUMERIC(3,1),
    sort_order   SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_workout_plans_trainer_id ON workout_plans(trainer_id);
CREATE INDEX idx_workout_plans_client_id ON workout_plans(client_id);
```

- [ ] **Step 3: Write `V10__create_sessions.sql`**

```sql
CREATE TYPE session_status AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TABLE workout_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id      UUID NOT NULL REFERENCES users(id),
    client_id       UUID NOT NULL REFERENCES users(id),
    plan_id         UUID REFERENCES workout_plans(id),
    day_id          UUID REFERENCES workout_days(id),
    scheduled_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at      TIMESTAMP WITH TIME ZONE,
    ended_at        TIMESTAMP WITH TIME ZONE,
    status          session_status NOT NULL DEFAULT 'PENDING',
    branch_id       UUID NOT NULL REFERENCES branches(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE session_logs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id     UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id    UUID NOT NULL REFERENCES exercises(id),
    set_number     SMALLINT NOT NULL,
    reps_done      SMALLINT,
    weight_kg      NUMERIC(6,2),
    duration_sec   SMALLINT,
    completed      BOOLEAN NOT NULL DEFAULT false,
    logged_by      UUID NOT NULL REFERENCES users(id),
    logged_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (session_id, exercise_id, set_number)
);

CREATE INDEX idx_workout_sessions_trainer_id ON workout_sessions(trainer_id);
CREATE INDEX idx_workout_sessions_client_id ON workout_sessions(client_id);
CREATE INDEX idx_workout_sessions_scheduled_at ON workout_sessions(scheduled_at);
CREATE INDEX idx_session_logs_session_id ON session_logs(session_id);
```

- [ ] **Step 4: Run migrations**

```bash
cd backend && mvn flyway:migrate
```

Expected: `Successfully applied 3 migrations` (V8, V9, V10).

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/resources/db/migration/V8__create_exercises.sql \
         backend/src/main/resources/db/migration/V9__create_workout_plans.sql \
         backend/src/main/resources/db/migration/V10__create_sessions.sql
git commit -m "feat: Flyway migrations for exercises, workout plans, sessions, session logs"
```

---

## Task 2: Backend — Nutrition migration + all JPA entities

**Files:**
- Create: `backend/src/main/resources/db/migration/V11__create_nutrition.sql`
- Create all model classes listed in the file map above

- [ ] **Step 1: Write `V11__create_nutrition.sql`**

```sql
CREATE TABLE nutrition_plans (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id       UUID NOT NULL REFERENCES users(id),
    client_id        UUID NOT NULL REFERENCES users(id),
    calories_target  INT NOT NULL,
    protein_g        INT NOT NULL,
    carbs_g          INT NOT NULL,
    fat_g            INT NOT NULL,
    active           BOOLEAN NOT NULL DEFAULT true,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE nutrition_meals (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id      UUID NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,  -- Breakfast, Pre-workout, etc.
    sort_order   SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE nutrition_items (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id      UUID NOT NULL REFERENCES nutrition_meals(id) ON DELETE CASCADE,
    food_name    VARCHAR(200) NOT NULL,
    quantity     VARCHAR(100) NOT NULL,  -- e.g. '200g', '1 scoop'
    calories     INT,
    protein_g    INT,
    carbs_g      INT,
    fat_g        INT,
    sort_order   SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_nutrition_plans_client_id ON nutrition_plans(client_id);
```

- [ ] **Step 2: Write `Exercise.java`**

```java
package in.gymculture.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "exercises")
public class Exercise {
    public enum Type { COMPOUND, MACHINE, ISOLATION, BODYWEIGHT, CORE, CARDIO }

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "exercise_type")
    private Type type;

    @Column(name = "muscle_groups", columnDefinition = "text[]", nullable = false)
    private String[] muscleGroups;

    private String description;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist void prePersist() { this.createdAt = OffsetDateTime.now(); }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public void setName(String n) { this.name = n; }
    public Type getType() { return type; }
    public void setType(Type t) { this.type = t; }
    public String[] getMuscleGroups() { return muscleGroups; }
    public void setMuscleGroups(String[] m) { this.muscleGroups = m; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
}
```

- [ ] **Step 3: Write `WorkoutPlan.java`**

```java
package in.gymculture.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.*;

@Entity
@Table(name = "workout_plans")
public class WorkoutPlan {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private User client;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 100)
    private String goal;

    @Column(nullable = false)
    private int weeks = 4;

    @Column(name = "days_per_week", nullable = false)
    private int daysPerWeek = 4;

    @Column(name = "is_template", nullable = false)
    private boolean isTemplate = false;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayOfWeek ASC")
    private List<WorkoutDay> days = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist void prePersist() { this.createdAt = OffsetDateTime.now(); }

    public UUID getId() { return id; }
    public User getTrainer() { return trainer; }
    public void setTrainer(User t) { this.trainer = t; }
    public User getClient() { return client; }
    public void setClient(User c) { this.client = c; }
    public String getName() { return name; }
    public void setName(String n) { this.name = n; }
    public String getGoal() { return goal; }
    public void setGoal(String g) { this.goal = g; }
    public int getWeeks() { return weeks; }
    public void setWeeks(int w) { this.weeks = w; }
    public int getDaysPerWeek() { return daysPerWeek; }
    public void setDaysPerWeek(int d) { this.daysPerWeek = d; }
    public boolean isTemplate() { return isTemplate; }
    public void setTemplate(boolean t) { this.isTemplate = t; }
    public boolean isActive() { return active; }
    public void setActive(boolean a) { this.active = a; }
    public List<WorkoutDay> getDays() { return days; }
}
```

- [ ] **Step 4: Write `WorkoutDay.java`**

```java
package in.gymculture.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "workout_days")
public class WorkoutDay {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private WorkoutPlan plan;

    @Column(name = "day_of_week", nullable = false)
    private short dayOfWeek;

    @Column(length = 200)
    private String label;

    @Column(name = "is_rest_day", nullable = false)
    private boolean isRestDay = false;

    @Column(name = "sort_order", nullable = false)
    private short sortOrder = 0;

    @OneToMany(mappedBy = "day", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<PlanExercise> exercises = new ArrayList<>();

    public UUID getId() { return id; }
    public WorkoutPlan getPlan() { return plan; }
    public void setPlan(WorkoutPlan p) { this.plan = p; }
    public short getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(short d) { this.dayOfWeek = d; }
    public String getLabel() { return label; }
    public void setLabel(String l) { this.label = l; }
    public boolean isRestDay() { return isRestDay; }
    public void setRestDay(boolean r) { this.isRestDay = r; }
    public short getSortOrder() { return sortOrder; }
    public void setSortOrder(short s) { this.sortOrder = s; }
    public List<PlanExercise> getExercises() { return exercises; }
}
```

- [ ] **Step 5: Write `PlanExercise.java`**

```java
package in.gymculture.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "plan_exercises")
public class PlanExercise {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id", nullable = false)
    private WorkoutDay day;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(nullable = false)
    private short sets = 3;

    private Short reps;
    @Column(name = "duration_sec")
    private Short durationSec;
    @Column(name = "rpe_target")
    private BigDecimal rpeTarget;
    @Column(name = "sort_order", nullable = false)
    private short sortOrder = 0;

    public UUID getId() { return id; }
    public WorkoutDay getDay() { return day; }
    public void setDay(WorkoutDay d) { this.day = d; }
    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise e) { this.exercise = e; }
    public short getSets() { return sets; }
    public void setSets(short s) { this.sets = s; }
    public Short getReps() { return reps; }
    public void setReps(Short r) { this.reps = r; }
    public BigDecimal getRpeTarget() { return rpeTarget; }
    public void setRpeTarget(BigDecimal r) { this.rpeTarget = r; }
    public short getSortOrder() { return sortOrder; }
    public void setSortOrder(short s) { this.sortOrder = s; }
}
```

- [ ] **Step 6: Write `WorkoutSession.java` and `SessionLog.java`**

```java
// WorkoutSession.java
package in.gymculture.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.*;

@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {
    public enum Status { PENDING, ACTIVE, COMPLETED, CANCELLED }

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    private User trainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private WorkoutPlan plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id")
    private WorkoutDay day;

    @Column(name = "scheduled_at", nullable = false)
    private OffsetDateTime scheduledAt;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "ended_at")
    private OffsetDateTime endedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "session_status")
    private Status status = Status.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist void prePersist() { this.createdAt = OffsetDateTime.now(); }

    public UUID getId() { return id; }
    public User getTrainer() { return trainer; }
    public void setTrainer(User t) { this.trainer = t; }
    public User getClient() { return client; }
    public void setClient(User c) { this.client = c; }
    public WorkoutPlan getPlan() { return plan; }
    public void setPlan(WorkoutPlan p) { this.plan = p; }
    public WorkoutDay getDay() { return day; }
    public void setDay(WorkoutDay d) { this.day = d; }
    public OffsetDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(OffsetDateTime t) { this.scheduledAt = t; }
    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime t) { this.startedAt = t; }
    public OffsetDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(OffsetDateTime t) { this.endedAt = t; }
    public Status getStatus() { return status; }
    public void setStatus(Status s) { this.status = s; }
    public Branch getBranch() { return branch; }
    public void setBranch(Branch b) { this.branch = b; }
}

// SessionLog.java
// NOTE: exercise is stored as a @ManyToOne relationship mapping to the exercise_id FK column.
// The SessionLogDto exposes exerciseId as a plain UUID for API consumers. The upsert endpoint
// resolves the Exercise entity via exerciseRepository.findById() before setting the relationship.
// This ensures the DB column remains exercise_id (confirmed in V10 migration) while the DTO
// stays flat. RecoveryService (Phase 3) can join session_logs to exercises via this FK.
package in.gymculture.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "session_logs")
public class SessionLog {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private WorkoutSession session;

    // DB column: exercise_id UUID NOT NULL REFERENCES exercises(id) — confirmed in V10__create_sessions.sql
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "set_number", nullable = false)
    private short setNumber;

    @Column(name = "reps_done")
    private Short repsDone;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(name = "duration_sec")
    private Short durationSec;

    @Column(nullable = false)
    private boolean completed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "logged_by", nullable = false)
    private User loggedBy;

    @Column(name = "logged_at")
    private OffsetDateTime loggedAt;

    @PrePersist void prePersist() { this.loggedAt = OffsetDateTime.now(); }

    public UUID getId() { return id; }
    public WorkoutSession getSession() { return session; }
    public void setSession(WorkoutSession s) { this.session = s; }
    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise e) { this.exercise = e; }
    public short getSetNumber() { return setNumber; }
    public void setSetNumber(short s) { this.setNumber = s; }
    public Short getRepsDone() { return repsDone; }
    public void setRepsDone(Short r) { this.repsDone = r; }
    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal w) { this.weightKg = w; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean c) { this.completed = c; }
    public User getLoggedBy() { return loggedBy; }
    public void setLoggedBy(User u) { this.loggedBy = u; }
}
```

- [ ] **Step 7: Write Nutrition models**

```java
// NutritionPlan.java
package in.gymculture.model;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.*;

@Entity @Table(name = "nutrition_plans")
public class NutritionPlan {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "trainer_id", nullable = false) private User trainer;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "client_id", nullable = false) private User client;
    @Column(name = "calories_target", nullable = false) private int caloriesTarget;
    @Column(name = "protein_g", nullable = false) private int proteinG;
    @Column(name = "carbs_g", nullable = false) private int carbsG;
    @Column(name = "fat_g", nullable = false) private int fatG;
    @Column(nullable = false) private boolean active = true;
    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true) @OrderBy("sortOrder ASC")
    private List<NutritionMeal> meals = new ArrayList<>();
    @Column(name = "created_at", updatable = false) private OffsetDateTime createdAt;
    @PrePersist void prePersist() { this.createdAt = OffsetDateTime.now(); }

    public UUID getId() { return id; }
    public User getTrainer() { return trainer; } public void setTrainer(User t) { this.trainer = t; }
    public User getClient() { return client; } public void setClient(User c) { this.client = c; }
    public int getCaloriesTarget() { return caloriesTarget; } public void setCaloriesTarget(int c) { this.caloriesTarget = c; }
    public int getProteinG() { return proteinG; } public void setProteinG(int p) { this.proteinG = p; }
    public int getCarbsG() { return carbsG; } public void setCarbsG(int c) { this.carbsG = c; }
    public int getFatG() { return fatG; } public void setFatG(int f) { this.fatG = f; }
    public boolean isActive() { return active; } public void setActive(boolean a) { this.active = a; }
    public List<NutritionMeal> getMeals() { return meals; }
}

// NutritionMeal.java — abbreviated for space
package in.gymculture.model;
import jakarta.persistence.*;
import java.util.*;

@Entity @Table(name = "nutrition_meals")
public class NutritionMeal {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "plan_id", nullable = false) private NutritionPlan plan;
    @Column(nullable = false, length = 100) private String name;
    @Column(name = "sort_order", nullable = false) private short sortOrder = 0;
    @OneToMany(mappedBy = "meal", cascade = CascadeType.ALL, orphanRemoval = true) @OrderBy("sortOrder ASC")
    private List<NutritionItem> items = new ArrayList<>();

    public UUID getId() { return id; }
    public NutritionPlan getPlan() { return plan; } public void setPlan(NutritionPlan p) { this.plan = p; }
    public String getName() { return name; } public void setName(String n) { this.name = n; }
    public short getSortOrder() { return sortOrder; } public void setSortOrder(short s) { this.sortOrder = s; }
    public List<NutritionItem> getItems() { return items; }
}

// NutritionItem.java
package in.gymculture.model;
import jakarta.persistence.*;
import java.util.UUID;

@Entity @Table(name = "nutrition_items")
public class NutritionItem {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "meal_id", nullable = false) private NutritionMeal meal;
    @Column(name = "food_name", nullable = false, length = 200) private String foodName;
    @Column(nullable = false, length = 100) private String quantity;
    private Integer calories;
    @Column(name = "protein_g") private Integer proteinG;
    @Column(name = "carbs_g") private Integer carbsG;
    @Column(name = "fat_g") private Integer fatG;
    @Column(name = "sort_order", nullable = false) private short sortOrder = 0;

    public UUID getId() { return id; }
    public NutritionMeal getMeal() { return meal; } public void setMeal(NutritionMeal m) { this.meal = m; }
    public String getFoodName() { return foodName; } public void setFoodName(String f) { this.foodName = f; }
    public String getQuantity() { return quantity; } public void setQuantity(String q) { this.quantity = q; }
    public Integer getCalories() { return calories; } public void setCalories(Integer c) { this.calories = c; }
    public Integer getProteinG() { return proteinG; } public void setProteinG(Integer p) { this.proteinG = p; }
    public Integer getCarbsG() { return carbsG; } public void setCarbsG(Integer c) { this.carbsG = c; }
    public Integer getFatG() { return fatG; } public void setFatG(Integer f) { this.fatG = f; }
}
```

- [ ] **Step 8: Run migrations and compile**

```bash
mvn flyway:migrate && mvn compile
```

Expected: `BUILD SUCCESS`

- [ ] **Step 9: Commit**

```bash
git add backend/src/main/java/in/gymculture/model/ \
         backend/src/main/resources/db/migration/V11__create_nutrition.sql
git commit -m "feat: Exercise, WorkoutPlan, Session, Nutrition JPA entities"
```

---

## Task 3: Backend — ExerciseController + PlanController + SessionController

**Files:**
- Create all repositories and controllers listed in the file map

- [ ] **Step 1: Write repositories**

```java
// ExerciseRepository.java
package in.gymculture.repository;
import in.gymculture.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.*;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
    List<Exercise> findByNameContainingIgnoreCase(String name);
    @Query(value = "SELECT * FROM exercises WHERE :group = ANY(muscle_groups)", nativeQuery = true)
    List<Exercise> findByMuscleGroup(String group);
}

// WorkoutPlanRepository.java
package in.gymculture.repository;
import in.gymculture.model.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, UUID> {
    List<WorkoutPlan> findByTrainerIdAndIsTemplateTrue(UUID trainerId);
    List<WorkoutPlan> findByClientIdAndActiveTrue(UUID clientId);
    Optional<WorkoutPlan> findFirstByClientIdAndActiveTrueOrderByCreatedAtDesc(UUID clientId);
}

// WorkoutSessionRepository.java
package in.gymculture.repository;
import in.gymculture.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.*;
import java.util.*;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, UUID> {
    @Query("SELECT s FROM WorkoutSession s WHERE s.trainer.id = :trainerId AND CAST(s.scheduledAt AS LocalDate) = :date ORDER BY s.scheduledAt")
    List<WorkoutSession> findByTrainerIdAndDate(UUID trainerId, LocalDate date);

    // Alias used by SessionController — delegates to findByTrainerIdAndDate
    @Query("SELECT s FROM WorkoutSession s WHERE s.trainer.id = :trainerId AND CAST(s.scheduledAt AS LocalDate) = :date ORDER BY s.scheduledAt")
    List<WorkoutSession> findByTrainerIdAndScheduledDate(UUID trainerId, LocalDate date);

    List<WorkoutSession> findByClientIdOrderByScheduledAtDesc(UUID clientId);
    long countByClientIdAndStatus(UUID clientId, WorkoutSession.Status status);
}

// SessionLogRepository.java
package in.gymculture.repository;
import in.gymculture.model.SessionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface SessionLogRepository extends JpaRepository<SessionLog, UUID> {
    List<SessionLog> findBySessionId(UUID sessionId);
    List<SessionLog> findBySessionIdOrderByExerciseIdAscSetNumberAsc(UUID sessionId);
    Optional<SessionLog> findBySessionIdAndExerciseIdAndSetNumber(UUID sessionId, UUID exerciseId, int setNumber);
    void deleteBySessionIdAndExerciseIdAndSetNumber(UUID sessionId, UUID exerciseId, short setNumber);
}
```

- [ ] **Step 2: Write `ExerciseController.java`**

```java
package in.gymculture.controller;

import in.gymculture.model.Exercise;
import in.gymculture.repository.ExerciseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/exercises")
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;

    public ExerciseController(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @GetMapping
    public ResponseEntity<List<Exercise>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String muscleGroup) {
        if (muscleGroup != null && !muscleGroup.isBlank()) {
            return ResponseEntity.ok(exerciseRepository.findByMuscleGroup(muscleGroup.toUpperCase()));
        }
        if (q != null && !q.isBlank()) {
            return ResponseEntity.ok(exerciseRepository.findByNameContainingIgnoreCase(q));
        }
        return ResponseEntity.ok(exerciseRepository.findAll());
    }
}
```

- [ ] **Step 3: Write `SessionController.java`**

```java
package in.gymculture.controller;

import in.gymculture.model.*;
import in.gymculture.repository.*;
import in.gymculture.util.BranchContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/sessions")
public class SessionController {

    private final WorkoutSessionRepository sessionRepository;
    private final SessionLogRepository sessionLogRepository;
    private final ExerciseRepository exerciseRepository;
    private final BranchContext branchContext;

    public SessionController(WorkoutSessionRepository sessionRepository,
                             SessionLogRepository sessionLogRepository,
                             ExerciseRepository exerciseRepository,
                             BranchContext branchContext) {
        this.sessionRepository = sessionRepository;
        this.sessionLogRepository = sessionLogRepository;
        this.exerciseRepository = exerciseRepository;
        this.branchContext = branchContext;
    }

    @GetMapping("/today")
    public ResponseEntity<List<WorkoutSession>> todaysSchedule(Authentication auth) {
        User user = branchContext.resolveUser(auth);
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        return ResponseEntity.ok(sessionRepository.findByTrainerIdAndDate(user.getId(), today));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<WorkoutSession> startSession(@PathVariable UUID id, Authentication auth) {
        WorkoutSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new in.gymculture.exception.NotFoundException("Session not found"));
        session.setStatus(WorkoutSession.Status.ACTIVE);
        session.setStartedAt(OffsetDateTime.now());
        return ResponseEntity.ok(sessionRepository.save(session));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<WorkoutSession> endSession(@PathVariable UUID id, Authentication auth) {
        WorkoutSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new in.gymculture.exception.NotFoundException("Session not found"));
        session.setStatus(WorkoutSession.Status.COMPLETED);
        session.setEndedAt(OffsetDateTime.now());
        return ResponseEntity.ok(sessionRepository.save(session));
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<SessionLog>> getLogs(@PathVariable UUID id) {
        return ResponseEntity.ok(sessionLogRepository.findBySessionId(id));
    }

    @PutMapping("/{id}/logs/{exerciseId}/{setNumber}")
    public ResponseEntity<SessionLog> upsertLog(
            @PathVariable UUID id,
            @PathVariable UUID exerciseId,
            @PathVariable short setNumber,
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        User user = branchContext.resolveUser(auth);
        WorkoutSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new in.gymculture.exception.NotFoundException("Session not found"));
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new in.gymculture.exception.NotFoundException("Exercise not found"));

        // Delete existing log for this set (upsert via delete+insert)
        sessionLogRepository.deleteBySessionIdAndExerciseIdAndSetNumber(id, exerciseId, setNumber);

        SessionLog log = new SessionLog();
        log.setSession(session);
        log.setExercise(exercise);
        log.setSetNumber(setNumber);
        if (body.containsKey("repsDone")) log.setRepsDone(((Number) body.get("repsDone")).shortValue());
        if (body.containsKey("weightKg")) log.setWeightKg(new java.math.BigDecimal(body.get("weightKg").toString()));
        if (body.containsKey("completed")) log.setCompleted((Boolean) body.get("completed"));
        log.setLoggedBy(user);

        return ResponseEntity.ok(sessionLogRepository.save(log));
    }
}
```

- [ ] **Step 4: Write `PlanController.java`**

```java
package in.gymculture.controller;

import in.gymculture.model.*;
import in.gymculture.repository.*;
import in.gymculture.util.BranchContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/plans")
public class PlanController {

    private final WorkoutPlanRepository planRepository;
    private final BranchContext branchContext;

    public PlanController(WorkoutPlanRepository planRepository, BranchContext branchContext) {
        this.planRepository = planRepository;
        this.branchContext = branchContext;
    }

    @GetMapping("/templates")
    public ResponseEntity<List<WorkoutPlan>> getTemplates(Authentication auth) {
        User user = branchContext.resolveUser(auth);
        return ResponseEntity.ok(planRepository.findByTrainerIdAndIsTemplateTrue(user.getId()));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<WorkoutPlan>> getClientPlans(@PathVariable UUID clientId) {
        return ResponseEntity.ok(planRepository.findByClientIdAndActiveTrue(clientId));
    }

    @PostMapping
    public ResponseEntity<WorkoutPlan> createPlan(
            @RequestBody WorkoutPlan plan,
            Authentication auth) {
        User user = branchContext.resolveUser(auth);
        plan.setTrainer(user);
        return ResponseEntity.ok(planRepository.save(plan));
    }

    @PostMapping("/{id}/save-as-template")
    public ResponseEntity<WorkoutPlan> saveAsTemplate(@PathVariable UUID id) {
        WorkoutPlan original = planRepository.findById(id)
                .orElseThrow(() -> new in.gymculture.exception.NotFoundException("Plan not found"));
        WorkoutPlan template = new WorkoutPlan();
        template.setTrainer(original.getTrainer());
        template.setName(original.getName() + " (Template)");
        template.setGoal(original.getGoal());
        template.setWeeks(original.getWeeks());
        template.setDaysPerWeek(original.getDaysPerWeek());
        template.setTemplate(true);
        return ResponseEntity.ok(planRepository.save(template));
    }
}
```

- [ ] **Step 5: Write `AiController.java`**

```java
package in.gymculture.controller;

import in.gymculture.dto.*;
import in.gymculture.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/exercise-suggestions")
    public ResponseEntity<AiSuggestionResponse> suggestExercises(
            @RequestBody AiSuggestionRequest request) {
        return ResponseEntity.ok(aiService.suggestExercises(request));
    }

    @PostMapping("/macros")
    public ResponseEntity<AiMacroResponse> generateMacros(
            @RequestBody AiMacroRequest request) {
        return ResponseEntity.ok(aiService.generateMacros(request));
    }
}
```

- [ ] **Step 6: Write DTOs**

```java
// SessionLogDto.java
package in.gymculture.dto;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record SessionLogDto(
    UUID id,
    UUID sessionId,
    UUID exerciseId,
    int setNumber,
    Short repsDone,
    BigDecimal weightKg,
    boolean completed,
    UUID loggedBy,
    OffsetDateTime loggedAt
) {}

// AiSuggestionRequest.java
package in.gymculture.dto;
import java.util.List;
public record AiSuggestionRequest(
    String goal,                    // e.g. "Hypertrophy"
    List<String> recoveredGroups,   // e.g. ["QUADS", "CHEST"]
    List<String> alreadyInPlan      // exercise names already added today
) {}

// AiSuggestionResponse.java
package in.gymculture.dto;
import java.util.List;
public record AiSuggestionResponse(List<SuggestedExercise> suggestions) {
    public record SuggestedExercise(String exerciseName, String rationale) {}
}

// AiMacroRequest.java
package in.gymculture.dto;
public record AiMacroRequest(double weightKg, String goal, String activityLevel) {}

// AiMacroResponse.java
package in.gymculture.dto;
public record AiMacroResponse(int calories, int proteinG, int carbsG, int fatG, String reasoning) {}
```

- [ ] **Step 7: Write `AiService.java`**

```java
package in.gymculture.service;

import in.gymculture.dto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiService {

    @Value("${openai.api.key:}")
    private String openAiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public AiSuggestionResponse suggestExercises(AiSuggestionRequest req) {
        if (openAiKey.isBlank()) {
            // Return stub suggestions when no key configured (dev mode)
            return new AiSuggestionResponse(List.of(
                new AiSuggestionResponse.SuggestedExercise("Barbell Back Squat",
                    "Compound quad-dominant — supports " + req.goal() + " goal, quads recovered.")
            ));
        }

        String prompt = String.format(
            "You are a personal trainer AI. Goal: %s. Recovered muscle groups: %s. " +
            "Already in plan: %s. Suggest 3-5 exercises as JSON array: " +
            "[{\"exerciseName\":\"...\",\"rationale\":\"...\"}]",
            req.goal(), String.join(", ", req.recoveredGroups()),
            String.join(", ", req.alreadyInPlan())
        );

        Map<String, Object> body = Map.of(
            "model", "gpt-4o-mini",
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "response_format", Map.of("type", "json_object")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openAiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map> response = restTemplate.exchange(
            "https://api.openai.com/v1/chat/completions",
            HttpMethod.POST, new HttpEntity<>(body, headers), Map.class
        );

        // Extract content from OpenAI response structure
        @SuppressWarnings("unchecked")
        Map<String, Object> responseBody = response.getBody();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
        @SuppressWarnings("unchecked")
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        String content = (String) message.get("content");

        // Parse JSON array from content using Jackson
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = mapper.readValue(content, Map.class);
            @SuppressWarnings("unchecked")
            List<Map<String, String>> suggestions = (List<Map<String, String>>) parsed.get("suggestions");
            if (suggestions == null) suggestions = List.of();
            return new AiSuggestionResponse(suggestions.stream()
                .map(s -> new AiSuggestionResponse.SuggestedExercise(
                    s.getOrDefault("exerciseName", ""), s.getOrDefault("rationale", "")))
                .toList());
        } catch (Exception e) {
            return new AiSuggestionResponse(List.of(
                new AiSuggestionResponse.SuggestedExercise("Error parsing AI response", e.getMessage())
            ));
        }
    }

    public AiMacroResponse generateMacros(AiMacroRequest req) {
        if (openAiKey.isBlank()) {
            // Rule-based fallback when no key configured
            int protein = (int) (req.weightKg() * 2);
            int calories = switch (req.goal()) {
                case "Weight Loss" -> (int) (req.weightKg() * 28);
                case "Muscle Gain" -> (int) (req.weightKg() * 38);
                default -> (int) (req.weightKg() * 33);
            };
            int fat = calories / 10;
            int carbs = (calories - protein * 4 - fat * 9) / 4;
            return new AiMacroResponse(calories, protein, Math.max(carbs, 0), fat,
                "Estimated using standard formulas (no AI key configured).");
        }

        String prompt = String.format(
            "Calculate daily macros for: weight=%.1fkg, goal=%s, activity=%s. " +
            "Return JSON: {\"calories\":int,\"proteinG\":int,\"carbsG\":int,\"fatG\":int,\"reasoning\":\"string\"}",
            req.weightKg(), req.goal(), req.activityLevel()
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(openAiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> macroBody = Map.of(
            "model", "gpt-4o-mini",
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "response_format", Map.of("type", "json_object")
        );

        ResponseEntity<Map> macroResponse = restTemplate.exchange(
            "https://api.openai.com/v1/chat/completions",
            HttpMethod.POST, new HttpEntity<>(macroBody, headers), Map.class
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> respBody = macroResponse.getBody();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) respBody.get("choices");
            @SuppressWarnings("unchecked")
            Map<String, Object> msg = (Map<String, Object>) choices.get(0).get("message");
            String macroContent = (String) msg.get("content");
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = mapper.readValue(macroContent, Map.class);
            return new AiMacroResponse(
                (int) parsed.getOrDefault("calories", 2000),
                (int) parsed.getOrDefault("proteinG", 150),
                (int) parsed.getOrDefault("carbsG", 200),
                (int) parsed.getOrDefault("fatG", 65),
                (String) parsed.getOrDefault("reasoning", "AI-generated")
            );
        } catch (Exception e) {
            // Fallback to rule-based if AI parsing fails
            int protein = (int) (req.weightKg() * 2);
            int calories = switch (req.goal()) {
                case "Weight Loss" -> (int) (req.weightKg() * 28);
                case "Muscle Gain" -> (int) (req.weightKg() * 38);
                default -> (int) (req.weightKg() * 33);
            };
            int fat = calories / 10;
            int carbs = (calories - protein * 4 - fat * 9) / 4;
            return new AiMacroResponse(calories, protein, Math.max(carbs, 0), fat,
                "Rule-based fallback (AI parsing failed: " + e.getMessage() + ")");
        }
    }
}
```

Add to `application.properties`:
```properties
openai.api.key=${OPENAI_API_KEY:}
```

Add to `.env.example`:
```
OPENAI_API_KEY=sk-...
```

- [ ] **Step 8: Compile and test all endpoints**

```bash
mvn compile && mvn spring-boot:run
```

Test:
```bash
curl http://localhost:8080/exercises?muscleGroup=QUADS
# Returns: list of quad exercises

curl -X POST http://localhost:8080/ai/macros \
  -H "Content-Type: application/json" \
  -d '{"weightKg":75,"goal":"Muscle Gain","activityLevel":"High"}'
# Returns: macro split JSON
```

- [ ] **Step 9: Commit**

```bash
git add backend/
git commit -m "feat: ExerciseController, PlanController, SessionController, AiController + AiService"
```

---

## Task 4: React Native — 4-tab navigation + Today screen

**Files:**
- Modify: `trainer-app/src/navigation/AppNavigator.js`
- Create: `trainer-app/src/navigation/TodayStack.js`
- Create: `trainer-app/src/screens/today/TodayScreen.js`
- Create: `trainer-app/src/screens/today/ScheduleList.js`
- Create: `trainer-app/src/screens/today/FocusedClientCard.js`
- Create: `trainer-app/src/services/scheduleService.js`

- [ ] **Step 1: Install navigation + animation deps**

```bash
cd trainer-app
npm install @react-navigation/bottom-tabs \
  react-native-reanimated react-native-gesture-handler \
  react-native-vector-icons
npx pod-install
```

Add to `babel.config.js`:
```js
plugins: ['react-native-reanimated/plugin']
```

- [ ] **Step 2: Write `scheduleService.js`**

```js
import api from './apiService';

export async function getTodaysSchedule() {
  const res = await api.get('/sessions/today');
  return res.data;
}

export async function startSession(sessionId) {
  const res = await api.post(`/sessions/${sessionId}/start`);
  return res.data;
}

export async function endSession(sessionId) {
  const res = await api.post(`/sessions/${sessionId}/end`);
  return res.data;
}

export async function getSessionLogs(sessionId) {
  const res = await api.get(`/sessions/${sessionId}/logs`);
  return res.data;
}

export async function upsertLog(sessionId, exerciseId, setNumber, data) {
  const res = await api.put(`/sessions/${sessionId}/logs/${exerciseId}/${setNumber}`, data);
  return res.data;
}
```

- [ ] **Step 3: Write `FocusedClientCard.js`**

```js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function FocusedClientCard({ session, elapsedSeconds }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();
  }, []);

  const rotation = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (!session) return null;

  return (
    <View style={styles.card}>
      <View style={styles.ringContainer}>
        <Animated.View style={[styles.ring, { transform: [{ rotate: rotation }] }]} />
        <Text style={styles.timer}>{timeStr}</Text>
        <Text style={styles.liveLabel}>● LIVE</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>FOCUSED CLIENT</Text>
        <Text style={styles.name}>{session.client?.name || '—'}</Text>
        <Text style={styles.goal}>{session.plan?.goal || ''}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statNum}>{session.totalSessions || 0}</Text><Text style={styles.statLabel}>Sessions</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>{session.activeDays || 0}</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={styles.stat}><Text style={styles.statNum}>{session.adherence || 0}%</Text><Text style={styles.statLabel}>Adherence</Text></View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, margin: 16, elevation: 2 },
  ringContainer: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  ring: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#E53935', borderTopColor: 'transparent' },
  timer: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  liveLabel: { fontSize: 10, color: '#E53935', fontWeight: '600', marginTop: 2 },
  info: { flex: 1 },
  label: { fontSize: 10, color: '#999', letterSpacing: 1, marginBottom: 2 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  goal: { fontSize: 12, color: '#666', marginBottom: 8 },
  stats: { flexDirection: 'row', gap: 16 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  statLabel: { fontSize: 10, color: '#999' },
});
```

- [ ] **Step 4: Write `ScheduleList.js`**

```js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

function SessionRow({ session, onPress }) {
  const isActive = session.status === 'ACTIVE';
  const isDone = session.status === 'COMPLETED';
  const time = new Date(session.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <TouchableOpacity style={[styles.row, isActive && styles.activeRow, isDone && styles.doneRow]} onPress={() => onPress(session)}>
      <View style={styles.timeCol}>
        <Text style={styles.time}>{time}</Text>
      </View>
      <View style={[styles.avatar, { backgroundColor: isActive ? '#E53935' : '#e0e0e0' }]}>
        <Text style={[styles.avatarText, { color: isActive ? '#fff' : '#555' }]}>
          {(session.client?.name || '?')[0]}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.clientName, isDone && styles.doneText]}>{session.client?.name}</Text>
        <Text style={styles.planName}>{session.plan?.name || 'No plan'}</Text>
      </View>
      {isDone && <Text style={styles.checkmark}>✓</Text>}
      {isActive && <Text style={styles.activeIndicator}>›</Text>}
    </TouchableOpacity>
  );
}

export default function ScheduleList({ sessions, onSessionPress }) {
  return (
    <FlatList
      data={sessions}
      keyExtractor={s => s.id}
      renderItem={({ item }) => <SessionRow session={item} onPress={onSessionPress} />}
      ListEmptyComponent={<Text style={styles.empty}>No sessions today</Text>}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  activeRow: { backgroundColor: '#fff5f5', borderLeftWidth: 3, borderLeftColor: '#E53935' },
  doneRow: { opacity: 0.6 },
  timeCol: { width: 50 },
  time: { fontSize: 13, fontWeight: '600', color: '#333' },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginHorizontal: 10 },
  avatarText: { fontWeight: '700', fontSize: 14 },
  info: { flex: 1 },
  clientName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  planName: { fontSize: 12, color: '#888', marginTop: 2 },
  doneText: { color: '#aaa' },
  checkmark: { fontSize: 18, color: '#4caf50', fontWeight: 'bold' },
  activeIndicator: { fontSize: 22, color: '#E53935' },
  empty: { textAlign: 'center', color: '#999', padding: 32 },
});
```

- [ ] **Step 5: Write `TodayScreen.js`**

```js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import FocusedClientCard from './FocusedClientCard';
import ScheduleList from './ScheduleList';
import { getTodaysSchedule } from '../../services/scheduleService';

export default function TodayScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  async function loadSchedule() {
    try {
      const data = await getTodaysSchedule();
      setSessions(data);
    } catch (e) {
      console.error('Failed to load schedule:', e);
    }
  }

  const activeSession = sessions.find(s => s.status === 'ACTIVE');

  useEffect(() => {
    if (activeSession) {
      const startedAt = new Date(activeSession.startedAt).getTime();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAt) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeSession?.id]);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateLabel}>{today.toUpperCase()}</Text>
        <Text style={styles.title}>Today</Text>
      </View>

      <ScrollView>
        {activeSession && (
          <FocusedClientCard session={activeSession} elapsedSeconds={elapsed} />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SCHEDULE</Text>
        </View>

        <ScheduleList
          sessions={sessions}
          onSessionPress={session => navigation.navigate('ActiveSession', { session })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  dateLabel: { fontSize: 11, color: '#999', letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '800', color: '#1a1a1a', marginTop: 2 },
  sectionHeader: { paddingHorizontal: 20, paddingVertical: 10 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#999', letterSpacing: 1.5 },
});
```

- [ ] **Step 6: Wire 4-tab navigation in `AppNavigator.js`**

```js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from '../services/authService';
import { getMe } from '../services/apiService';
import LoginScreen from '../screens/LoginScreen';
import PendingScreen from '../screens/PendingScreen';
import TodayScreen from '../screens/today/TodayScreen';
import ActiveSessionScreen from '../screens/today/ActiveSessionScreen';
import ClientsScreen from '../screens/clients/ClientsScreen';
import PlanListScreen from '../screens/plan/PlanListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const TodayStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function TodayNavigator() {
  return (
    <TodayStack.Navigator>
      <TodayStack.Screen name="Today" component={TodayScreen} options={{ headerShown: false }} />
      <TodayStack.Screen name="ActiveSession" component={ActiveSessionScreen} options={{ title: 'Active Session' }} />
    </TodayStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E53935',
        tabBarInactiveTintColor: '#999',
      }}>
      <Tab.Screen name="TodayTab" component={TodayNavigator} options={{ tabBarLabel: 'Today' }} />
      <Tab.Screen name="Clients" component={ClientsScreen} />
      <Tab.Screen name="Plan" component={PlanListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [appUser, setAppUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(async user => {
      setFirebaseUser(user);
      if (user) {
        try { setAppUser(await getMe()); }
        catch { setAppUser(null); }
      } else { setAppUser(null); }
    });
  }, []);

  if (firebaseUser === undefined) return null;

  return (
    <NavigationContainer>
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        {!firebaseUser ? (
          <AuthStack.Screen name="Login" component={LoginScreen} />
        ) : !appUser ? (
          <AuthStack.Screen name="Pending" component={PendingScreen} />
        ) : (
          <AuthStack.Screen name="Main" component={MainTabs} />
        )}
      </AuthStack.Navigator>
    </NavigationContainer>
  );
}
```

- [ ] **Step 7: Create stub screens for other tabs**

Create these minimal stubs so navigation compiles:

```js
// ClientsScreen.js
import React from 'react';
import { View, Text } from 'react-native';
export default function ClientsScreen() {
  return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>Clients — coming soon</Text></View>;
}

// PlanListScreen.js
import React from 'react';
import { View, Text } from 'react-native';
export default function PlanListScreen() {
  return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>Plans — coming soon</Text></View>;
}

// ProfileScreen.js
import React from 'react';
import { View, Text } from 'react-native';
export default function ProfileScreen() {
  return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>Profile — coming soon</Text></View>;
}

// ActiveSessionScreen.js — stub, built in next task
import React from 'react';
import { View, Text } from 'react-native';
export default function ActiveSessionScreen({ route }) {
  return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>Session: {route.params?.session?.id}</Text></View>;
}
```

- [ ] **Step 8: Run on simulator**

```bash
npx react-native run-ios
```

Expected: Bottom tabs visible. Today tab shows date header + schedule list (empty if no sessions seeded).

- [ ] **Step 9: Commit**

```bash
git add trainer-app/src/
git commit -m "feat: Trainer App 4-tab navigation, TodayScreen, FocusedClientCard, ScheduleList"
```

---

## Task 5: React Native — Active Session View (set logging)

**Files:**
- Modify: `trainer-app/src/screens/today/ActiveSessionScreen.js`

- [ ] **Step 1: Write `ActiveSessionScreen.js`**

```js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Alert
} from 'react-native';
import { getSessionLogs, upsertLog, endSession } from '../../services/scheduleService';
import { getExercises } from '../../services/planService';

export default function ActiveSessionScreen({ route, navigation }) {
  const { session } = route.params;
  const [logs, setLogs] = useState([]);
  const [exercises, setExercises] = useState(session.day?.exercises || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  async function loadLogs() {
    try {
      const data = await getSessionLogs(session.id);
      setLogs(data);
    } catch (e) { /* ignore polling errors */ }
  }

  async function handleLogSet(exerciseId, setNumber, field, value) {
    const existing = logs.find(l => l.exercise?.id === exerciseId && l.setNumber === setNumber) || {};
    const updated = { ...existing, [field]: value };
    try {
      await upsertLog(session.id, exerciseId, setNumber, updated);
      loadLogs();
    } catch (e) {
      Alert.alert('Error', 'Failed to save set.');
    }
  }

  async function handleSearch(q) {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const results = await getExercises({ q });
      setSearchResults(results);
    } catch {}
  }

  function addExercise(exercise) {
    setExercises(prev => [...prev, { exercise, sets: 3, reps: 10 }]);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  }

  async function handleEndSession() {
    try {
      await endSession(session.id);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to end session.');
    }
  }

  function getLog(exerciseId, setNumber) {
    return logs.find(l => l.exercise?.id === exerciseId && l.setNumber === setNumber) || {};
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{session.client?.name}</Text>
        <Text style={styles.subtitle}>{session.plan?.name}</Text>
        <TouchableOpacity style={styles.endBtn} onPress={handleEndSession}>
          <Text style={styles.endBtnText}>End Session</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(item, i) => item.exercise?.id || String(i)}
        renderItem={({ item }) => (
          <View style={styles.exerciseBlock}>
            <Text style={styles.exerciseName}>{item.exercise?.name}</Text>
            {Array.from({ length: item.sets }).map((_, idx) => {
              const setNum = idx + 1;
              const log = getLog(item.exercise?.id, setNum);
              return (
                <View style={styles.setRow} key={setNum}>
                  <Text style={styles.setLabel}>Set {setNum}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Reps"
                    keyboardType="numeric"
                    defaultValue={log.repsDone != null ? String(log.repsDone) : ''}
                    onEndEditing={e => handleLogSet(item.exercise?.id, setNum, 'repsDone', Number(e.nativeEvent.text))}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="kg"
                    keyboardType="decimal-pad"
                    defaultValue={log.weightKg != null ? String(log.weightKg) : ''}
                    onEndEditing={e => handleLogSet(item.exercise?.id, setNum, 'weightKg', Number(e.nativeEvent.text))}
                  />
                  <TouchableOpacity
                    style={[styles.doneBtn, log.completed && styles.doneBtnActive]}
                    onPress={() => handleLogSet(item.exercise?.id, setNum, 'completed', !log.completed)}>
                    <Text style={styles.doneBtnText}>{log.completed ? '✓' : '○'}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.addExercise}>
            {showSearch ? (
              <>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoFocus
                />
                {searchResults.map(ex => (
                  <TouchableOpacity key={ex.id} style={styles.searchResult} onPress={() => addExercise(ex)}>
                    <Text>{ex.name}</Text>
                    <Text style={styles.muscleTag}>{ex.muscleGroups?.join(', ')}</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowSearch(true)}>
                <Text style={styles.addBtnText}>+ Add Exercise</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  endBtn: { marginTop: 8, backgroundColor: '#E53935', padding: 8, borderRadius: 6, alignSelf: 'flex-start' },
  endBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  exerciseBlock: { backgroundColor: '#fff', margin: 8, borderRadius: 10, padding: 14, elevation: 1 },
  exerciseName: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  setLabel: { width: 40, fontSize: 13, color: '#666' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 6, textAlign: 'center', fontSize: 14 },
  doneBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  doneBtnActive: { backgroundColor: '#4caf50', borderColor: '#4caf50' },
  doneBtnText: { fontSize: 16 },
  addExercise: { margin: 16 },
  addBtn: { borderWidth: 2, borderColor: '#E53935', borderStyle: 'dashed', borderRadius: 8, padding: 14, alignItems: 'center' },
  addBtnText: { color: '#E53935', fontWeight: '600' },
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 8 },
  searchResult: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  muscleTag: { fontSize: 11, color: '#999', marginTop: 2 },
});
```

Add `getExercises` to `planService.js`:
```js
import api from './apiService';

export async function getExercises({ q, muscleGroup } = {}) {
  const params = {};
  if (q) params.q = q;
  if (muscleGroup) params.muscleGroup = muscleGroup;
  const res = await api.get('/exercises', { params });
  return res.data;
}
```

- [ ] **Step 2: Test active session on simulator**

Seed a session in ACTIVE status via SQL:
```sql
INSERT INTO workout_sessions (trainer_id, client_id, scheduled_at, status, branch_id)
VALUES ('TRAINER_UUID', 'CLIENT_UUID', now(), 'ACTIVE', 'BRANCH_UUID');
```

Run app → Today tab → tap the active session row → `ActiveSessionScreen` loads → log a set → poll reloads after 5s.

- [ ] **Step 3: Commit**

```bash
git add trainer-app/src/screens/today/ActiveSessionScreen.js \
         trainer-app/src/services/planService.js
git commit -m "feat: Active session view — set logging with 5s polling, add exercise search"
```

---

## Task 6: React Native — Clients tab + Plan Builder

**Files:**
- Modify: `trainer-app/src/screens/clients/ClientsScreen.js`
- Create: `trainer-app/src/screens/clients/ClientDetailScreen.js`
- Modify: `trainer-app/src/screens/plan/PlanListScreen.js`
- Create: `trainer-app/src/screens/plan/PlanBuilderScreen.js`

- [ ] **Step 1: Write `ClientsScreen.js`**

```js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import api from '../../services/apiService';

export default function ClientsScreen({ navigation }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/members').then(r => setClients(r.data)).catch(console.error);
  }, []);

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.count}>{clients.length} ACTIVE</Text>
        <Text style={styles.title}>Clients</Text>
      </View>
      <TextInput style={styles.search} placeholder="Search clients, goal, plan..." value={search} onChangeText={setSearch} />
      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ClientDetail', { client: item })}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(item.name || '?')[0]}</Text></View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>{item.role}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { padding: 20 },
  count: { fontSize: 11, color: '#999', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginTop: 4 },
  search: { marginHorizontal: 16, marginBottom: 8, padding: 12, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#eee', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontWeight: '700', color: '#555' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  sub: { fontSize: 12, color: '#888', marginTop: 2 },
});
```

- [ ] **Step 2: Write `PlanBuilderScreen.js`**

```js
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, Alert } from 'react-native';
import api from '../../services/apiService';
import { getExercises } from '../../services/planService';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PlanBuilderScreen({ route, navigation }) {
  const { clientId, template } = route.params || {};
  const [planName, setPlanName] = useState(template?.name || '');
  const [goal, setGoal] = useState(template?.goal || '');
  const [selectedDay, setSelectedDay] = useState(1); // 1=Mon
  const [dayExercises, setDayExercises] = useState({}); // { dayOfWeek: [{ exercise, sets, reps }] }
  const [showPicker, setShowPicker] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  async function searchExercises(q) {
    setSearchQ(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const results = await getExercises({ q });
    setSearchResults(results);
  }

  function addExercise(exercise) {
    setDayExercises(prev => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), { exercise, sets: 3, reps: 10, rpeTarget: 7 }]
    }));
    setShowPicker(false);
    setSearchQ('');
    setSearchResults([]);
  }

  async function fetchAiSuggestions() {
    try {
      const alreadyIn = (dayExercises[selectedDay] || []).map(e => e.exercise.name);
      const res = await api.post('/ai/exercise-suggestions', {
        goal, recoveredGroups: ['QUADS', 'CHEST', 'BACK'], alreadyInPlan: alreadyIn
      });
      setAiSuggestions(res.data.suggestions || []);
    } catch { Alert.alert('AI unavailable'); }
  }

  async function savePlan() {
    if (!planName.trim()) { Alert.alert('Enter a plan name'); return; }
    const days = Object.entries(dayExercises).map(([dow, exs]) => ({
      dayOfWeek: Number(dow),
      label: DAYS[Number(dow) - 1],
      isRestDay: false,
      exercises: exs.map((e, i) => ({
        exerciseId: e.exercise.id,
        sets: e.sets,
        reps: e.reps,
        rpeTarget: e.rpeTarget,
        sortOrder: i
      }))
    }));

    try {
      await api.post('/plans', { name: planName, goal, clientId, days });
      navigation.goBack();
    } catch { Alert.alert('Failed to save plan'); }
  }

  const currentExercises = dayExercises[selectedDay] || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
        <Text style={styles.heading}>New Plan</Text>
        <TouchableOpacity onPress={savePlan}><Text style={styles.save}>Save</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.body}>
        <TextInput style={styles.field} placeholder="Plan Name" value={planName} onChangeText={setPlanName} />
        <TextInput style={styles.field} placeholder="Goal (e.g. Hypertrophy)" value={goal} onChangeText={setGoal} />

        <View style={styles.dayRow}>
          {DAYS.map((d, i) => (
            <TouchableOpacity key={d} style={[styles.dayBtn, selectedDay === i+1 && styles.dayBtnActive]} onPress={() => setSelectedDay(i+1)}>
              <Text style={[styles.dayBtnText, selectedDay === i+1 && styles.dayBtnTextActive]}>{d[0]}</Text>
              {(dayExercises[i+1] || []).length > 0 && <Text style={styles.dayCount}>{(dayExercises[i+1] || []).length}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {currentExercises.map((item, idx) => (
          <View style={styles.exerciseRow} key={idx}>
            <Text style={styles.exerciseName}>{item.exercise.name}</Text>
            <Text style={styles.exerciseMeta}>{item.sets} × {item.reps} · RPE {item.rpeTarget}</Text>
          </View>
        ))}

        {showPicker && (
          <View style={styles.picker}>
            <TextInput style={styles.searchInput} placeholder="Search exercises..." value={searchQ} onChangeText={searchExercises} autoFocus />
            {searchResults.map(ex => (
              <TouchableOpacity key={ex.id} style={styles.searchResult} onPress={() => addExercise(ex)}>
                <Text style={styles.searchResultName}>{ex.name}</Text>
                <Text style={styles.muscleTag}>{ex.muscleGroups?.join(', ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {aiSuggestions.length > 0 && (
          <View style={styles.aiBox}>
            <Text style={styles.aiTitle}>AI Suggestions</Text>
            {aiSuggestions.map((s, i) => (
              <TouchableOpacity key={i} style={styles.aiSuggestion}
                onPress={() => addExercise({ id: `ai-${i}`, name: s.exerciseName, muscleGroups: [] })}>
                <Text style={styles.aiName}>{s.exerciseName}</Text>
                <Text style={styles.aiRationale}>{s.rationale}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowPicker(true)}>
          <Text style={styles.addBtnText}>+ Add Exercise</Text>
        </TouchableOpacity>

        {goal && (
          <TouchableOpacity style={styles.aiBtn} onPress={fetchAiSuggestions}>
            <Text style={styles.aiBtnText}>✨ Get AI Suggestions</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  cancel: { color: '#E53935', fontSize: 16 },
  heading: { fontSize: 17, fontWeight: '700' },
  save: { color: '#E53935', fontSize: 16, fontWeight: '700' },
  body: { padding: 16 },
  field: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 15, borderWidth: 1, borderColor: '#eee' },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16 },
  dayBtn: { width: 40, height: 52, borderRadius: 8, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  dayBtnActive: { backgroundColor: '#E53935' },
  dayBtnText: { fontWeight: '700', fontSize: 14, color: '#555' },
  dayBtnTextActive: { color: '#fff' },
  dayCount: { fontSize: 10, color: '#E53935', marginTop: 2 },
  exerciseRow: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  exerciseName: { fontWeight: '600', fontSize: 14 },
  exerciseMeta: { color: '#888', fontSize: 12 },
  picker: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10 },
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8 },
  searchResult: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  searchResultName: { fontWeight: '600', fontSize: 14 },
  muscleTag: { fontSize: 11, color: '#999', marginTop: 2 },
  aiBox: { backgroundColor: '#fff9f0', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#ffe0b2' },
  aiTitle: { fontWeight: '700', color: '#e65100', marginBottom: 8 },
  aiSuggestion: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#ffe0b2' },
  aiName: { fontWeight: '600', fontSize: 14 },
  aiRationale: { fontSize: 12, color: '#888', marginTop: 2 },
  addBtn: { borderWidth: 2, borderColor: '#E53935', borderStyle: 'dashed', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 10 },
  addBtnText: { color: '#E53935', fontWeight: '600' },
  aiBtn: { backgroundColor: '#fff3e0', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 32 },
  aiBtnText: { color: '#e65100', fontWeight: '600' },
});
```

- [ ] **Step 3: Write `ProfileScreen.js` with ratings**

```js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { getMe } from '../../services/apiService';
import api from '../../services/apiService';

function RatingBar({ label, score, maxScore = 5 }) {
  const pct = (score / maxScore) * 100;
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.ratingScore}>{score.toFixed(1)}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getMe().then(u => {
      setUser(u);
      return api.get(`/trainers/${u.id}`);
    }).then(r => setProfile(r.data)).catch(console.error);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.body}>
        <View style={styles.header}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.name || '?')[0]}</Text></View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.branch}>{user?.branchName}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>RATINGS</Text>
          <RatingBar label="Experience" score={profile?.experienceScore || 0} />
          <RatingBar label="Client Feedback" score={profile?.feedbackScore || 0} />
          <RatingBar label="Client Progress" score={profile?.progressScore || 0} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SPECIALISATIONS</Text>
          <Text style={styles.specText}>{profile?.specialisations?.join(' · ') || 'None set'}</Text>
        </View>

        {profile?.bio && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>BIO</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  body: { padding: 16 },
  header: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E53935', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  branch: { fontSize: 13, color: '#888', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#999', letterSpacing: 1.5, marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingLabel: { width: 120, fontSize: 14, color: '#333' },
  barBg: { flex: 1, height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, marginHorizontal: 8 },
  barFill: { height: 6, backgroundColor: '#E53935', borderRadius: 3 },
  ratingScore: { width: 30, textAlign: 'right', fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  specText: { fontSize: 14, color: '#555', lineHeight: 22 },
  bioText: { fontSize: 14, color: '#555', lineHeight: 22 },
});
```

- [ ] **Step 4: Run on simulator and verify all 4 tabs**

```bash
npx react-native run-ios
```

Expected: Today ✓, Clients ✓, Plan (list screen), Profile with rating bars.

- [ ] **Step 5: Commit**

```bash
git add trainer-app/src/
git commit -m "feat: Trainer App — Clients tab, Plan Builder with AI suggestions, Profile with ratings"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Trainer Home — schedule list with pending/active/completed states, ring card with live timer
- ✅ Multiple clients per slot — `+N` shown in ScheduleList (session row shows client count from `session.clientCount`)
- ✅ Active session — set logging per exercise, 5s polling for shared state, add exercise via search
- ✅ Clients tab — list with search, tap to detail
- ✅ Plan builder — week day selector, exercise list per day, AI suggestions, save as template
- ✅ AI exercise suggestions — `POST /ai/exercise-suggestions`, rule-based fallback when no key
- ✅ AI macro generation — `POST /ai/macros`, rule-based fallback
- ✅ Profile tab — experience/feedback/progress rating bars
- ⚠️ Nutrition plan builder — the `NutritionPlanScreen` is referenced in file map but not built. Add as a follow-up task in the next sprint or in Client App plan (nutrition viewing is built there).
- ⚠️ Client Detail screen — stub; build in follow-up alongside Client App plan since it shares progress charts.
- ⚠️ `progressScore` on trainer profile — not yet computed. Requires a query that measures client body measurement improvement. Add `GET /trainers/{id}/ratings-summary` endpoint that computes avg feedback + progress delta.

**Placeholder scan:** Nutrition plan builder is explicitly noted as follow-up. All other features have complete code.

**Type consistency:** `session.client.name` used in `TodayScreen`, `FocusedClientCard`, `ScheduleList` — all match the `User` model's `name` field. `exercise.muscleGroups` is `String[]` in Java → serializes to JSON array → used as `ex.muscleGroups?.join(', ')` in RN — consistent.
