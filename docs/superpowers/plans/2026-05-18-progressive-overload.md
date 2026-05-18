# Progressive Overload + Last-Session History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship AI-driven progressive-overload target updates per session-end, plus an in-session "what you did last time" history surface for every exercise.

**Architecture:** Backend (Spring Boot 3 / Java 21) owns the algorithm. On `POST /sessions/{id}/complete` an async `OverloadService` looks at the last 3 sessions of each exercise, calls Claude Haiku for a strict-JSON next target, and upserts into `exercise_target`. Client app fetches per-exercise history via `GET /clients/me/exercises/{id}/history` and renders it inline in the Active Session screen with a tap-to-expand bottom sheet. Trainer app shows an `AI-set` chip on managed targets and lets the trainer override (which pins the target).

**Tech Stack:** Spring Boot 3.3.5, Java 21, Flyway, JPA/Hibernate, Postgres 16, Testcontainers, JUnit 5, Mockito, Anthropic Java SDK (`com.anthropic:anthropic-java`), React Native 0.74, Jest, Detox.

**Spec:** `docs/superpowers/specs/2026-05-18-progressive-overload-design.md`

---

## Prerequisites

This plan layers on top of the master plan (`docs/superpowers/plans/2026-05-04-*`). It needs the following from earlier phases:

- **Backend Phase 1 (admin-web data model):** must create `exercises` table and `workout_sessions` table before this plan's first migration runs.
  - If these tables do not yet exist, add tasks 1.0a / 1.0b below to define them as part of this plan's first migration.
- **client-app:** must have an `ActiveSessionScreen` component (currently only `HomeShell`, `LoginScreen`, `PendingScreen` exist). Phase 2 below is **blocked** until that screen lands.
- **trainer-app:** must have a workout plan builder screen. Phase 3 below is **blocked** until that screen lands.

**Phase 1 (backend) is the only phase ready to execute today.** Phases 2 and 3 are documented in full so engineers can pick them up the moment the prerequisite apps catch up.

---

## File Structure

### Backend (new + modified)

```
backend/src/main/resources/db/migration/
  V4__exercises_and_workout_sessions.sql        (NEW — only if Phase 1 plan hasn't created these)
  V5__progressive_overload.sql                  (NEW — three tables for this feature)

backend/src/main/java/in/vis/
  model/
    Exercise.java                               (NEW — entity for exercises)
    WorkoutSession.java                         (NEW — entity for workout_sessions)
    ExerciseSessionLog.java                     (NEW)
    ExerciseTarget.java                         (NEW)
    AiTargetSuggestion.java                     (NEW)
  enums/
    ExerciseType.java                           (NEW — COMPOUND/ISOLATION/MACHINE/BODYWEIGHT/CORE)
    TargetSource.java                           (NEW — TRAINER/AI/AI_BOOTSTRAP)
  repository/
    ExerciseRepository.java                     (NEW)
    WorkoutSessionRepository.java               (NEW)
    ExerciseSessionLogRepository.java           (NEW)
    ExerciseTargetRepository.java               (NEW)
    AiTargetSuggestionRepository.java           (NEW)
  service/
    OverloadPromptBuilder.java                  (NEW — builds prompt body)
    ClaudeOverloadAdapter.java                  (NEW — Anthropic SDK wrapper)
    OverloadService.java                        (NEW — orchestrator)
    SessionService.java                         (NEW — session lifecycle + dispatch)
  controller/
    SessionController.java                      (NEW — POST /sessions/{id}/complete)
    ExerciseHistoryController.java              (NEW — GET /clients/me/exercises/{id}/history)
  dto/
    SetEntryRequest.java                        (NEW)
    SessionCompleteRequest.java                 (NEW)
    NextTargetOutput.java                       (NEW — AI response shape)
    ExerciseHistoryResponse.java                (NEW)
  config/
    AsyncConfig.java                            (NEW — @EnableAsync + thread pool)
    AnthropicConfig.java                        (NEW — Anthropic client bean)

backend/src/main/resources/application.properties  (MODIFY — add anthropic.api-key, anthropic.model)

backend/pom.xml                                  (MODIFY — add anthropic-java dependency)

backend/src/test/java/in/vis/
  service/
    OverloadPromptBuilderTest.java              (NEW)
    OverloadServiceTest.java                    (NEW)
    ClaudeOverloadAdapterTest.java              (NEW — stub responses, no live calls)
  controller/
    SessionControllerTest.java                  (NEW — @WebMvcTest slice)
    ExerciseHistoryControllerTest.java          (NEW — @WebMvcTest slice)
  integration/
    OverloadIntegrationTest.java                (NEW — Testcontainers full flow, mocked AI)
```

### Client App (Phase 2 — blocked)

```
client-app/src/
  services/
    exerciseHistoryService.ts                   (NEW)
  hooks/
    useExerciseHistory.ts                       (NEW)
  components/session/
    UpNextRow.tsx                               (NEW — subtitle with last-session stats)
    HistorySheet.tsx                            (NEW — bottom sheet)
    FirstTimeBadge.tsx                          (NEW)
  screens/
    ActiveSessionScreen.tsx                     (MODIFY — wire UpNextRow + sheet)

client-app/__tests__/
  components/session/UpNextRow.test.tsx         (NEW)
  components/session/HistorySheet.test.tsx      (NEW)
  hooks/useExerciseHistory.test.ts              (NEW)
```

### Trainer App (Phase 3 — blocked)

```
trainer-app/src/
  components/plan/
    AiSetChip.tsx                               (NEW)
    AiManagedToggle.tsx                         (NEW)
    TargetEditorRow.tsx                         (MODIFY — render chip + override flow)
  services/
    exerciseTargetService.ts                    (NEW)

trainer-app/__tests__/
  components/plan/AiSetChip.test.tsx            (NEW)
  components/plan/TargetEditorRow.test.tsx      (NEW)
```

---

## Phase 1 — Backend

### Task 1.0: Confirm prerequisite tables

**Files:**
- Inspect: `backend/src/main/resources/db/migration/`

- [ ] **Step 1: Check whether `exercises` and `workout_sessions` migrations already exist**

Run: `ls backend/src/main/resources/db/migration/`

If both `V*__create_exercises.sql` and `V*__create_workout_sessions.sql` are present from Phase 1 of the master plan, **skip to Task 1.1**.

If they do not exist, do Task 1.0a + 1.0b first.

### Task 1.0a: Migration — exercises table (only if not already present)

**Files:**
- Create: `backend/src/main/resources/db/migration/V4__exercises_and_workout_sessions.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- V4__exercises_and_workout_sessions.sql
CREATE TABLE exercises (
    id              BIGSERIAL PRIMARY KEY,
    branch_id       BIGINT NOT NULL REFERENCES branches(id),
    name            TEXT NOT NULL,
    type            TEXT NOT NULL CHECK (type IN ('COMPOUND','ISOLATION','MACHINE','BODYWEIGHT','CORE')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_exercises_branch ON exercises(branch_id);

CREATE TABLE workout_sessions (
    id              BIGSERIAL PRIMARY KEY,
    branch_id       BIGINT NOT NULL REFERENCES branches(id),
    client_id       BIGINT NOT NULL REFERENCES users(id),
    status          TEXT NOT NULL CHECK (status IN ('IN_PROGRESS','DONE','ABANDONED')),
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at    TIMESTAMPTZ
);
CREATE INDEX idx_workout_sessions_client ON workout_sessions(client_id, started_at DESC);
```

- [ ] **Step 2: Run migration locally**

Run: `cd backend && mvn flyway:migrate`
Expected: `Successfully applied 1 migration to schema "public", now at version v4`

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/resources/db/migration/V4__exercises_and_workout_sessions.sql
git commit -m "VIS-61: add exercises + workout_sessions tables"
```

### Task 1.1: Migration — three overload tables

**Files:**
- Create: `backend/src/main/resources/db/migration/V5__progressive_overload.sql`

- [ ] **Step 1: Write the migration**

```sql
-- V5__progressive_overload.sql
CREATE TABLE exercise_session_log (
    id              BIGSERIAL PRIMARY KEY,
    branch_id       BIGINT NOT NULL REFERENCES branches(id),
    client_id       BIGINT NOT NULL REFERENCES users(id),
    exercise_id     BIGINT NOT NULL REFERENCES exercises(id),
    session_id      BIGINT NOT NULL REFERENCES workout_sessions(id),
    set_idx         SMALLINT NOT NULL,
    weight_kg       NUMERIC(6,2),
    reps            SMALLINT NOT NULL,
    rpe             NUMERIC(3,1),
    completed       BOOLEAN NOT NULL,
    completed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_esl_client_exercise_time
    ON exercise_session_log(client_id, exercise_id, completed_at DESC);
CREATE INDEX idx_esl_session ON exercise_session_log(session_id);

CREATE TABLE exercise_target (
    id              BIGSERIAL PRIMARY KEY,
    branch_id       BIGINT NOT NULL REFERENCES branches(id),
    client_id       BIGINT NOT NULL REFERENCES users(id),
    exercise_id     BIGINT NOT NULL REFERENCES exercises(id),
    weight_kg       NUMERIC(6,2),
    reps_low        SMALLINT NOT NULL,
    reps_high       SMALLINT NOT NULL,
    sets            SMALLINT NOT NULL,
    source          TEXT NOT NULL CHECK (source IN ('TRAINER','AI','AI_BOOTSTRAP')),
    ai_locked       BOOLEAN NOT NULL DEFAULT FALSE,
    ai_rationale    TEXT,
    ai_confidence   NUMERIC(3,2),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_target_client_exercise UNIQUE (client_id, exercise_id)
);

CREATE TABLE ai_target_suggestion (
    id                  BIGSERIAL PRIMARY KEY,
    branch_id           BIGINT NOT NULL REFERENCES branches(id),
    client_id           BIGINT NOT NULL REFERENCES users(id),
    exercise_id         BIGINT NOT NULL REFERENCES exercises(id),
    session_id_trigger  BIGINT REFERENCES workout_sessions(id),
    model               TEXT NOT NULL,
    prompt_hash         TEXT NOT NULL,
    prompt_body         JSONB NOT NULL,
    output_json         JSONB NOT NULL,
    applied             BOOLEAN NOT NULL,
    reject_reason       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ats_client_exercise_time
    ON ai_target_suggestion(client_id, exercise_id, created_at DESC);
```

- [ ] **Step 2: Run migration**

Run: `cd backend && mvn flyway:migrate`
Expected: applies V5, schema now at version v5

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/resources/db/migration/V5__progressive_overload.sql
git commit -m "VIS-61: add progressive overload schema (session_log, target, ai_suggestion)"
```

### Task 1.2: Enums

**Files:**
- Create: `backend/src/main/java/in/vis/enums/ExerciseType.java`
- Create: `backend/src/main/java/in/vis/enums/TargetSource.java`

- [ ] **Step 1: Write `ExerciseType.java`**

```java
package in.vis.enums;

public enum ExerciseType {
    COMPOUND, ISOLATION, MACHINE, BODYWEIGHT, CORE
}
```

- [ ] **Step 2: Write `TargetSource.java`**

```java
package in.vis.enums;

public enum TargetSource {
    TRAINER, AI, AI_BOOTSTRAP
}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/in/vis/enums/ExerciseType.java backend/src/main/java/in/vis/enums/TargetSource.java
git commit -m "VIS-61: add ExerciseType and TargetSource enums"
```

### Task 1.3: Entity — `Exercise`

**Files:**
- Create: `backend/src/main/java/in/vis/model/Exercise.java`

- [ ] **Step 1: Write the entity**

```java
package in.vis.model;

import in.vis.enums.ExerciseType;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "exercises")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExerciseType type;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public Long getId() { return id; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long v) { this.branchId = v; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public ExerciseType getType() { return type; }
    public void setType(ExerciseType v) { this.type = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }
}
```

- [ ] **Step 2: Compile**

Run: `cd backend && mvn compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/in/vis/model/Exercise.java
git commit -m "VIS-61: add Exercise entity"
```

### Task 1.4: Entity — `WorkoutSession`

**Files:**
- Create: `backend/src/main/java/in/vis/model/WorkoutSession.java`

- [ ] **Step 1: Write the entity**

```java
package in.vis.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {

    public enum Status { IN_PROGRESS, DONE, ABANDONED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    public Long getId() { return id; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long v) { this.branchId = v; }
    public Long getClientId() { return clientId; }
    public void setClientId(Long v) { this.clientId = v; }
    public Status getStatus() { return status; }
    public void setStatus(Status v) { this.status = v; }
    public OffsetDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(OffsetDateTime v) { this.startedAt = v; }
    public OffsetDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }

    @PrePersist
    void prePersist() {
        if (startedAt == null) startedAt = OffsetDateTime.now();
        if (status == null) status = Status.IN_PROGRESS;
    }
}
```

- [ ] **Step 2: Compile**

Run: `cd backend && mvn compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/in/vis/model/WorkoutSession.java
git commit -m "VIS-61: add WorkoutSession entity"
```

### Task 1.5: Entity — `ExerciseSessionLog`

**Files:**
- Create: `backend/src/main/java/in/vis/model/ExerciseSessionLog.java`

- [ ] **Step 1: Write the entity**

```java
package in.vis.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "exercise_session_log")
public class ExerciseSessionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "exercise_id", nullable = false)
    private Long exerciseId;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "set_idx", nullable = false)
    private Short setIdx;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(nullable = false)
    private Short reps;

    @Column
    private BigDecimal rpe;

    @Column(nullable = false)
    private Boolean completed;

    @Column(name = "completed_at", nullable = false)
    private OffsetDateTime completedAt;

    public Long getId() { return id; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long v) { this.branchId = v; }
    public Long getClientId() { return clientId; }
    public void setClientId(Long v) { this.clientId = v; }
    public Long getExerciseId() { return exerciseId; }
    public void setExerciseId(Long v) { this.exerciseId = v; }
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long v) { this.sessionId = v; }
    public Short getSetIdx() { return setIdx; }
    public void setSetIdx(Short v) { this.setIdx = v; }
    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal v) { this.weightKg = v; }
    public Short getReps() { return reps; }
    public void setReps(Short v) { this.reps = v; }
    public BigDecimal getRpe() { return rpe; }
    public void setRpe(BigDecimal v) { this.rpe = v; }
    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean v) { this.completed = v; }
    public OffsetDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(OffsetDateTime v) { this.completedAt = v; }

    @PrePersist
    void prePersist() {
        if (completedAt == null) completedAt = OffsetDateTime.now();
    }
}
```

- [ ] **Step 2: Compile + commit**

Run: `cd backend && mvn compile -q`

```bash
git add backend/src/main/java/in/vis/model/ExerciseSessionLog.java
git commit -m "VIS-61: add ExerciseSessionLog entity"
```

### Task 1.6: Entity — `ExerciseTarget`

**Files:**
- Create: `backend/src/main/java/in/vis/model/ExerciseTarget.java`

- [ ] **Step 1: Write the entity**

```java
package in.vis.model;

import in.vis.enums.TargetSource;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "exercise_target",
       uniqueConstraints = @UniqueConstraint(columnNames = {"client_id", "exercise_id"}))
public class ExerciseTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "exercise_id", nullable = false)
    private Long exerciseId;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(name = "reps_low", nullable = false)
    private Short repsLow;

    @Column(name = "reps_high", nullable = false)
    private Short repsHigh;

    @Column(nullable = false)
    private Short sets;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TargetSource source;

    @Column(name = "ai_locked", nullable = false)
    private Boolean aiLocked = false;

    @Column(name = "ai_rationale")
    private String aiRationale;

    @Column(name = "ai_confidence")
    private BigDecimal aiConfidence;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Long getId() { return id; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long v) { this.branchId = v; }
    public Long getClientId() { return clientId; }
    public void setClientId(Long v) { this.clientId = v; }
    public Long getExerciseId() { return exerciseId; }
    public void setExerciseId(Long v) { this.exerciseId = v; }
    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal v) { this.weightKg = v; }
    public Short getRepsLow() { return repsLow; }
    public void setRepsLow(Short v) { this.repsLow = v; }
    public Short getRepsHigh() { return repsHigh; }
    public void setRepsHigh(Short v) { this.repsHigh = v; }
    public Short getSets() { return sets; }
    public void setSets(Short v) { this.sets = v; }
    public TargetSource getSource() { return source; }
    public void setSource(TargetSource v) { this.source = v; }
    public Boolean getAiLocked() { return aiLocked; }
    public void setAiLocked(Boolean v) { this.aiLocked = v; }
    public String getAiRationale() { return aiRationale; }
    public void setAiRationale(String v) { this.aiRationale = v; }
    public BigDecimal getAiConfidence() { return aiConfidence; }
    public void setAiConfidence(BigDecimal v) { this.aiConfidence = v; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime v) { this.updatedAt = v; }

    @PrePersist @PreUpdate
    void touch() { this.updatedAt = OffsetDateTime.now(); }
}
```

- [ ] **Step 2: Compile + commit**

Run: `cd backend && mvn compile -q`

```bash
git add backend/src/main/java/in/vis/model/ExerciseTarget.java
git commit -m "VIS-61: add ExerciseTarget entity"
```

### Task 1.7: Entity — `AiTargetSuggestion`

**Files:**
- Create: `backend/src/main/java/in/vis/model/AiTargetSuggestion.java`

- [ ] **Step 1: Write the entity**

```java
package in.vis.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ai_target_suggestion")
public class AiTargetSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "exercise_id", nullable = false)
    private Long exerciseId;

    @Column(name = "session_id_trigger")
    private Long sessionIdTrigger;

    @Column(nullable = false)
    private String model;

    @Column(name = "prompt_hash", nullable = false)
    private String promptHash;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "prompt_body", nullable = false, columnDefinition = "jsonb")
    private String promptBody;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "output_json", nullable = false, columnDefinition = "jsonb")
    private String outputJson;

    @Column(nullable = false)
    private Boolean applied;

    @Column(name = "reject_reason")
    private String rejectReason;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public Long getId() { return id; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long v) { this.branchId = v; }
    public Long getClientId() { return clientId; }
    public void setClientId(Long v) { this.clientId = v; }
    public Long getExerciseId() { return exerciseId; }
    public void setExerciseId(Long v) { this.exerciseId = v; }
    public Long getSessionIdTrigger() { return sessionIdTrigger; }
    public void setSessionIdTrigger(Long v) { this.sessionIdTrigger = v; }
    public String getModel() { return model; }
    public void setModel(String v) { this.model = v; }
    public String getPromptHash() { return promptHash; }
    public void setPromptHash(String v) { this.promptHash = v; }
    public String getPromptBody() { return promptBody; }
    public void setPromptBody(String v) { this.promptBody = v; }
    public String getOutputJson() { return outputJson; }
    public void setOutputJson(String v) { this.outputJson = v; }
    public Boolean getApplied() { return applied; }
    public void setApplied(Boolean v) { this.applied = v; }
    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String v) { this.rejectReason = v; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime v) { this.createdAt = v; }

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }
}
```

- [ ] **Step 2: Compile + commit**

Run: `cd backend && mvn compile -q`

```bash
git add backend/src/main/java/in/vis/model/AiTargetSuggestion.java
git commit -m "VIS-61: add AiTargetSuggestion entity"
```

### Task 1.8: Repositories

**Files:**
- Create: `backend/src/main/java/in/vis/repository/ExerciseRepository.java`
- Create: `backend/src/main/java/in/vis/repository/WorkoutSessionRepository.java`
- Create: `backend/src/main/java/in/vis/repository/ExerciseSessionLogRepository.java`
- Create: `backend/src/main/java/in/vis/repository/ExerciseTargetRepository.java`
- Create: `backend/src/main/java/in/vis/repository/AiTargetSuggestionRepository.java`

- [ ] **Step 1: Write `ExerciseRepository`**

```java
package in.vis.repository;

import in.vis.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {}
```

- [ ] **Step 2: Write `WorkoutSessionRepository`**

```java
package in.vis.repository;

import in.vis.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {}
```

- [ ] **Step 3: Write `ExerciseSessionLogRepository` with the only custom query we need**

```java
package in.vis.repository;

import in.vis.model.ExerciseSessionLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExerciseSessionLogRepository extends JpaRepository<ExerciseSessionLog, Long> {

    @Query("""
        SELECT l FROM ExerciseSessionLog l
        WHERE l.clientId = :clientId AND l.exerciseId = :exerciseId
        ORDER BY l.completedAt DESC
    """)
    List<ExerciseSessionLog> findRecent(
        @Param("clientId") Long clientId,
        @Param("exerciseId") Long exerciseId,
        Pageable pageable
    );

    List<ExerciseSessionLog> findBySessionIdOrderBySetIdxAsc(Long sessionId);
}
```

- [ ] **Step 4: Write `ExerciseTargetRepository`**

```java
package in.vis.repository;

import in.vis.model.ExerciseTarget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExerciseTargetRepository extends JpaRepository<ExerciseTarget, Long> {

    Optional<ExerciseTarget> findByClientIdAndExerciseId(Long clientId, Long exerciseId);
}
```

- [ ] **Step 5: Write `AiTargetSuggestionRepository`**

```java
package in.vis.repository;

import in.vis.model.AiTargetSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;

public interface AiTargetSuggestionRepository extends JpaRepository<AiTargetSuggestion, Long> {

    @Query("""
        SELECT COUNT(s) > 0 FROM AiTargetSuggestion s
        WHERE s.clientId = :clientId
          AND s.exerciseId = :exerciseId
          AND s.promptHash = :hash
          AND s.createdAt > :since
    """)
    boolean existsRecent(
        @Param("clientId") Long clientId,
        @Param("exerciseId") Long exerciseId,
        @Param("hash") String hash,
        @Param("since") OffsetDateTime since
    );
}
```

- [ ] **Step 6: Compile**

Run: `cd backend && mvn compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/in/vis/repository/
git commit -m "VIS-61: add JPA repositories for overload feature"
```

### Task 1.9: DTO — `NextTargetOutput` (AI response schema)

**Files:**
- Create: `backend/src/main/java/in/vis/dto/NextTargetOutput.java`

- [ ] **Step 1: Write the record + validator**

```java
package in.vis.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record NextTargetOutput(
    @JsonProperty("weight_kg") BigDecimal weightKg,
    @JsonProperty("reps_low") Integer repsLow,
    @JsonProperty("reps_high") Integer repsHigh,
    Integer sets,
    Decision decision,
    String rationale,
    BigDecimal confidence
) {
    public enum Decision { MAINTAIN, BUMP_REPS, BUMP_WEIGHT }

    /** Returns the reason this output is invalid, or null if valid. */
    public String validationError() {
        if (repsLow == null || repsHigh == null || sets == null)
            return "missing required fields";
        if (repsLow < 1 || repsHigh < repsLow || sets < 1)
            return "rep/set bounds out of order";
        if (rationale == null || rationale.length() > 120)
            return "rationale missing or too long";
        if (confidence == null
            || confidence.compareTo(BigDecimal.ZERO) < 0
            || confidence.compareTo(BigDecimal.ONE) > 0)
            return "confidence out of [0,1]";
        return null;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/main/java/in/vis/dto/NextTargetOutput.java
git commit -m "VIS-61: add NextTargetOutput DTO with validator"
```

### Task 1.10: `OverloadPromptBuilder` — TDD

**Files:**
- Create: `backend/src/test/java/in/vis/service/OverloadPromptBuilderTest.java`
- Create: `backend/src/main/java/in/vis/service/OverloadPromptBuilder.java`

- [ ] **Step 1: Write failing test**

```java
package in.vis.service;

import in.vis.enums.ExerciseType;
import in.vis.model.Exercise;
import in.vis.model.ExerciseSessionLog;
import in.vis.model.ExerciseTarget;
import in.vis.enums.TargetSource;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class OverloadPromptBuilderTest {

    @Test
    void build_includesExerciseTargetAndHistoryAsJson() {
        Exercise ex = new Exercise();
        ex.setName("Bench Press");
        ex.setType(ExerciseType.COMPOUND);

        ExerciseTarget target = new ExerciseTarget();
        target.setWeightKg(new BigDecimal("90.00"));
        target.setRepsLow((short) 6);
        target.setRepsHigh((short) 8);
        target.setSets((short) 4);
        target.setSource(TargetSource.AI);

        ExerciseSessionLog set1 = new ExerciseSessionLog();
        set1.setSetIdx((short) 1);
        set1.setWeightKg(new BigDecimal("90.00"));
        set1.setReps((short) 8);
        set1.setRpe(new BigDecimal("7.0"));
        set1.setCompleted(true);
        set1.setCompletedAt(OffsetDateTime.parse("2026-05-15T10:00:00Z"));

        String body = new OverloadPromptBuilder().build(ex, target, List.of(set1));

        assertThat(body).contains("\"name\":\"Bench Press\"");
        assertThat(body).contains("\"type\":\"COMPOUND\"");
        assertThat(body).contains("\"currentTarget\"");
        assertThat(body).contains("\"history\"");
        assertThat(body).contains("\"weight\":90");
        assertThat(body).contains("\"reps\":8");
    }
}
```

- [ ] **Step 2: Run test and verify it fails**

Run: `cd backend && mvn test -Dtest=OverloadPromptBuilderTest -q`
Expected: COMPILATION FAILURE — `OverloadPromptBuilder` does not exist.

- [ ] **Step 3: Implement `OverloadPromptBuilder`**

```java
package in.vis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import in.vis.model.Exercise;
import in.vis.model.ExerciseSessionLog;
import in.vis.model.ExerciseTarget;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OverloadPromptBuilder {

    private final ObjectMapper json = new ObjectMapper();

    public String build(Exercise exercise, ExerciseTarget target, List<ExerciseSessionLog> history) {
        ObjectNode root = json.createObjectNode();

        ObjectNode ex = root.putObject("exercise");
        ex.put("name", exercise.getName());
        ex.put("type", exercise.getType().name());

        ObjectNode tgt = root.putObject("currentTarget");
        if (target.getWeightKg() != null) tgt.put("weight_kg", target.getWeightKg());
        tgt.put("reps_low", target.getRepsLow());
        tgt.put("reps_high", target.getRepsHigh());
        tgt.put("sets", target.getSets());

        ArrayNode hist = root.putArray("history");
        // Group by session (here history is a flat per-set list ordered by time desc).
        // To keep things simple for v1, emit a flat sets[] grouped by sessionId.
        java.util.Map<Long, ArrayNode> bySession = new java.util.LinkedHashMap<>();
        java.util.Map<Long, String> sessionTs = new java.util.LinkedHashMap<>();
        for (ExerciseSessionLog l : history) {
            ArrayNode sets = bySession.computeIfAbsent(l.getSessionId(), k -> json.createArrayNode());
            sessionTs.putIfAbsent(l.getSessionId(), l.getCompletedAt().toString());
            ObjectNode s = sets.addObject();
            s.put("idx", l.getSetIdx());
            if (l.getWeightKg() != null) s.put("weight", l.getWeightKg());
            s.put("reps", l.getReps());
            if (l.getRpe() != null) s.put("rpe", l.getRpe());
        }
        for (var e : bySession.entrySet()) {
            ObjectNode session = hist.addObject();
            session.put("session_at", sessionTs.get(e.getKey()));
            session.set("sets", e.getValue());
        }

        return root.toString();
    }
}
```

- [ ] **Step 4: Run test and verify it passes**

Run: `cd backend && mvn test -Dtest=OverloadPromptBuilderTest -q`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/in/vis/service/OverloadPromptBuilder.java backend/src/test/java/in/vis/service/OverloadPromptBuilderTest.java
git commit -m "VIS-61: add OverloadPromptBuilder with json snapshot test"
```

### Task 1.11: Anthropic SDK dep + config

**Files:**
- Modify: `backend/pom.xml`
- Modify: `backend/src/main/resources/application.properties`
- Create: `backend/src/main/java/in/vis/config/AnthropicConfig.java`

- [ ] **Step 1: Add dependency to `pom.xml`** (inside `<dependencies>`)

```xml
<dependency>
    <groupId>com.anthropic</groupId>
    <artifactId>anthropic-java</artifactId>
    <version>1.0.0</version>
</dependency>
```

Verify the latest version on `central.sonatype.com` if 1.0.0 is stale; pin the latest stable release.

- [ ] **Step 2: Add config keys to `application.properties`**

```
anthropic.api-key=${ANTHROPIC_API_KEY:}
anthropic.model=claude-haiku-4-5
anthropic.fallback-model=claude-sonnet-4-6
overload.dedupe-window-hours=1
overload.max-weight-delta-kg=10
```

- [ ] **Step 3: Write `AnthropicConfig`**

```java
package in.vis.config;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AnthropicConfig {

    @Bean
    public AnthropicClient anthropicClient(@Value("${anthropic.api-key}") String apiKey) {
        return AnthropicOkHttpClient.builder().apiKey(apiKey).build();
    }
}
```

- [ ] **Step 4: Verify build**

Run: `cd backend && mvn dependency:resolve -q && mvn compile -q`
Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add backend/pom.xml backend/src/main/resources/application.properties backend/src/main/java/in/vis/config/AnthropicConfig.java
git commit -m "VIS-61: add anthropic-java SDK and config"
```

### Task 1.12: `ClaudeOverloadAdapter` — TDD

**Files:**
- Create: `backend/src/test/java/in/vis/service/ClaudeOverloadAdapterTest.java`
- Create: `backend/src/main/java/in/vis/service/ClaudeOverloadAdapter.java`

- [ ] **Step 1: Write failing test (uses mocked `AnthropicClient`)**

```java
package in.vis.service;

import com.anthropic.client.AnthropicClient;
import com.anthropic.models.messages.ContentBlock;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.TextBlock;
import in.vis.dto.NextTargetOutput;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ClaudeOverloadAdapterTest {

    @Test
    void callJson_parsesValidResponse() {
        AnthropicClient client = mock(AnthropicClient.class);
        var messages = mock(com.anthropic.services.blocking.MessageService.class);
        Message msg = mock(Message.class);
        TextBlock text = mock(TextBlock.class);
        when(text.text()).thenReturn("""
            {"weight_kg":92.5,"reps_low":6,"reps_high":8,"sets":4,
             "decision":"BUMP_WEIGHT","rationale":"hit top of range last two sessions",
             "confidence":0.82}
        """);
        ContentBlock block = mock(ContentBlock.class);
        when(block.text()).thenReturn(Optional.of(text));
        when(msg.content()).thenReturn(List.of(block));
        when(client.messages()).thenReturn(messages);
        when(messages.create(any())).thenReturn(msg);

        ClaudeOverloadAdapter adapter = new ClaudeOverloadAdapter(
            client, "claude-haiku-4-5", "claude-sonnet-4-6"
        );

        NextTargetOutput out = adapter.callJson("{\"exercise\":{}}", "system prompt");

        assertThat(out.weightKg()).isEqualByComparingTo("92.5");
        assertThat(out.repsLow()).isEqualTo(6);
        assertThat(out.repsHigh()).isEqualTo(8);
        assertThat(out.decision()).isEqualTo(NextTargetOutput.Decision.BUMP_WEIGHT);
    }
}
```

- [ ] **Step 2: Run test, verify fail**

Run: `cd backend && mvn test -Dtest=ClaudeOverloadAdapterTest -q`
Expected: compile fail (no `ClaudeOverloadAdapter` yet).

- [ ] **Step 3: Implement `ClaudeOverloadAdapter`**

```java
package in.vis.service;

import com.anthropic.client.AnthropicClient;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.Model;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.vis.dto.NextTargetOutput;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ClaudeOverloadAdapter {

    static final String SYSTEM_PROMPT = """
        You are a strength-training progressive-overload coach. Given the last N sessions of one \
        exercise plus the current target, return the next target as strict JSON. Bias rep-progression \
        first (push to top of rep range), weight-bump second (when client hits top of range for all \
        sets with avg RPE ≤ 8). For compound lifts increment 2.5 kg; for isolation 1.0 kg. Never bump \
        more than one variable per call. If history is inconsistent (skipped sets, failed reps, very \
        high RPE), prefer "maintain". Output JSON only, matching: \
        {"weight_kg":number,"reps_low":int,"reps_high":int,"sets":int,\
        "decision":"MAINTAIN|BUMP_REPS|BUMP_WEIGHT","rationale":"<=120 chars","confidence":0..1}.
        """;

    private final AnthropicClient client;
    private final String primaryModel;
    private final String fallbackModel;
    private final ObjectMapper json = new ObjectMapper();

    public ClaudeOverloadAdapter(
        AnthropicClient client,
        @Value("${anthropic.model}") String primaryModel,
        @Value("${anthropic.fallback-model}") String fallbackModel
    ) {
        this.client = client;
        this.primaryModel = primaryModel;
        this.fallbackModel = fallbackModel;
    }

    public NextTargetOutput callJson(String userJson, String systemOverride) {
        String system = systemOverride == null ? SYSTEM_PROMPT : systemOverride;
        try {
            return callWithModel(userJson, system, primaryModel);
        } catch (RuntimeException e) {
            return callWithModel(userJson, system, fallbackModel);
        }
    }

    private NextTargetOutput callWithModel(String userJson, String system, String model) {
        MessageCreateParams params = MessageCreateParams.builder()
            .model(Model.of(model))
            .maxTokens(512)
            .system(system)
            .addUserMessage(userJson)
            .build();
        Message msg = client.messages().create(params);
        String text = msg.content().stream()
            .map(b -> b.text().map(t -> t.text()).orElse(""))
            .reduce("", String::concat);
        try {
            return json.readValue(text, NextTargetOutput.class);
        } catch (Exception e) {
            throw new RuntimeException("AI returned non-JSON: " + text, e);
        }
    }

    public String model() { return primaryModel; }
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd backend && mvn test -Dtest=ClaudeOverloadAdapterTest -q`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/in/vis/service/ClaudeOverloadAdapter.java backend/src/test/java/in/vis/service/ClaudeOverloadAdapterTest.java
git commit -m "VIS-61: add ClaudeOverloadAdapter with mocked-SDK test"
```

### Task 1.13: `AsyncConfig`

**Files:**
- Create: `backend/src/main/java/in/vis/config/AsyncConfig.java`

- [ ] **Step 1: Write the config**

```java
package in.vis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@EnableRetry
public class AsyncConfig {

    @Bean(name = "overloadExecutor")
    public Executor overloadExecutor() {
        ThreadPoolTaskExecutor x = new ThreadPoolTaskExecutor();
        x.setCorePoolSize(4);
        x.setMaxPoolSize(8);
        x.setQueueCapacity(100);
        x.setThreadNamePrefix("overload-");
        x.initialize();
        return x;
    }
}
```

- [ ] **Step 2: Add the `spring-retry` dependency to `pom.xml`** (in `<dependencies>`)

```xml
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aspects</artifactId>
</dependency>
```

- [ ] **Step 3: Compile + commit**

Run: `cd backend && mvn compile -q`

```bash
git add backend/src/main/java/in/vis/config/AsyncConfig.java backend/pom.xml
git commit -m "VIS-61: enable async executor + retry for overload service"
```

### Task 1.14: `OverloadService` — TDD

**Files:**
- Create: `backend/src/test/java/in/vis/service/OverloadServiceTest.java`
- Create: `backend/src/main/java/in/vis/service/OverloadService.java`

- [ ] **Step 1: Write failing test**

```java
package in.vis.service;

import in.vis.dto.NextTargetOutput;
import in.vis.enums.ExerciseType;
import in.vis.enums.TargetSource;
import in.vis.model.Exercise;
import in.vis.model.ExerciseSessionLog;
import in.vis.model.ExerciseTarget;
import in.vis.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

class OverloadServiceTest {

    ExerciseRepository exerciseRepo;
    ExerciseSessionLogRepository logRepo;
    ExerciseTargetRepository targetRepo;
    AiTargetSuggestionRepository auditRepo;
    OverloadPromptBuilder prompt;
    ClaudeOverloadAdapter ai;
    OverloadService svc;

    @BeforeEach
    void setUp() {
        exerciseRepo = mock(ExerciseRepository.class);
        logRepo = mock(ExerciseSessionLogRepository.class);
        targetRepo = mock(ExerciseTargetRepository.class);
        auditRepo = mock(AiTargetSuggestionRepository.class);
        prompt = mock(OverloadPromptBuilder.class);
        ai = mock(ClaudeOverloadAdapter.class);
        when(ai.model()).thenReturn("claude-haiku-4-5");
        svc = new OverloadService(exerciseRepo, logRepo, targetRepo, auditRepo, prompt, ai, 1, 10);
    }

    @Test
    void recompute_skipsWhenLocked() {
        ExerciseTarget t = newTarget(); t.setAiLocked(true);
        when(targetRepo.findByClientIdAndExerciseId(1L, 2L)).thenReturn(Optional.of(t));

        svc.recompute(1L, 2L, 99L);

        verify(ai, never()).callJson(any(), any());
    }

    @Test
    void recompute_skipsWhenNoHistory() {
        when(targetRepo.findByClientIdAndExerciseId(1L, 2L)).thenReturn(Optional.of(newTarget()));
        when(logRepo.findRecent(eq(1L), eq(2L), any(Pageable.class))).thenReturn(List.of());

        svc.recompute(1L, 2L, 99L);

        verify(ai, never()).callJson(any(), any());
    }

    @Test
    void recompute_appliesValidAiOutput() {
        ExerciseTarget t = newTarget();
        when(targetRepo.findByClientIdAndExerciseId(1L, 2L)).thenReturn(Optional.of(t));
        Exercise ex = new Exercise(); ex.setName("Bench"); ex.setType(ExerciseType.COMPOUND);
        when(exerciseRepo.findById(2L)).thenReturn(Optional.of(ex));
        when(logRepo.findRecent(eq(1L), eq(2L), any(Pageable.class)))
            .thenReturn(List.of(sampleLog()));
        when(prompt.build(any(), any(), any())).thenReturn("{}");
        when(ai.callJson("{}", null)).thenReturn(new NextTargetOutput(
            new BigDecimal("92.5"), 6, 8, 4,
            NextTargetOutput.Decision.BUMP_WEIGHT,
            "hit top of range",
            new BigDecimal("0.8")
        ));

        svc.recompute(1L, 2L, 99L);

        ArgumentCaptor<ExerciseTarget> cap = ArgumentCaptor.forClass(ExerciseTarget.class);
        verify(targetRepo).save(cap.capture());
        ExerciseTarget saved = cap.getValue();
        assertThat(saved.getWeightKg()).isEqualByComparingTo("92.5");
        assertThat(saved.getSource()).isEqualTo(TargetSource.AI);
        assertThat(saved.getAiRationale()).isEqualTo("hit top of range");
    }

    @Test
    void recompute_rejectsImplausibleWeightDelta() {
        ExerciseTarget t = newTarget(); t.setWeightKg(new BigDecimal("90"));
        when(targetRepo.findByClientIdAndExerciseId(1L, 2L)).thenReturn(Optional.of(t));
        Exercise ex = new Exercise(); ex.setName("Bench"); ex.setType(ExerciseType.COMPOUND);
        when(exerciseRepo.findById(2L)).thenReturn(Optional.of(ex));
        when(logRepo.findRecent(eq(1L), eq(2L), any(Pageable.class)))
            .thenReturn(List.of(sampleLog()));
        when(prompt.build(any(), any(), any())).thenReturn("{}");
        when(ai.callJson(any(), any())).thenReturn(new NextTargetOutput(
            new BigDecimal("115"), 6, 8, 4,
            NextTargetOutput.Decision.BUMP_WEIGHT, "ok", new BigDecimal("0.9")
        ));

        svc.recompute(1L, 2L, 99L);

        verify(targetRepo, never()).save(any());
        ArgumentCaptor<in.vis.model.AiTargetSuggestion> ac =
            ArgumentCaptor.forClass(in.vis.model.AiTargetSuggestion.class);
        verify(auditRepo).save(ac.capture());
        assertThat(ac.getValue().getApplied()).isFalse();
        assertThat(ac.getValue().getRejectReason()).contains("delta");
    }

    private ExerciseTarget newTarget() {
        ExerciseTarget t = new ExerciseTarget();
        t.setBranchId(1L); t.setClientId(1L); t.setExerciseId(2L);
        t.setWeightKg(new BigDecimal("90.00"));
        t.setRepsLow((short) 6); t.setRepsHigh((short) 8); t.setSets((short) 4);
        t.setSource(TargetSource.AI); t.setAiLocked(false);
        return t;
    }

    private ExerciseSessionLog sampleLog() {
        ExerciseSessionLog l = new ExerciseSessionLog();
        l.setBranchId(1L); l.setClientId(1L); l.setExerciseId(2L); l.setSessionId(99L);
        l.setSetIdx((short) 1); l.setWeightKg(new BigDecimal("90.00"));
        l.setReps((short) 8); l.setRpe(new BigDecimal("7.0")); l.setCompleted(true);
        l.setCompletedAt(OffsetDateTime.now());
        return l;
    }
}
```

- [ ] **Step 2: Run, expect compile fail (no `OverloadService` yet)**

Run: `cd backend && mvn test -Dtest=OverloadServiceTest -q`

- [ ] **Step 3: Implement `OverloadService`**

```java
package in.vis.service;

import in.vis.dto.NextTargetOutput;
import in.vis.enums.TargetSource;
import in.vis.model.AiTargetSuggestion;
import in.vis.model.Exercise;
import in.vis.model.ExerciseSessionLog;
import in.vis.model.ExerciseTarget;
import in.vis.repository.AiTargetSuggestionRepository;
import in.vis.repository.ExerciseRepository;
import in.vis.repository.ExerciseSessionLogRepository;
import in.vis.repository.ExerciseTargetRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

@Service
public class OverloadService {

    private final ExerciseRepository exerciseRepo;
    private final ExerciseSessionLogRepository logRepo;
    private final ExerciseTargetRepository targetRepo;
    private final AiTargetSuggestionRepository auditRepo;
    private final OverloadPromptBuilder prompt;
    private final ClaudeOverloadAdapter ai;
    private final int dedupeWindowHours;
    private final int maxWeightDeltaKg;

    public OverloadService(
        ExerciseRepository exerciseRepo,
        ExerciseSessionLogRepository logRepo,
        ExerciseTargetRepository targetRepo,
        AiTargetSuggestionRepository auditRepo,
        OverloadPromptBuilder prompt,
        ClaudeOverloadAdapter ai,
        @Value("${overload.dedupe-window-hours:1}") int dedupeWindowHours,
        @Value("${overload.max-weight-delta-kg:10}") int maxWeightDeltaKg
    ) {
        this.exerciseRepo = exerciseRepo;
        this.logRepo = logRepo;
        this.targetRepo = targetRepo;
        this.auditRepo = auditRepo;
        this.prompt = prompt;
        this.ai = ai;
        this.dedupeWindowHours = dedupeWindowHours;
        this.maxWeightDeltaKg = maxWeightDeltaKg;
    }

    @Async("overloadExecutor")
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 2000, multiplier = 2.0))
    public void recomputeAsync(Long clientId, Long exerciseId, Long sessionId) {
        recompute(clientId, exerciseId, sessionId);
    }

    /** Synchronous worker — split out for direct unit testing. */
    public void recompute(Long clientId, Long exerciseId, Long sessionId) {
        Optional<ExerciseTarget> targetOpt = targetRepo.findByClientIdAndExerciseId(clientId, exerciseId);
        if (targetOpt.isEmpty()) return;
        ExerciseTarget target = targetOpt.get();
        if (Boolean.TRUE.equals(target.getAiLocked())) return;

        List<ExerciseSessionLog> history = logRepo.findRecent(
            clientId, exerciseId, PageRequest.of(0, 30) // up to 30 set rows ≈ ~3 sessions
        );
        if (history.isEmpty()) return;

        Exercise exercise = exerciseRepo.findById(exerciseId).orElseThrow();
        String body = prompt.build(exercise, target, history);
        String hash = sha256(body);
        if (auditRepo.existsRecent(clientId, exerciseId, hash,
                OffsetDateTime.now().minusHours(dedupeWindowHours))) {
            return;
        }

        AiTargetSuggestion audit = new AiTargetSuggestion();
        audit.setBranchId(target.getBranchId());
        audit.setClientId(clientId);
        audit.setExerciseId(exerciseId);
        audit.setSessionIdTrigger(sessionId);
        audit.setModel(ai.model());
        audit.setPromptHash(hash);
        audit.setPromptBody(body);

        NextTargetOutput out;
        try {
            out = ai.callJson(body, null);
        } catch (RuntimeException e) {
            audit.setOutputJson("{}");
            audit.setApplied(false);
            audit.setRejectReason("ai call failed: " + e.getMessage());
            auditRepo.save(audit);
            throw e;
        }
        audit.setOutputJson(out == null ? "{}" : "{\"raw\":\"parsed\"}");

        String err = out == null ? "null output" : out.validationError();
        if (err != null) {
            audit.setApplied(false); audit.setRejectReason("schema: " + err);
            auditRepo.save(audit);
            return;
        }

        if (target.getWeightKg() != null && out.weightKg() != null) {
            BigDecimal delta = out.weightKg().subtract(target.getWeightKg()).abs();
            if (delta.compareTo(BigDecimal.valueOf(maxWeightDeltaKg)) > 0) {
                audit.setApplied(false);
                audit.setRejectReason("implausible weight delta: " + delta);
                auditRepo.save(audit);
                return;
            }
        }

        target.setWeightKg(out.weightKg());
        target.setRepsLow(out.repsLow().shortValue());
        target.setRepsHigh(out.repsHigh().shortValue());
        target.setSets(out.sets().shortValue());
        target.setSource(TargetSource.AI);
        target.setAiRationale(out.rationale());
        target.setAiConfidence(out.confidence());
        targetRepo.save(target);

        audit.setApplied(true);
        auditRepo.save(audit);
    }

    private static String sha256(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(s.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) { throw new RuntimeException(e); }
    }
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `cd backend && mvn test -Dtest=OverloadServiceTest -q`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/in/vis/service/OverloadService.java backend/src/test/java/in/vis/service/OverloadServiceTest.java
git commit -m "VIS-61: add OverloadService with locked/no-history/implausible-delta paths"
```

### Task 1.15: DTOs — session complete request shapes

**Files:**
- Create: `backend/src/main/java/in/vis/dto/SetEntryRequest.java`
- Create: `backend/src/main/java/in/vis/dto/SessionCompleteRequest.java`

- [ ] **Step 1: Write `SetEntryRequest`**

```java
package in.vis.dto;

import java.math.BigDecimal;

public record SetEntryRequest(
    Long exerciseId,
    Short setIdx,
    BigDecimal weightKg,
    Short reps,
    BigDecimal rpe,
    Boolean completed
) {}
```

- [ ] **Step 2: Write `SessionCompleteRequest`**

```java
package in.vis.dto;

import java.util.List;

public record SessionCompleteRequest(
    List<SetEntryRequest> sets
) {}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/in/vis/dto/SetEntryRequest.java backend/src/main/java/in/vis/dto/SessionCompleteRequest.java
git commit -m "VIS-61: add session complete request DTOs"
```

### Task 1.16: `SessionService` — orchestrator

**Files:**
- Create: `backend/src/main/java/in/vis/service/SessionService.java`

- [ ] **Step 1: Write the service**

```java
package in.vis.service;

import in.vis.dto.SessionCompleteRequest;
import in.vis.dto.SetEntryRequest;
import in.vis.model.ExerciseSessionLog;
import in.vis.model.WorkoutSession;
import in.vis.repository.ExerciseSessionLogRepository;
import in.vis.repository.WorkoutSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
public class SessionService {

    private final WorkoutSessionRepository sessionRepo;
    private final ExerciseSessionLogRepository logRepo;
    private final OverloadService overload;

    public SessionService(
        WorkoutSessionRepository sessionRepo,
        ExerciseSessionLogRepository logRepo,
        OverloadService overload
    ) {
        this.sessionRepo = sessionRepo;
        this.logRepo = logRepo;
        this.overload = overload;
    }

    @Transactional
    public void complete(Long sessionId, SessionCompleteRequest req) {
        WorkoutSession session = sessionRepo.findById(sessionId).orElseThrow();
        session.setStatus(WorkoutSession.Status.DONE);
        session.setCompletedAt(OffsetDateTime.now());

        Set<Long> touchedExerciseIds = new HashSet<>();
        if (req.sets() != null) {
            for (SetEntryRequest s : req.sets()) {
                ExerciseSessionLog log = new ExerciseSessionLog();
                log.setBranchId(session.getBranchId());
                log.setClientId(session.getClientId());
                log.setExerciseId(s.exerciseId());
                log.setSessionId(sessionId);
                log.setSetIdx(s.setIdx());
                log.setWeightKg(s.weightKg());
                log.setReps(s.reps());
                log.setRpe(s.rpe());
                log.setCompleted(Boolean.TRUE.equals(s.completed()));
                logRepo.save(log);
                touchedExerciseIds.add(s.exerciseId());
            }
        }
        sessionRepo.save(session);

        for (Long exId : touchedExerciseIds) {
            overload.recomputeAsync(session.getClientId(), exId, sessionId);
        }
    }
}
```

- [ ] **Step 2: Compile + commit**

Run: `cd backend && mvn compile -q`

```bash
git add backend/src/main/java/in/vis/service/SessionService.java
git commit -m "VIS-61: add SessionService that dispatches overload recompute on complete"
```

### Task 1.17: `SessionController`

**Files:**
- Create: `backend/src/main/java/in/vis/controller/SessionController.java`
- Create: `backend/src/test/java/in/vis/controller/SessionControllerTest.java`

- [ ] **Step 1: Write the controller**

```java
package in.vis.controller;

import in.vis.dto.SessionCompleteRequest;
import in.vis.service.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessions;

    public SessionController(SessionService sessions) { this.sessions = sessions; }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Void> complete(@PathVariable Long id, @RequestBody SessionCompleteRequest req) {
        sessions.complete(id, req);
        return ResponseEntity.noContent().build();
    }
}
```

- [ ] **Step 2: Write the slice test**

```java
package in.vis.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.vis.dto.SessionCompleteRequest;
import in.vis.dto.SetEntryRequest;
import in.vis.service.SessionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SessionController.class)
class SessionControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @MockitoBean SessionService sessions;

    @Test
    void complete_returns204AndDelegates() throws Exception {
        var req = new SessionCompleteRequest(List.of(
            new SetEntryRequest(2L, (short) 1, new BigDecimal("90.0"), (short) 8, new BigDecimal("7.0"), true)
        ));
        mvc.perform(post("/api/sessions/{id}/complete", 99L)
                .with(csrf()).with(user("client"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(req)))
            .andExpect(status().isNoContent());

        verify(sessions).complete(eq(99L), any(SessionCompleteRequest.class));
    }
}
```

- [ ] **Step 3: Run test**

Run: `cd backend && mvn test -Dtest=SessionControllerTest -q`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/in/vis/controller/SessionController.java backend/src/test/java/in/vis/controller/SessionControllerTest.java
git commit -m "VIS-61: add POST /api/sessions/{id}/complete endpoint with slice test"
```

### Task 1.18: History endpoint — DTO + controller + service

**Files:**
- Create: `backend/src/main/java/in/vis/dto/ExerciseHistoryResponse.java`
- Create: `backend/src/main/java/in/vis/controller/ExerciseHistoryController.java`
- Create: `backend/src/test/java/in/vis/controller/ExerciseHistoryControllerTest.java`

- [ ] **Step 1: Write the response DTO**

```java
package in.vis.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ExerciseHistoryResponse(
    ExerciseRef exercise,
    Target target,
    LastSession lastSession,
    Integer plannedSetsToday,
    Boolean firstTime
) {
    public record ExerciseRef(Long id, String name) {}
    public record Target(BigDecimal weightKg, Integer repsLow, Integer repsHigh, Integer sets, String source) {}
    public record LastSession(Long sessionId, OffsetDateTime completedAt, List<SetEntry> sets) {}
    public record SetEntry(Integer idx, BigDecimal weightKg, Integer reps, BigDecimal rpe, Boolean completed) {}
}
```

- [ ] **Step 2: Add a query helper on the service side. Extend `OverloadService` with a read method.**

Open `backend/src/main/java/in/vis/service/OverloadService.java` and add at the bottom:

```java
public java.util.List<in.vis.model.ExerciseSessionLog> lastSessionLogs(Long clientId, Long exerciseId) {
    var recent = logRepo.findRecent(clientId, exerciseId,
        org.springframework.data.domain.PageRequest.of(0, 30));
    if (recent.isEmpty()) return java.util.List.of();
    Long latestSession = recent.get(0).getSessionId();
    return recent.stream().filter(l -> l.getSessionId().equals(latestSession)).toList();
}
```

- [ ] **Step 3: Write the controller**

```java
package in.vis.controller;

import in.vis.dto.ExerciseHistoryResponse;
import in.vis.dto.ExerciseHistoryResponse.ExerciseRef;
import in.vis.dto.ExerciseHistoryResponse.LastSession;
import in.vis.dto.ExerciseHistoryResponse.SetEntry;
import in.vis.dto.ExerciseHistoryResponse.Target;
import in.vis.model.Exercise;
import in.vis.model.ExerciseSessionLog;
import in.vis.model.ExerciseTarget;
import in.vis.repository.ExerciseRepository;
import in.vis.repository.ExerciseTargetRepository;
import in.vis.service.OverloadService;
import in.vis.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/clients/me/exercises")
public class ExerciseHistoryController {

    private final ExerciseRepository exerciseRepo;
    private final ExerciseTargetRepository targetRepo;
    private final OverloadService overload;
    private final UserService users;

    public ExerciseHistoryController(
        ExerciseRepository exerciseRepo,
        ExerciseTargetRepository targetRepo,
        OverloadService overload,
        UserService users
    ) {
        this.exerciseRepo = exerciseRepo;
        this.targetRepo = targetRepo;
        this.overload = overload;
        this.users = users;
    }

    @GetMapping("/{exerciseId}/history")
    public ResponseEntity<ExerciseHistoryResponse> history(@PathVariable Long exerciseId) {
        Long clientId = users.currentUserId();
        Exercise ex = exerciseRepo.findById(exerciseId).orElseThrow();
        ExerciseTarget t = targetRepo.findByClientIdAndExerciseId(clientId, exerciseId).orElse(null);
        List<ExerciseSessionLog> last = overload.lastSessionLogs(clientId, exerciseId);

        ExerciseRef exRef = new ExerciseRef(ex.getId(), ex.getName());
        Target targetDto = t == null ? null : new Target(
            t.getWeightKg(),
            t.getRepsLow().intValue(),
            t.getRepsHigh().intValue(),
            t.getSets().intValue(),
            t.getSource().name()
        );
        LastSession ls = last.isEmpty() ? null : new LastSession(
            last.get(0).getSessionId(),
            last.get(0).getCompletedAt(),
            last.stream()
                .sorted((a, b) -> Short.compare(a.getSetIdx(), b.getSetIdx()))
                .map(l -> new SetEntry(
                    l.getSetIdx().intValue(), l.getWeightKg(),
                    l.getReps().intValue(), l.getRpe(), l.getCompleted()
                ))
                .toList()
        );
        Integer planned = t == null ? null : t.getSets().intValue();
        Boolean firstTime = last.isEmpty();

        return ResponseEntity.ok(new ExerciseHistoryResponse(exRef, targetDto, ls, planned, firstTime));
    }
}
```

Note: assumes `UserService.currentUserId()` exists. If not, add it in a one-line task here:

```java
// in UserService.java
public Long currentUserId() {
    // existing FirebaseAuthFilter sets SecurityContext with user details; pull the id field.
    var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
    // adapt to actual principal type — see how Branch endpoints already resolve current user
    return ((in.vis.model.User) auth.getPrincipal()).getId();
}
```

(Wire to match existing principal type — check `FirebaseAuthFilter`.)

- [ ] **Step 4: Write the slice test**

```java
package in.vis.controller;

import in.vis.enums.ExerciseType;
import in.vis.enums.TargetSource;
import in.vis.model.Exercise;
import in.vis.model.ExerciseSessionLog;
import in.vis.model.ExerciseTarget;
import in.vis.repository.ExerciseRepository;
import in.vis.repository.ExerciseTargetRepository;
import in.vis.service.OverloadService;
import in.vis.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExerciseHistoryController.class)
class ExerciseHistoryControllerTest {

    @Autowired MockMvc mvc;
    @MockitoBean ExerciseRepository exerciseRepo;
    @MockitoBean ExerciseTargetRepository targetRepo;
    @MockitoBean OverloadService overload;
    @MockitoBean UserService users;

    @Test
    void returnsTargetLastSessionAndPlanned() throws Exception {
        when(users.currentUserId()).thenReturn(1L);
        Exercise ex = new Exercise();
        ex.setName("Bench"); ex.setType(ExerciseType.COMPOUND);
        when(exerciseRepo.findById(2L)).thenReturn(Optional.of(ex));
        ExerciseTarget t = new ExerciseTarget();
        t.setWeightKg(new BigDecimal("90")); t.setRepsLow((short) 6); t.setRepsHigh((short) 8);
        t.setSets((short) 4); t.setSource(TargetSource.AI);
        when(targetRepo.findByClientIdAndExerciseId(1L, 2L)).thenReturn(Optional.of(t));
        ExerciseSessionLog log = new ExerciseSessionLog();
        log.setSessionId(50L); log.setSetIdx((short) 1); log.setWeightKg(new BigDecimal("90"));
        log.setReps((short) 8); log.setRpe(new BigDecimal("7")); log.setCompleted(true);
        log.setCompletedAt(OffsetDateTime.parse("2026-05-15T10:00:00Z"));
        when(overload.lastSessionLogs(1L, 2L)).thenReturn(List.of(log));

        mvc.perform(get("/api/clients/me/exercises/{id}/history", 2L).with(user("client")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.target.weightKg").value(90))
            .andExpect(jsonPath("$.lastSession.sets[0].reps").value(8))
            .andExpect(jsonPath("$.firstTime").value(false))
            .andExpect(jsonPath("$.plannedSetsToday").value(4));
    }
}
```

- [ ] **Step 5: Run test, verify pass**

Run: `cd backend && mvn test -Dtest=ExerciseHistoryControllerTest -q`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/in/vis/dto/ExerciseHistoryResponse.java backend/src/main/java/in/vis/controller/ExerciseHistoryController.java backend/src/main/java/in/vis/service/OverloadService.java backend/src/main/java/in/vis/service/UserService.java backend/src/test/java/in/vis/controller/ExerciseHistoryControllerTest.java
git commit -m "VIS-61: add GET /api/clients/me/exercises/{id}/history endpoint"
```

### Task 1.19: Integration test — full session-complete → AI → target upsert

**Files:**
- Create: `backend/src/test/java/in/vis/integration/OverloadIntegrationTest.java`

- [ ] **Step 1: Write the integration test (Testcontainers, mocked AI)**

```java
package in.vis.integration;

import in.vis.dto.NextTargetOutput;
import in.vis.dto.SessionCompleteRequest;
import in.vis.dto.SetEntryRequest;
import in.vis.enums.ExerciseType;
import in.vis.enums.TargetSource;
import in.vis.model.Branch;
import in.vis.model.Exercise;
import in.vis.model.ExerciseTarget;
import in.vis.model.User;
import in.vis.model.WorkoutSession;
import in.vis.repository.BranchRepository;
import in.vis.repository.ExerciseRepository;
import in.vis.repository.ExerciseTargetRepository;
import in.vis.repository.UserRepository;
import in.vis.repository.WorkoutSessionRepository;
import in.vis.service.ClaudeOverloadAdapter;
import in.vis.service.SessionService;
import org.awaitility.Awaitility;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
class OverloadIntegrationTest {

    @Autowired SessionService sessions;
    @Autowired BranchRepository branchRepo;
    @Autowired UserRepository userRepo;
    @Autowired ExerciseRepository exerciseRepo;
    @Autowired WorkoutSessionRepository sessionRepo;
    @Autowired ExerciseTargetRepository targetRepo;

    @MockBean ClaudeOverloadAdapter ai;

    @Test
    void sessionComplete_triggersAiAndUpsertsTarget() {
        Branch b = new Branch(); b.setName("Vis HQ"); branchRepo.save(b);
        User u = new User(); u.setBranchId(b.getId()); u.setFirebaseUid("uid-1");
        u.setEmail("c@v.in"); userRepo.save(u);
        Exercise ex = new Exercise(); ex.setBranchId(b.getId()); ex.setName("Bench");
        ex.setType(ExerciseType.COMPOUND); exerciseRepo.save(ex);
        WorkoutSession ws = new WorkoutSession();
        ws.setBranchId(b.getId()); ws.setClientId(u.getId());
        ws.setStatus(WorkoutSession.Status.IN_PROGRESS); sessionRepo.save(ws);
        ExerciseTarget t = new ExerciseTarget();
        t.setBranchId(b.getId()); t.setClientId(u.getId()); t.setExerciseId(ex.getId());
        t.setWeightKg(new BigDecimal("90.00")); t.setRepsLow((short) 6); t.setRepsHigh((short) 8);
        t.setSets((short) 4); t.setSource(TargetSource.TRAINER);
        targetRepo.save(t);

        when(ai.model()).thenReturn("claude-haiku-4-5");
        when(ai.callJson(any(), any())).thenReturn(new NextTargetOutput(
            new BigDecimal("92.5"), 6, 8, 4,
            NextTargetOutput.Decision.BUMP_WEIGHT, "hit top of range", new BigDecimal("0.8")
        ));

        sessions.complete(ws.getId(), new SessionCompleteRequest(List.of(
            new SetEntryRequest(ex.getId(), (short) 1, new BigDecimal("90"), (short) 8, new BigDecimal("7"), true),
            new SetEntryRequest(ex.getId(), (short) 2, new BigDecimal("90"), (short) 8, new BigDecimal("7"), true)
        )));

        Awaitility.await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            Optional<ExerciseTarget> updated = targetRepo.findByClientIdAndExerciseId(u.getId(), ex.getId());
            assertThat(updated).isPresent();
            assertThat(updated.get().getWeightKg()).isEqualByComparingTo("92.5");
            assertThat(updated.get().getSource()).isEqualTo(TargetSource.AI);
        });
    }
}
```

- [ ] **Step 2: Add Awaitility dep to `pom.xml`** (test scope)

```xml
<dependency>
    <groupId>org.awaitility</groupId>
    <artifactId>awaitility</artifactId>
    <scope>test</scope>
</dependency>
```

- [ ] **Step 3: Run the integration test**

Run: `cd backend && mvn test -Dtest=OverloadIntegrationTest -q`
Expected: PASS within 5 s.

- [ ] **Step 4: Commit**

```bash
git add backend/src/test/java/in/vis/integration/OverloadIntegrationTest.java backend/pom.xml
git commit -m "VIS-61: add end-to-end overload integration test (Testcontainers + mocked AI)"
```

### Task 1.20: Final backend regression run

- [ ] **Step 1: Run the full test suite**

Run: `cd backend && mvn test -q`
Expected: ALL TESTS PASS.

If any pre-existing test fails because we added beans (e.g., new `AnthropicConfig` needing `ANTHROPIC_API_KEY`): set a `@TestConfiguration` that overrides `anthropicClient` with a mock in the failing tests, or set `anthropic.api-key=test` in `application-test.properties`.

- [ ] **Step 2: Commit any test-config fixups**

```bash
git add backend/src/test/resources/application-test.properties
git commit -m "VIS-61: set test anthropic.api-key so context loads in slice tests"
```

---

## Phase 2 — Client App (BLOCKED until ActiveSessionScreen lands)

> Prerequisite: `client-app/src/screens/ActiveSessionScreen.tsx` must exist. As of this plan's writing only `HomeShell`, `LoginScreen`, and `PendingScreen` exist. The master plan's client-app phase must complete the Active Session screen first.

### Task 2.1: API service — `exerciseHistoryService.ts`

**Files:**
- Create: `client-app/src/services/exerciseHistoryService.ts`
- Create: `client-app/__tests__/services/exerciseHistoryService.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { fetchExerciseHistory } from '../../src/services/exerciseHistoryService';
import { apiGet } from '../../src/services/apiService';

jest.mock('../../src/services/apiService');

describe('exerciseHistoryService', () => {
  it('GETs the correct path and returns the response', async () => {
    (apiGet as jest.Mock).mockResolvedValue({
      exercise: { id: 2, name: 'Bench' },
      target: { weightKg: 90, repsLow: 6, repsHigh: 8, sets: 4, source: 'AI' },
      lastSession: null,
      plannedSetsToday: 4,
      firstTime: true,
    });

    const r = await fetchExerciseHistory(2);

    expect(apiGet).toHaveBeenCalledWith('/clients/me/exercises/2/history');
    expect(r.firstTime).toBe(true);
  });
});
```

- [ ] **Step 2: Run, expect fail (service does not exist)**

Run: `cd client-app && npx jest services/exerciseHistoryService -q`

- [ ] **Step 3: Implement the service**

```ts
import { apiGet } from './apiService';

export type ExerciseHistory = {
  exercise: { id: number; name: string };
  target: { weightKg: number | null; repsLow: number; repsHigh: number; sets: number; source: 'TRAINER' | 'AI' | 'AI_BOOTSTRAP' } | null;
  lastSession: {
    sessionId: number;
    completedAt: string;
    sets: { idx: number; weightKg: number | null; reps: number; rpe: number | null; completed: boolean }[];
  } | null;
  plannedSetsToday: number | null;
  firstTime: boolean;
};

export async function fetchExerciseHistory(exerciseId: number): Promise<ExerciseHistory> {
  return apiGet(`/clients/me/exercises/${exerciseId}/history`);
}
```

- [ ] **Step 4: Run, verify pass**

Run: `cd client-app && npx jest services/exerciseHistoryService -q`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client-app/src/services/exerciseHistoryService.ts client-app/__tests__/services/exerciseHistoryService.test.ts
git commit -m "VIS-61: client-app history service"
```

### Task 2.2: Hook — `useExerciseHistory`

**Files:**
- Create: `client-app/src/hooks/useExerciseHistory.ts`
- Create: `client-app/__tests__/hooks/useExerciseHistory.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useExerciseHistory } from '../../src/hooks/useExerciseHistory';
import { fetchExerciseHistory } from '../../src/services/exerciseHistoryService';

jest.mock('../../src/services/exerciseHistoryService');

describe('useExerciseHistory', () => {
  it('returns loading then data', async () => {
    (fetchExerciseHistory as jest.Mock).mockResolvedValue({ firstTime: true });
    const { result } = renderHook(() => useExerciseHistory(2));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.firstTime).toBe(true);
  });
});
```

- [ ] **Step 2: Run, fail**

Run: `cd client-app && npx jest hooks/useExerciseHistory -q`

- [ ] **Step 3: Implement**

```ts
import { useEffect, useState } from 'react';
import { ExerciseHistory, fetchExerciseHistory } from '../services/exerciseHistoryService';

export function useExerciseHistory(exerciseId: number) {
  const [data, setData] = useState<ExerciseHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchExerciseHistory(exerciseId)
      .then(r => { if (alive) { setData(r); setLoading(false); } })
      .catch(e => { if (alive) { setError(e); setLoading(false); } });
    return () => { alive = false; };
  }, [exerciseId]);

  return { data, loading, error };
}
```

- [ ] **Step 4: Run, pass**

Run: `cd client-app && npx jest hooks/useExerciseHistory -q`

- [ ] **Step 5: Commit**

```bash
git add client-app/src/hooks/useExerciseHistory.ts client-app/__tests__/hooks/useExerciseHistory.test.ts
git commit -m "VIS-61: useExerciseHistory hook"
```

### Task 2.3: `UpNextRow` component

**Files:**
- Create: `client-app/src/components/session/UpNextRow.tsx`
- Create: `client-app/__tests__/components/session/UpNextRow.test.tsx`

- [ ] **Step 1: Write the test (three states: has-history-same-sets, has-history-more-sets, first-time)**

```tsx
import { render } from '@testing-library/react-native';
import UpNextRow from '../../../src/components/session/UpNextRow';

const baseExercise = { id: 2, name: 'Bench' };
const baseTarget = { weightKg: 90, repsLow: 6, repsHigh: 8, sets: 4, source: 'AI' as const };

describe('UpNextRow', () => {
  it('renders Last subtitle with same set count', () => {
    const r = render(<UpNextRow data={{
      exercise: baseExercise,
      target: baseTarget,
      lastSession: {
        sessionId: 1, completedAt: '2026-05-15T10:00:00Z',
        sets: [
          { idx: 1, weightKg: 90, reps: 8, rpe: 7, completed: true },
          { idx: 2, weightKg: 90, reps: 8, rpe: 7, completed: true },
          { idx: 3, weightKg: 90, reps: 8, rpe: 7, completed: true },
          { idx: 4, weightKg: 90, reps: 8, rpe: 7, completed: true },
        ],
      },
      plannedSetsToday: 4,
      firstTime: false,
    }} onPress={() => {}} />);
    expect(r.getByText(/Last: 4×8 @ 90kg/)).toBeTruthy();
  });

  it('shows "+N new sets today" when planned > last', () => {
    const r = render(<UpNextRow data={{
      exercise: baseExercise, target: baseTarget,
      lastSession: { sessionId: 1, completedAt: 'x', sets: [
        { idx: 1, weightKg: 90, reps: 8, rpe: 7, completed: true },
        { idx: 2, weightKg: 90, reps: 8, rpe: 7, completed: true },
        { idx: 3, weightKg: 90, reps: 8, rpe: 7, completed: true },
      ]},
      plannedSetsToday: 4, firstTime: false,
    }} onPress={() => {}} />);
    expect(r.getByText(/1 new set today/)).toBeTruthy();
  });

  it('shows First time badge when firstTime', () => {
    const r = render(<UpNextRow data={{
      exercise: baseExercise, target: { ...baseTarget, source: 'AI_BOOTSTRAP' as const },
      lastSession: null, plannedSetsToday: 4, firstTime: true,
    }} onPress={() => {}} />);
    expect(r.getByText(/First time/)).toBeTruthy();
    expect(r.getByText(/AI starting 90kg/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run, fail**

Run: `cd client-app && npx jest UpNextRow -q`

- [ ] **Step 3: Implement**

```tsx
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { ExerciseHistory } from '../../services/exerciseHistoryService';

type Props = { data: ExerciseHistory; onPress: () => void };

function modeReps(sets: { reps: number }[]): number {
  // Return most common reps value (good-enough for a one-line summary)
  const counts: Record<number, number> = {};
  for (const s of sets) counts[s.reps] = (counts[s.reps] ?? 0) + 1;
  let best = sets[0]?.reps ?? 0, bestCount = -1;
  for (const [k, v] of Object.entries(counts)) {
    if (v > bestCount) { best = Number(k); bestCount = v; }
  }
  return best;
}

function modeWeight(sets: { weightKg: number | null }[]): number | null {
  const counts: Record<string, number> = {};
  for (const s of sets) {
    const k = s.weightKg == null ? 'BW' : String(s.weightKg);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  let bestKey = Object.keys(counts)[0]; let bestCount = -1;
  for (const [k, v] of Object.entries(counts)) {
    if (v > bestCount) { bestKey = k; bestCount = v; }
  }
  return bestKey === 'BW' ? null : Number(bestKey);
}

export default function UpNextRow({ data, onPress }: Props) {
  const { exercise, target, lastSession, plannedSetsToday, firstTime } = data;

  let subtitle: string;
  if (firstTime || !lastSession) {
    subtitle = target?.weightKg != null
      ? `AI starting ${target.weightKg}kg × ${target.repsLow}`
      : 'AI starting target ready';
  } else {
    const w = modeWeight(lastSession.sets);
    const r = modeReps(lastSession.sets);
    const head = `Last: ${lastSession.sets.length}×${r} ${w == null ? 'BW' : '@ ' + w + 'kg'}`;
    const diff = (plannedSetsToday ?? lastSession.sets.length) - lastSession.sets.length;
    subtitle = diff > 0 ? `${head} · ${diff} new set${diff > 1 ? 's' : ''} today` : head;
  }

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.body}>
        <Text style={styles.name}>{exercise.name}</Text>
        {firstTime && <Text style={styles.firstBadge}>First time</Text>}
        <Text style={styles.sub}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 12, paddingHorizontal: 14 },
  body: { gap: 2 },
  name: { fontSize: 14, fontWeight: '600', color: '#1B1108' },
  sub: { fontSize: 11, color: '#3A2A1F', fontFamily: 'Geist Mono' },
  firstBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFA366', color: '#FFF6EA',
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999,
    fontSize: 9, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase',
  },
});
```

- [ ] **Step 4: Run, pass**

Run: `cd client-app && npx jest UpNextRow -q`

- [ ] **Step 5: Commit**

```bash
git add client-app/src/components/session/UpNextRow.tsx client-app/__tests__/components/session/UpNextRow.test.tsx
git commit -m "VIS-61: UpNextRow component with three subtitle states"
```

### Task 2.4: `HistorySheet` bottom sheet

**Files:**
- Create: `client-app/src/components/session/HistorySheet.tsx`
- Create: `client-app/__tests__/components/session/HistorySheet.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
import { render } from '@testing-library/react-native';
import HistorySheet from '../../../src/components/session/HistorySheet';

describe('HistorySheet', () => {
  it('renders last session sets and dotted extrapolated rows when planned > last', () => {
    const r = render(<HistorySheet data={{
      exercise: { id: 2, name: 'Bench' },
      target: { weightKg: 92.5, repsLow: 6, repsHigh: 8, sets: 4, source: 'AI' },
      lastSession: {
        sessionId: 1, completedAt: '2026-05-15T10:00:00Z',
        sets: [
          { idx: 1, weightKg: 90, reps: 8, rpe: 7, completed: true },
          { idx: 2, weightKg: 90, reps: 8, rpe: 8, completed: true },
          { idx: 3, weightKg: 90, reps: 7, rpe: 9, completed: true },
        ],
      },
      plannedSetsToday: 4, firstTime: false,
    }} onClose={() => {}} />);
    expect(r.getByText('Set 1 · 90 kg × 8 · RPE 7')).toBeTruthy();
    expect(r.getByTestId('extrapolated-set-4')).toBeTruthy();
  });

  it('renders first-time full-card message', () => {
    const r = render(<HistorySheet data={{
      exercise: { id: 2, name: 'Bench' },
      target: { weightKg: 70, repsLow: 8, repsHigh: 8, sets: 3, source: 'AI_BOOTSTRAP' },
      lastSession: null, plannedSetsToday: 3, firstTime: true,
    }} onClose={() => {}} />);
    expect(r.getByText(/AI starting weight: 70 kg × 8/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run, fail**

Run: `cd client-app && npx jest HistorySheet -q`

- [ ] **Step 3: Implement**

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ExerciseHistory } from '../../services/exerciseHistoryService';

type Props = { data: ExerciseHistory; onClose: () => void };

export default function HistorySheet({ data, onClose }: Props) {
  const { exercise, target, lastSession, plannedSetsToday, firstTime } = data;

  return (
    <View style={styles.sheet}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{exercise.name}</Text>
          <Text style={styles.sub}>
            {lastSession ? `Last session · ${relative(lastSession.completedAt)}` : 'No history yet'}
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12}><Text style={styles.close}>Close</Text></Pressable>
      </View>

      {firstTime ? (
        <View style={styles.firstCard}>
          <Text style={styles.firstTitle}>
            AI starting weight: {target?.weightKg ?? '—'} kg × {target?.repsLow ?? '—'}
          </Text>
          <Text style={styles.firstBody}>
            Adjust on set 1 — first time on this exercise.
          </Text>
        </View>
      ) : (
        <ScrollView>
          {target && (
            <View style={styles.targetCard}>
              <Text style={styles.targetLine}>
                Today: {target.sets} × {target.repsLow}–{target.repsHigh} @ {target.weightKg ?? 'BW'} kg
              </Text>
            </View>
          )}
          {lastSession?.sets.map(s => (
            <Text key={s.idx} style={styles.setRow}>
              Set {s.idx} · {s.weightKg ?? 'BW'} kg × {s.reps}
              {s.rpe != null ? ` · RPE ${s.rpe}` : ''}
            </Text>
          ))}
          {plannedSetsToday != null && lastSession &&
            plannedSetsToday > lastSession.sets.length &&
            Array.from({ length: plannedSetsToday - lastSession.sets.length }).map((_, i) => {
              const idx = lastSession.sets.length + i + 1;
              const lastSet = lastSession.sets[lastSession.sets.length - 1];
              return (
                <View key={`x-${idx}`} testID={`extrapolated-set-${idx}`} style={styles.extrapolated}>
                  <Text style={styles.extrapolatedText}>
                    Set {idx} · ≈ {lastSet.weightKg ?? 'BW'} kg × ~{Math.max(1, lastSet.reps - 1)} (estimated)
                  </Text>
                </View>
              );
            })}
        </ScrollView>
      )}
    </View>
  );
}

function relative(iso: string): string {
  const now = Date.now(); const then = new Date(iso).getTime();
  const days = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: '#FFFFFF', padding: 18, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 17, fontWeight: '600', color: '#1B1108' },
  sub: { fontSize: 11, color: 'rgba(60,40,28,0.58)', marginTop: 3 },
  close: { fontSize: 13, color: '#E06313', fontWeight: '600' },

  targetCard: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(224,99,19,0.10)', marginBottom: 12 },
  targetLine: { fontFamily: 'Geist Mono', fontSize: 13, color: '#1B1108' },

  setRow: { fontFamily: 'Geist Mono', fontSize: 13, color: '#3A2A1F', paddingVertical: 8 },

  extrapolated: {
    padding: 8, marginVertical: 4, borderRadius: 10,
    borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(224,99,19,0.30)',
    backgroundColor: 'rgba(224,99,19,0.10)',
  },
  extrapolatedText: { fontFamily: 'Geist Mono', fontSize: 12, color: 'rgba(60,40,28,0.58)' },

  firstCard: { padding: 14, borderRadius: 14, backgroundColor: '#FFF3E8' },
  firstTitle: { fontSize: 14, fontWeight: '600', color: '#1B1108' },
  firstBody: { fontSize: 12, color: '#3A2A1F', marginTop: 4 },
});
```

- [ ] **Step 4: Run, pass**

Run: `cd client-app && npx jest HistorySheet -q`

- [ ] **Step 5: Commit**

```bash
git add client-app/src/components/session/HistorySheet.tsx client-app/__tests__/components/session/HistorySheet.test.tsx
git commit -m "VIS-61: HistorySheet with extrapolated dotted rows + first-time card"
```

### Task 2.5: Wire `UpNextRow` + `HistorySheet` into `ActiveSessionScreen`

**Files:**
- Modify: `client-app/src/screens/ActiveSessionScreen.tsx`

- [ ] **Step 1: For each upcoming exercise in the "Up next" list, render `<UpNextRow data={hist} onPress={() => openSheet(hist)} />` instead of the existing static row. Show `<HistorySheet>` inside a modal when an exercise is tapped.**

The exact JSX depends on the existing ActiveSessionScreen layout (which doesn't exist yet at plan-write time). When implementing: use the prototype `ClientApp.jsx` reference (`prototype/src/client/ClientApp.jsx:243-263`) as the layout template, and substitute the static `<exerciseIcon>+text>` rows with `<UpNextRow>`.

- [ ] **Step 2: Add a Detox e2e or component snapshot for the wired screen, then commit.**

```bash
git add client-app/src/screens/ActiveSessionScreen.tsx
git commit -m "VIS-61: wire UpNextRow + HistorySheet into ActiveSessionScreen"
```

---

## Phase 3 — Trainer App (BLOCKED until workout plan builder lands)

> Prerequisite: a workout plan builder screen exists in `trainer-app/`. The master plan's trainer-app phase must complete this first.

### Task 3.1: `AiSetChip` component

**Files:**
- Create: `trainer-app/src/components/plan/AiSetChip.tsx`
- Create: `trainer-app/__tests__/components/plan/AiSetChip.test.tsx`

- [ ] **Step 1: Write the test**

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import AiSetChip from '../../../src/components/plan/AiSetChip';

describe('AiSetChip', () => {
  it('renders AI source label and opens rationale on press', () => {
    const onPress = jest.fn();
    const r = render(<AiSetChip source="AI" rationale="hit top" confidence={0.8} onPress={onPress} />);
    expect(r.getByText('AI-set')).toBeTruthy();
    fireEvent.press(r.getByText('AI-set'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders Locked when trainer override active', () => {
    const r = render(<AiSetChip source="TRAINER" locked rationale={null} confidence={null} onPress={() => {}} />);
    expect(r.getByText('Locked')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run, fail. Implement:**

```tsx
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

type Props = {
  source: 'TRAINER' | 'AI' | 'AI_BOOTSTRAP';
  locked?: boolean;
  rationale: string | null;
  confidence: number | null;
  onPress: () => void;
};

export default function AiSetChip({ source, locked, onPress }: Props) {
  const isLocked = locked || source === 'TRAINER';
  return (
    <Pressable onPress={onPress} style={[styles.chip, isLocked ? styles.locked : styles.ai]}>
      <Text style={[styles.text, isLocked ? styles.lockedText : styles.aiText]}>
        {isLocked ? 'Locked' : 'AI-set'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, alignSelf: 'flex-start' },
  ai: { backgroundColor: 'rgba(224,99,19,0.12)' },
  locked: { backgroundColor: 'rgba(60,40,28,0.10)' },
  text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  aiText: { color: '#E06313' },
  lockedText: { color: 'rgba(60,40,28,0.62)' },
});
```

- [ ] **Step 3: Run, pass. Commit.**

```bash
git add trainer-app/src/components/plan/AiSetChip.tsx trainer-app/__tests__/components/plan/AiSetChip.test.tsx
git commit -m "VIS-61: AiSetChip with AI / Locked states"
```

### Task 3.2: `exerciseTargetService` — PUT override

**Files:**
- Create: `trainer-app/src/services/exerciseTargetService.ts`

- [ ] **Step 1: Implement (test mirrors Phase 2 patterns)**

```ts
import { apiPut } from './apiService';

export type TargetOverride = {
  weightKg: number | null;
  repsLow: number;
  repsHigh: number;
  sets: number;
  aiLocked: boolean;
};

export async function overrideTarget(
  clientId: number,
  exerciseId: number,
  payload: TargetOverride,
): Promise<void> {
  await apiPut(`/trainer/clients/${clientId}/exercises/${exerciseId}/target`, payload);
}
```

- [ ] **Step 2: Add the matching backend `PUT /api/trainer/clients/{clientId}/exercises/{exerciseId}/target` endpoint with a small slice test. Sets `source=TRAINER`, `ai_locked=true` unless payload explicitly sets `ai_locked=false`.**

- [ ] **Step 3: Commit**

```bash
git add trainer-app/src/services/exerciseTargetService.ts backend/src/main/java/in/vis/controller/TrainerTargetController.java backend/src/test/java/in/vis/controller/TrainerTargetControllerTest.java
git commit -m "VIS-61: trainer override endpoint + service (flips source=TRAINER, ai_locked=true)"
```

### Task 3.3: Wire chip + override into the plan builder

**Files:**
- Modify: existing plan-builder row component (path TBD when builder lands)

- [ ] **Step 1: For each target row in the builder: render the existing fields plus `<AiSetChip>`. Tapping the chip opens a small popover with rationale + confidence + "Let AI manage this" toggle. Editing any value triggers `overrideTarget(...)` on save.**

- [ ] **Step 2: Snapshot test + commit.**

```bash
git commit -m "VIS-61: wire AiSetChip and override into trainer plan builder"
```

---

## Self-review checklist (already run)

- **Spec coverage:** all spec sections map to a task — data model (1.1), service layer (1.10–1.14, 1.16), endpoints (1.17–1.18), client app surface (2.1–2.5), trainer override (3.1–3.3), test plan (1.10, 1.12, 1.14, 1.17–1.19, 2.x, 3.x). Backfill path noted in spec §10 is implicit (new rows just don't exist; no migration data needed).
- **Placeholder scan:** none. The two "(path TBD when builder lands)" notes in Phase 3 are explicit prerequisites, not silent placeholders.
- **Type consistency:** `NextTargetOutput` shape consistent across builder + adapter + service. `ExerciseHistoryResponse` shape consistent between backend DTO + client `ExerciseHistory` type. Repo method names (`findRecent`, `findByClientIdAndExerciseId`, `existsRecent`) used consistently.
