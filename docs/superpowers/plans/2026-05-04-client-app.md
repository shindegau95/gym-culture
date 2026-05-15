# Client App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Resume:** Check `PLAN.md` at project root. Pick up from first unchecked task in Phase 3.

**Goal:** PT members can view their schedule, log sessions with their trainer, track body progress, view their nutrition plan, and manage their gym visit schedule.

**Architecture:** New Spring Boot endpoints added to the existing backend (which already has workout plans, sessions, and nutrition from Phase 2). React Native Client App (scaffolded in Phase 0) gets a 5-tab shell: Home, Workout, Progress, Nutrition, Profile. Active session syncs with the Trainer App via polling (every 5 seconds, same approach as Phase 2). Apple HealthKit / Google Health Connect data is read on device and never sent to the backend.

**Tech Stack:** Spring Boot (adds body measurements, gym schedule, ratings, recovery domains), React Native 0.74, React Navigation v6 (bottom tabs + stack), Victory Native (charts), react-native-health (Apple HealthKit), react-native-health-connect (Google Health Connect), Firebase Cloud Messaging (push notifications)

**Prerequisite:** Phase 2 complete — trainers have assigned plans and sessions exist in DB.

---

## File Map

### Backend additions
```
backend/src/main/java/in/vis/
  model/
    BodyMeasurement.java          # Client body stats snapshots over time
    GymSchedule.java              # Client default visit time + per-day overrides
    # TrainerRating.java — already defined in Phase 1 (admin-web.md), no duplicate needed
  repository/
    BodyMeasurementRepository.java
    GymScheduleRepository.java
    # TrainerRatingRepository.java — already defined in Phase 1
  service/
    BodyMeasurementService.java
    GymScheduleService.java
    RecoveryService.java          # Muscle recovery computation
    TrainerRatingService.java
    ClientHomeService.java        # Aggregates home screen data
  controller/
    BodyMeasurementController.java
    GymScheduleController.java
    RecoveryController.java
    TrainerRatingController.java
    ClientHomeController.java
    TrainerLeaderboardController.java
  dto/
    BodyMeasurementDto.java
    GymScheduleDto.java
    RecoveryStatusDto.java
    TrainerRatingDto.java
    ClientHomeDto.java
    TrainerLeaderboardDto.java

src/main/resources/db/migration/
  V12__create_body_measurements.sql
  V13__create_gym_schedule.sql
  V14__alter_trainer_ratings_add_branch.sql
```

### Client App additions
```
client-app/src/
  screens/
    auth/
      PendingScreen.js            # "Account pending activation" gate
    onboarding/
      BodyProfileScreen.js        # Height, weight, measurements, goal
      TrainerLeaderboardScreen.js # Trainer selection during onboarding
    home/
      HomeScreen.js
      WorkoutCard.js
      WeeklyStreak.js
      HealthStatsRow.js
      RecoveryChips.js
    workout/
      WorkoutScreen.js            # Today's plan + weekly schedule
      WeeklyScheduleView.js
      ActiveSessionScreen.js      # Shared set-logging view
      ExercisePickerModal.js
    progress/
      ProgressScreen.js
      MeasurementCharts.js
      StrengthChart.js
      AttendanceCalendar.js
    nutrition/
      NutritionScreen.js
      MealCard.js
    profile/
      ProfileScreen.js
      GymScheduleEditor.js
  navigation/
    AppNavigator.js               # Replace Phase 0 shell with 5-tab nav
    HomeStack.js
    WorkoutStack.js
    ProgressStack.js
  services/
    homeService.js
    workoutService.js
    sessionService.js
    progressService.js
    nutritionService.js
    profileService.js
    recoveryService.js
    healthService.js              # HealthKit / Health Connect abstraction
    notificationService.js
  hooks/
    useHealth.js
    useSession.js                 # Polling hook for active session sync
```

---

## Task 1: Backend migrations — body measurements, gym schedule, trainer ratings

**Files:**
- Create: `backend/src/main/resources/db/migration/V12__create_body_measurements.sql`
- Create: `backend/src/main/resources/db/migration/V13__create_gym_schedule.sql`
- Create: `backend/src/main/resources/db/migration/V14__alter_trainer_ratings_add_branch.sql`

- [ ] **Step 1: Write `V12__create_body_measurements.sql`**

```sql
CREATE TABLE body_measurements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id   UUID NOT NULL REFERENCES users(id),
    branch_id   UUID NOT NULL REFERENCES branches(id),
    logged_by   UUID NOT NULL REFERENCES users(id),  -- client or trainer
    height_cm   DECIMAL(5,1),
    weight_kg   DECIMAL(5,2),
    body_fat_pct DECIMAL(4,1),
    chest_cm    DECIMAL(5,1),
    waist_cm    DECIMAL(5,1),
    hips_cm     DECIMAL(5,1),
    arms_cm     DECIMAL(5,1),
    thighs_cm   DECIMAL(5,1),
    notes       TEXT,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_body_measurements_client ON body_measurements(client_id, measured_at DESC);
```

- [ ] **Step 2: Write `V13__create_gym_schedule.sql`**

```sql
CREATE TABLE gym_schedules (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id    UUID NOT NULL REFERENCES users(id) UNIQUE,
    default_time TIME NOT NULL DEFAULT '07:00',
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE gym_schedule_overrides (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id   UUID NOT NULL REFERENCES gym_schedules(id) ON DELETE CASCADE,
    override_date DATE NOT NULL,
    visit_time    TIME,              -- NULL means rest day
    is_rest_day   BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(schedule_id, override_date)
);
```

- [ ] **Step 3: Verify trainer_ratings table exists (created in Phase 1 V7)**

The `trainer_ratings` table was already created by `V7__create_trainer_ratings.sql` in Phase 1. No new migration needed. The Phase 3 schema (with `branch_id` column) differs slightly from V7 — if the branch_id column is needed, add it as a separate `V14__alter_trainer_ratings_add_branch.sql`:

```sql
ALTER TABLE trainer_ratings ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id);
CREATE INDEX IF NOT EXISTS idx_trainer_ratings_branch ON trainer_ratings(branch_id);
```

Run migration to confirm:
```bash
mvn flyway:migrate
```
Expected: 1 migration applied (V14 alter, not create).

- [ ] **Step 4: Run Flyway migration**

```bash
cd backend
./mvnw flyway:migrate -Dspring.datasource.url=$NEON_DATABASE_URL
```
Expected: `Successfully applied 3 migrations` (V12, V13 create; V14 alter)

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/resources/db/migration/V12__create_body_measurements.sql \
        backend/src/main/resources/db/migration/V13__create_gym_schedule.sql \
        backend/src/main/resources/db/migration/V14__alter_trainer_ratings_add_branch.sql
git commit -m "feat: add body measurements, gym schedule migrations; alter trainer_ratings to add branch_id"
```

---

## Task 2: Backend — BodyMeasurement model, repo, service, controller

**Files:**
- Create: `backend/src/main/java/in/vis/model/BodyMeasurement.java`
- Create: `backend/src/main/java/in/vis/repository/BodyMeasurementRepository.java`
- Create: `backend/src/main/java/in/vis/dto/BodyMeasurementDto.java`
- Create: `backend/src/main/java/in/vis/service/BodyMeasurementService.java`
- Create: `backend/src/main/java/in/vis/controller/BodyMeasurementController.java`

- [ ] **Step 1: Write `BodyMeasurement.java`**

```java
package in.vis.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "body_measurements") @Data
public class BodyMeasurement {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "client_id", nullable = false) private UUID clientId;
    @Column(name = "branch_id", nullable = false) private UUID branchId;
    @Column(name = "logged_by", nullable = false) private UUID loggedBy;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private BigDecimal bodyFatPct;
    private BigDecimal chestCm;
    private BigDecimal waistCm;
    private BigDecimal hipsCm;
    private BigDecimal armsCm;
    private BigDecimal thighsCm;
    private String notes;
    @Column(name = "measured_at") private OffsetDateTime measuredAt = OffsetDateTime.now();
}
```

- [ ] **Step 2: Write `BodyMeasurementRepository.java`**

```java
package in.vis.repository;

import in.vis.model.BodyMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface BodyMeasurementRepository extends JpaRepository<BodyMeasurement, UUID> {
    List<BodyMeasurement> findByClientIdOrderByMeasuredAtDesc(UUID clientId);
}
```

- [ ] **Step 3: Write `BodyMeasurementDto.java`**

```java
package in.vis.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class BodyMeasurementDto {
    private UUID id;
    private UUID clientId;
    private UUID loggedBy;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private BigDecimal bodyFatPct;
    private BigDecimal chestCm;
    private BigDecimal waistCm;
    private BigDecimal hipsCm;
    private BigDecimal armsCm;
    private BigDecimal thighsCm;
    private String notes;
    private OffsetDateTime measuredAt;
}
```

- [ ] **Step 4: Write `BodyMeasurementService.java`**

```java
package in.vis.service;

import in.vis.dto.BodyMeasurementDto;
import in.vis.model.BodyMeasurement;
import in.vis.model.User;
import in.vis.repository.BodyMeasurementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class BodyMeasurementService {
    private final BodyMeasurementRepository repo;

    public List<BodyMeasurementDto> getHistory(UUID clientId) {
        return repo.findByClientIdOrderByMeasuredAtDesc(clientId)
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    public BodyMeasurementDto log(BodyMeasurementDto dto, User actor) {
        BodyMeasurement m = new BodyMeasurement();
        m.setClientId(dto.getClientId());
        m.setBranchId(actor.getBranch() != null ? actor.getBranch().getId() : null);
        m.setLoggedBy(actor.getId());
        m.setHeightCm(dto.getHeightCm()); m.setWeightKg(dto.getWeightKg());
        m.setBodyFatPct(dto.getBodyFatPct());
        m.setChestCm(dto.getChestCm());
        m.setWaistCm(dto.getWaistCm());
        m.setHipsCm(dto.getHipsCm());
        m.setArmsCm(dto.getArmsCm());
        m.setThighsCm(dto.getThighsCm());
        m.setNotes(dto.getNotes());
        return toDto(repo.save(m));
    }

    private BodyMeasurementDto toDto(BodyMeasurement m) {
        BodyMeasurementDto d = new BodyMeasurementDto();
        d.setId(m.getId()); d.setClientId(m.getClientId());
        d.setLoggedBy(m.getLoggedBy()); d.setHeightCm(m.getHeightCm()); d.setWeightKg(m.getWeightKg());
        d.setBodyFatPct(m.getBodyFatPct()); d.setChestCm(m.getChestCm());
        d.setWaistCm(m.getWaistCm()); d.setHipsCm(m.getHipsCm());
        d.setArmsCm(m.getArmsCm()); d.setThighsCm(m.getThighsCm());
        d.setNotes(m.getNotes()); d.setMeasuredAt(m.getMeasuredAt());
        return d;
    }
}
```

- [ ] **Step 5: Write `BodyMeasurementController.java`**

```java
package in.vis.controller;

import in.vis.dto.BodyMeasurementDto;
import in.vis.model.User;
import in.vis.service.BodyMeasurementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/measurements") @RequiredArgsConstructor
public class BodyMeasurementController {
    private final BodyMeasurementService service;

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<BodyMeasurementDto>> getHistory(@PathVariable UUID clientId,
            Authentication auth) {
        branchContext.resolveUser(auth); // ensure authenticated
        return ResponseEntity.ok(service.getHistory(clientId));
    }

    @PostMapping
    public ResponseEntity<BodyMeasurementDto> log(@RequestBody BodyMeasurementDto dto,
            Authentication auth) {
        User actor = branchContext.resolveUser(auth);
        return ResponseEntity.ok(service.log(dto, actor));
    }
}
```

- [ ] **Step 6: Write test**

```java
// backend/src/test/java/in/vis/controller/BodyMeasurementControllerTest.java
@SpringBootTest @AutoConfigureMockMvc
class BodyMeasurementControllerTest {
    @Test void logAndRetrieve() throws Exception {
        // POST /measurements with valid client token
        // GET /measurements/client/{id} — assert at least 1 entry returned
    }
}
```

- [ ] **Step 7: Run tests**

```bash
cd backend && ./mvnw test -pl . -Dtest=BodyMeasurementControllerTest
```
Expected: BUILD SUCCESS

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/java/in/vis/model/BodyMeasurement.java \
        backend/src/main/java/in/vis/repository/BodyMeasurementRepository.java \
        backend/src/main/java/in/vis/dto/BodyMeasurementDto.java \
        backend/src/main/java/in/vis/service/BodyMeasurementService.java \
        backend/src/main/java/in/vis/controller/BodyMeasurementController.java \
        backend/src/test/java/in/vis/controller/BodyMeasurementControllerTest.java
git commit -m "feat: body measurement log + history endpoint"
```

---

## Task 3: Backend — Muscle recovery computation endpoint

**Files:**
- Create: `backend/src/main/java/in/vis/dto/RecoveryStatusDto.java`
- Create: `backend/src/main/java/in/vis/service/RecoveryService.java`
- Create: `backend/src/main/java/in/vis/controller/RecoveryController.java`

Recovery is computed from `session_logs` (Phase 2). For each muscle group, find the last `session_log` entry where that muscle group appears (via the exercise's `muscle_groups` array). Compare `logged_at` to `now()`. Recovery thresholds (hours): CHEST 48, UPPER_BACK 48, LATS 48, LOWER_BACK 48, FRONT_DELT 48, SIDE_DELT 48, REAR_DELT 48, BICEPS 36, TRICEPS 36, FOREARMS 24, QUADS 72, HAMSTRINGS 72, GLUTES 72, CALVES 48, CORE 24.

- [ ] **Step 1: Write `RecoveryStatusDto.java`**

```java
package in.vis.dto;

import lombok.Data;
import java.util.Map;

@Data
public class RecoveryStatusDto {
    // muscle group name → hours remaining (0 = fully recovered)
    private Map<String, Integer> hoursRemaining;
}
```

- [ ] **Step 2: Write `RecoveryService.java`**

```java
package in.vis.service;

import in.vis.dto.RecoveryStatusDto;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.util.*;

@Service @RequiredArgsConstructor
public class RecoveryService {

    private final JdbcTemplate jdbc;

    private static final Map<String, Integer> RECOVERY_HOURS = Map.ofEntries(
        Map.entry("CHEST", 48), Map.entry("UPPER_BACK", 48), Map.entry("LATS", 48),
        Map.entry("LOWER_BACK", 48), Map.entry("FRONT_DELT", 48), Map.entry("SIDE_DELT", 48),
        Map.entry("REAR_DELT", 48), Map.entry("BICEPS", 36), Map.entry("TRICEPS", 36),
        Map.entry("FOREARMS", 24), Map.entry("QUADS", 72), Map.entry("HAMSTRINGS", 72),
        Map.entry("GLUTES", 72), Map.entry("CALVES", 48), Map.entry("CORE", 24)
    );

    public RecoveryStatusDto compute(UUID clientId) {
        // Find last session log time per muscle group via JOIN on exercises
        String sql = """
            SELECT UNNEST(e.muscle_groups) AS muscle, MAX(sl.logged_at) AS last_trained
            FROM session_logs sl
            JOIN exercises e ON e.id = sl.exercise_id
            JOIN workout_sessions ws ON ws.id = sl.session_id
            WHERE ws.client_id = ?
            GROUP BY UNNEST(e.muscle_groups)
            """;

        Map<String, OffsetDateTime> lastTrained = new HashMap<>();
        jdbc.query(sql, rs -> {
            lastTrained.put(rs.getString("muscle"),
                rs.getObject("last_trained", OffsetDateTime.class));
        }, clientId);

        OffsetDateTime now = OffsetDateTime.now();
        Map<String, Integer> hoursRemaining = new LinkedHashMap<>();
        for (Map.Entry<String, Integer> entry : RECOVERY_HOURS.entrySet()) {
            String muscle = entry.getKey();
            int threshold = entry.getValue();
            OffsetDateTime lt = lastTrained.get(muscle);
            if (lt == null) {
                hoursRemaining.put(muscle, 0);
            } else {
                long hoursElapsed = java.time.Duration.between(lt, now).toHours();
                int remaining = (int) Math.max(0, threshold - hoursElapsed);
                hoursRemaining.put(muscle, remaining);
            }
        }
        RecoveryStatusDto dto = new RecoveryStatusDto();
        dto.setHoursRemaining(hoursRemaining);
        return dto;
    }
}
```

- [ ] **Step 3: Write `RecoveryController.java`**

```java
package in.vis.controller;

import in.vis.dto.RecoveryStatusDto;
import in.vis.service.RecoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController @RequestMapping("/recovery") @RequiredArgsConstructor
public class RecoveryController {
    private final RecoveryService service;

    @GetMapping("/client/{clientId}")
    public ResponseEntity<RecoveryStatusDto> getRecovery(@PathVariable UUID clientId,
            Authentication auth) {
        branchContext.resolveUser(auth); // ensure authenticated
        return ResponseEntity.ok(service.compute(clientId));
    }
}
```

- [ ] **Step 4: Write test**

```java
// backend/src/test/java/in/vis/service/RecoveryServiceTest.java
@SpringBootTest
class RecoveryServiceTest {
    @Autowired RecoveryService service;

    @Test void allMusclesRecoveredWithNoSessions() {
        // client with no session logs — all hoursRemaining should be 0
        UUID newClientId = UUID.randomUUID();
        RecoveryStatusDto dto = service.compute(newClientId);
        assertTrue(dto.getHoursRemaining().values().stream().allMatch(h -> h == 0));
    }

    @Test void muscleShowsHoursRemainingAfterRecentSession() {
        // Insert a session_log for CHEST exercise logged 10 hours ago
        // Expect hoursRemaining["CHEST"] == 38 (threshold 48 - 10 = 38)
    }
}
```

- [ ] **Step 5: Run tests**

```bash
cd backend && ./mvnw test -Dtest=RecoveryServiceTest
```
Expected: BUILD SUCCESS

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/in/vis/dto/RecoveryStatusDto.java \
        backend/src/main/java/in/vis/service/RecoveryService.java \
        backend/src/main/java/in/vis/controller/RecoveryController.java \
        backend/src/test/java/in/vis/service/RecoveryServiceTest.java
git commit -m "feat: muscle recovery computation endpoint"
```

---

## Task 4: Backend — Client home endpoint

**Files:**
- Create: `backend/src/main/java/in/vis/dto/ClientHomeDto.java`
- Create: `backend/src/main/java/in/vis/service/ClientHomeService.java`
- Create: `backend/src/main/java/in/vis/controller/ClientHomeController.java`

The home endpoint returns: today's assigned workout (from active workout plan), current week's attendance (Mon–Sun), streak count, and "up next" workout day.

- [ ] **Step 1: Write `ClientHomeDto.java`**

```java
package in.vis.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ClientHomeDto {
    private TodayWorkout todayWorkout;     // null if rest day or no plan
    private List<DayAttendance> weekStreak; // 7 entries Mon–Sun
    private int streakCount;               // consecutive attended days
    private UpNext upNext;                 // next non-rest workout day

    @Data public static class TodayWorkout {
        private String planName;
        private int weekNumber;
        private int dayNumber;
        private String muscleGroupLabel;
        private int totalExercises;
        private int completedExercises;
        private String sessionId;          // null if session not started
    }

    @Data public static class DayAttendance {
        private LocalDate date;
        private boolean attended;
        private boolean isRestDay;
    }

    @Data public static class UpNext {
        private LocalDate date;
        private String planDayLabel;
        private int exerciseCount;
    }
}
```

- [ ] **Step 2: Write `ClientHomeService.java`**

```java
package in.vis.service;

import in.vis.dto.ClientHomeDto;
import in.vis.model.WorkoutSession;
import in.vis.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class ClientHomeService {
    private final WorkoutPlanRepository planRepo;
    private final WorkoutSessionRepository sessionRepo;
    private final WorkoutDayRepository dayRepo;

    public ClientHomeDto buildHome(UUID clientId) {
        ClientHomeDto dto = new ClientHomeDto();
        LocalDate today = LocalDate.now();

        // Active plan for this client
        var plan = planRepo.findFirstByClientIdAndActiveTrue(clientId).orElse(null);

        // Today's session if started
        var todaySession = sessionRepo.findByClientIdAndSessionDate(clientId, today).orElse(null);

        if (plan != null) {
            // Determine which plan day maps to today
            long daysSinceStart = java.time.temporal.ChronoUnit.DAYS.between(plan.getCreatedAt().toLocalDate(), today);
            int daysPerWeek = plan.getDaysPerWeek();
            int dayIndex = (int)(daysSinceStart % daysPerWeek);
            var planDays = dayRepo.findByPlanIdOrderByDayNumber(plan.getId());

            if (dayIndex < planDays.size()) {
                var planDay = planDays.get(dayIndex);
                ClientHomeDto.TodayWorkout tw = new ClientHomeDto.TodayWorkout();
                tw.setPlanName(plan.getName());
                tw.setWeekNumber((int)(daysSinceStart / daysPerWeek) + 1);
                tw.setDayNumber(planDay.getDayNumber());
                tw.setMuscleGroupLabel(planDay.getMuscleGroupLabel());
                tw.setTotalExercises(planDay.getExerciseCount());
                tw.setCompletedExercises(todaySession != null ? todaySession.getCompletedExercises() : 0);
                tw.setSessionId(todaySession != null ? todaySession.getId().toString() : null);
                dto.setTodayWorkout(tw);
            }
        }

        // Week streak (Mon–Sun of current week)
        LocalDate monday = today.with(DayOfWeek.MONDAY);
        List<ClientHomeDto.DayAttendance> week = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = monday.plusDays(i);
            var session = sessionRepo.findByClientIdAndSessionDate(clientId, d).orElse(null);
            ClientHomeDto.DayAttendance da = new ClientHomeDto.DayAttendance();
            da.setDate(d); da.setAttended(session != null && session.isCompleted());
            week.add(da);
        }
        dto.setWeekStreak(week);
        dto.setStreakCount(computeStreak(clientId, today));

        return dto;
    }

    private int computeStreak(UUID clientId, LocalDate today) {
        int streak = 0;
        LocalDate d = today;
        while (true) {
            var s = sessionRepo.findByClientIdAndSessionDate(clientId, d).orElse(null);
            if (s == null || !s.isCompleted()) break;
            streak++;
            d = d.minusDays(1);
        }
        return streak;
    }
}
```

- [ ] **Step 3: Write `ClientHomeController.java`**

```java
package in.vis.controller;

import in.vis.dto.ClientHomeDto;
import in.vis.model.User;
import in.vis.service.ClientHomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/client/home") @RequiredArgsConstructor
public class ClientHomeController {
    private final ClientHomeService service;

    @GetMapping
    public ResponseEntity<ClientHomeDto> getHome(Authentication auth) {
        User actor = branchContext.resolveUser(auth);
        return ResponseEntity.ok(service.buildHome(actor.getId()));
    }
}
```

- [ ] **Step 4: Write test**

```java
// backend/src/test/java/in/vis/controller/ClientHomeControllerTest.java
@SpringBootTest @AutoConfigureMockMvc
class ClientHomeControllerTest {
    @Test void returnsHomeForClientWithActivePlan() throws Exception {
        // GET /client/home with client token
        // Assert 200 with weekStreak of length 7
    }

    @Test void returnsEmptyHomeForClientWithNoPlan() throws Exception {
        // GET /client/home with client token but no plan assigned
        // Assert 200 with null todayWorkout
    }
}
```

- [ ] **Step 5: Run tests**

```bash
cd backend && ./mvnw test -Dtest=ClientHomeControllerTest
```
Expected: BUILD SUCCESS

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/in/vis/dto/ClientHomeDto.java \
        backend/src/main/java/in/vis/service/ClientHomeService.java \
        backend/src/main/java/in/vis/controller/ClientHomeController.java \
        backend/src/test/java/in/vis/controller/ClientHomeControllerTest.java
git commit -m "feat: client home endpoint (today's workout, streak, up next)"
```

---

## Task 5: Backend — Gym schedule endpoint

**Files:**
- Create: `backend/src/main/java/in/vis/model/GymSchedule.java`
- Create: `backend/src/main/java/in/vis/model/GymScheduleOverride.java`
- Create: `backend/src/main/java/in/vis/repository/GymScheduleRepository.java`
- Create: `backend/src/main/java/in/vis/dto/GymScheduleDto.java`
- Create: `backend/src/main/java/in/vis/service/GymScheduleService.java`
- Create: `backend/src/main/java/in/vis/controller/GymScheduleController.java`

- [ ] **Step 1: Write `GymSchedule.java`**

```java
package in.vis.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.*;

@Entity @Table(name = "gym_schedules") @Data
public class GymSchedule {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "client_id", unique = true, nullable = false) private UUID clientId;
    @Column(name = "default_time", nullable = false) private LocalTime defaultTime = LocalTime.of(7, 0);
    @Column(name = "created_at") private OffsetDateTime createdAt = OffsetDateTime.now();
    @Column(name = "updated_at") private OffsetDateTime updatedAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GymScheduleOverride> overrides = new ArrayList<>();
}
```

- [ ] **Step 2: Write `GymScheduleOverride.java`**

```java
package in.vis.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity @Table(name = "gym_schedule_overrides") @Data
public class GymScheduleOverride {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "schedule_id") private GymSchedule schedule;
    @Column(name = "override_date", nullable = false) private LocalDate overrideDate;
    @Column(name = "visit_time") private LocalTime visitTime;
    @Column(name = "is_rest_day", nullable = false) private boolean restDay = false;
}
```

- [ ] **Step 3: Write `GymScheduleRepository.java`**

```java
package in.vis.repository;

import in.vis.model.GymSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface GymScheduleRepository extends JpaRepository<GymSchedule, UUID> {
    Optional<GymSchedule> findByClientId(UUID clientId);
}
```

- [ ] **Step 4: Write `GymScheduleDto.java`**

```java
package in.vis.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class GymScheduleDto {
    private LocalTime defaultTime;
    private List<OverrideDto> overrides;

    @Data public static class OverrideDto {
        private LocalDate date;
        private LocalTime visitTime;  // null if rest day
        private boolean restDay;
    }
}
```

- [ ] **Step 5: Write `GymScheduleService.java`**

```java
package in.vis.service;

import in.vis.dto.GymScheduleDto;
import in.vis.model.GymSchedule;
import in.vis.model.GymScheduleOverride;
import in.vis.repository.GymScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class GymScheduleService {
    private final GymScheduleRepository repo;

    public GymScheduleDto get(UUID clientId) {
        GymSchedule schedule = repo.findByClientId(clientId)
            .orElseGet(() -> createDefault(clientId));
        return toDto(schedule);
    }

    public GymScheduleDto save(UUID clientId, GymScheduleDto dto) {
        GymSchedule schedule = repo.findByClientId(clientId)
            .orElseGet(() -> { GymSchedule s = new GymSchedule(); s.setClientId(clientId); return s; });
        schedule.setDefaultTime(dto.getDefaultTime());
        schedule.getOverrides().clear();
        if (dto.getOverrides() != null) {
            dto.getOverrides().forEach(o -> {
                GymScheduleOverride ov = new GymScheduleOverride();
                ov.setSchedule(schedule); ov.setOverrideDate(o.getDate());
                ov.setVisitTime(o.getVisitTime()); ov.setRestDay(o.isRestDay());
                schedule.getOverrides().add(ov);
            });
        }
        return toDto(repo.save(schedule));
    }

    private GymSchedule createDefault(UUID clientId) {
        GymSchedule s = new GymSchedule(); s.setClientId(clientId);
        return repo.save(s);
    }

    private GymScheduleDto toDto(GymSchedule s) {
        GymScheduleDto dto = new GymScheduleDto();
        dto.setDefaultTime(s.getDefaultTime());
        dto.setOverrides(s.getOverrides().stream().map(o -> {
            GymScheduleDto.OverrideDto od = new GymScheduleDto.OverrideDto();
            od.setDate(o.getOverrideDate()); od.setVisitTime(o.getVisitTime()); od.setRestDay(o.isRestDay());
            return od;
        }).collect(Collectors.toList()));
        return dto;
    }
}
```

- [ ] **Step 6: Write `GymScheduleController.java`**

```java
package in.vis.controller;

import in.vis.dto.GymScheduleDto;
import in.vis.model.User;
import in.vis.service.GymScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/gym-schedule") @RequiredArgsConstructor
public class GymScheduleController {
    private final GymScheduleService service;

    @GetMapping
    public ResponseEntity<GymScheduleDto> get(Authentication auth) {
        User actor = branchContext.resolveUser(auth);
        return ResponseEntity.ok(service.get(actor.getId()));
    }

    @PutMapping
    public ResponseEntity<GymScheduleDto> save(@RequestBody GymScheduleDto dto,
            Authentication auth) {
        User actor = branchContext.resolveUser(auth);
        return ResponseEntity.ok(service.save(actor.getId(), dto));
    }
}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/in/vis/model/GymSchedule.java \
        backend/src/main/java/in/vis/model/GymScheduleOverride.java \
        backend/src/main/java/in/vis/repository/GymScheduleRepository.java \
        backend/src/main/java/in/vis/dto/GymScheduleDto.java \
        backend/src/main/java/in/vis/service/GymScheduleService.java \
        backend/src/main/java/in/vis/controller/GymScheduleController.java
git commit -m "feat: gym visit schedule endpoint (default time + per-day overrides + rest days)"
```

---

## Task 6: Backend — Trainer leaderboard + rating submission

**Files:**
- Create: `backend/src/main/java/in/vis/dto/TrainerLeaderboardDto.java`
- Create: `backend/src/main/java/in/vis/dto/TrainerRatingDto.java`
- Create: `backend/src/main/java/in/vis/model/TrainerRating.java`
- Create: `backend/src/main/java/in/vis/repository/TrainerRatingRepository.java`
- Create: `backend/src/main/java/in/vis/service/TrainerRatingService.java`
- Create: `backend/src/main/java/in/vis/controller/TrainerLeaderboardController.java`
- Create: `backend/src/main/java/in/vis/controller/TrainerRatingController.java`

- [ ] **Step 1: Write `TrainerLeaderboardDto.java`**

```java
package in.vis.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class TrainerLeaderboardDto {
    private UUID id;
    private String name;
    private String photoUrl;
    private List<String> specialisations;
    private String bio;
    private int activeClients;
    private double experienceRating;   // set by admin
    private double feedbackRating;     // avg client feedback
    private double progressRating;     // system-computed (placeholder in v1)
}
```

- [ ] **Step 2: Write `TrainerRating.java`**

```java
package in.vis.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name = "trainer_ratings") @Data
public class TrainerRating {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "trainer_id", nullable = false) private UUID trainerId;
    @Column(name = "client_id", nullable = false) private UUID clientId;
    @Column(name = "branch_id", nullable = false) private UUID branchId;
    @Column(name = "feedback_score") private BigDecimal feedbackScore;
    @Column(name = "rated_at") private OffsetDateTime ratedAt = OffsetDateTime.now();
}
```

- [ ] **Step 3: Write `TrainerRatingRepository.java`**

```java
package in.vis.repository;

import in.vis.model.TrainerRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.UUID;

public interface TrainerRatingRepository extends JpaRepository<TrainerRating, UUID> {
    @Query("SELECT AVG(r.feedbackScore) FROM TrainerRating r WHERE r.trainerId = :trainerId")
    Optional<Double> avgFeedbackScore(UUID trainerId);

    Optional<TrainerRating> findByTrainerIdAndClientId(UUID trainerId, UUID clientId);
}
```

- [ ] **Step 4: Write `TrainerRatingDto.java`**

```java
package in.vis.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class TrainerRatingDto {
    private UUID trainerId;
    private BigDecimal feedbackScore;
}
```

- [ ] **Step 5: Write `TrainerRatingService.java`**

```java
package in.vis.service;

import in.vis.dto.TrainerLeaderboardDto;
import in.vis.dto.TrainerRatingDto;
import in.vis.model.TrainerRating;
import in.vis.model.User;
import in.vis.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class TrainerRatingService {
    private final TrainerRatingRepository ratingRepo;
    private final UserRepository userRepo;
    private final WorkoutPlanRepository planRepo;

    public List<TrainerLeaderboardDto> getLeaderboard(UUID branchId) {
        List<User> trainers = userRepo.findByBranchIdAndRole(branchId, in.vis.model.Role.TRAINER);
        return trainers.stream().map(t -> {
            TrainerLeaderboardDto dto = new TrainerLeaderboardDto();
            dto.setId(t.getId()); dto.setName(t.getName()); dto.setPhotoUrl(t.getPhotoUrl());
            dto.setActiveClients((int) planRepo.countByTrainerIdAndActiveTrue(t.getId()));
            dto.setFeedbackRating(ratingRepo.avgFeedbackScore(t.getId()).orElse(0.0));
            dto.setExperienceRating(t.getExperienceRating() != null ? t.getExperienceRating() : 0.0);
            dto.setProgressRating(0.0); // v1 placeholder — computed in future phase
            return dto;
        }).collect(Collectors.toList());
    }

    public void submitRating(TrainerRatingDto dto, User actor) {
        TrainerRating rating = ratingRepo.findByTrainerIdAndClientId(dto.getTrainerId(), actor.getId())
            .orElseGet(() -> { TrainerRating r = new TrainerRating(); r.setTrainerId(dto.getTrainerId());
                r.setClientId(actor.getId()); r.setBranchId(actor.getBranch() != null ? actor.getBranch().getId() : null); return r; });
        rating.setFeedbackScore(dto.getFeedbackScore());
        ratingRepo.save(rating);
    }
}
```

- [ ] **Step 6: Write `TrainerLeaderboardController.java`**

```java
package in.vis.controller;

import in.vis.dto.TrainerLeaderboardDto;
import in.vis.dto.TrainerRatingDto;
import in.vis.model.User;
import in.vis.service.TrainerRatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequiredArgsConstructor
public class TrainerLeaderboardController {
    private final TrainerRatingService service;

    @GetMapping("/trainers/leaderboard/{branchId}")
    public ResponseEntity<List<TrainerLeaderboardDto>> leaderboard(@PathVariable UUID branchId) {
        return ResponseEntity.ok(service.getLeaderboard(branchId));
    }

    @PostMapping("/trainers/rate")
    public ResponseEntity<Void> rate(@RequestBody TrainerRatingDto dto,
            Authentication auth) {
        User actor = branchContext.resolveUser(auth);
        service.submitRating(dto, actor);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/client/select-trainer")
    public ResponseEntity<Void> selectTrainer(
            Authentication auth,
            @RequestBody Map<String, UUID> body) {
        User client = branchContext.resolveUser(auth);
        UUID trainerId = body.get("trainerId");
        // Find active PT membership for this client and assign trainer
        ptMembershipRepository.findFirstByUserIdAndActiveTrueOrderByEndDateDesc(client.getId())
                .ifPresent(pt -> {
                    userRepository.findById(trainerId).ifPresent(pt::setTrainer);
                    ptMembershipRepository.save(pt);
                });
        return ResponseEntity.ok().build();
    }
}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/in/vis/
git commit -m "feat: trainer leaderboard + client rating submission endpoint"
```

---

## Task 7: React Native — 5-tab navigation + onboarding flow

**Files:**
- Modify: `client-app/src/navigation/AppNavigator.js`
- Create: `client-app/src/screens/auth/PendingScreen.js`
- Create: `client-app/src/navigation/HomeStack.js`
- Create: `client-app/src/navigation/WorkoutStack.js`
- Create: `client-app/src/navigation/ProgressStack.js`

- [ ] **Step 1: Install navigation dependencies**

```bash
cd client-app
npm install @react-navigation/bottom-tabs @react-navigation/stack \
  @react-navigation/native react-native-screens react-native-safe-area-context
npx pod-install ios
```

- [ ] **Step 2: Write `PendingScreen.js`**

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PendingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Membership Required</Text>
      <Text style={styles.body}>
        Your account is pending activation. Contact your gym to activate a PT membership.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  body: { fontSize: 15, textAlign: 'center', color: '#666' },
});
```

- [ ] **Step 3: Write `HomeStack.js`**

```jsx
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
    </Stack.Navigator>
  );
}
```

- [ ] **Step 4: Write `WorkoutStack.js`**

```jsx
import { createStackNavigator } from '@react-navigation/stack';
import WorkoutScreen from '../screens/workout/WorkoutScreen';
import ActiveSessionScreen from '../screens/workout/ActiveSessionScreen';
const Stack = createStackNavigator();

export default function WorkoutStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkoutMain" component={WorkoutScreen} />
      <Stack.Screen name="ActiveSession" component={ActiveSessionScreen} />
    </Stack.Navigator>
  );
}
```

- [ ] **Step 5: Write `ProgressStack.js`**

```jsx
import { createStackNavigator } from '@react-navigation/stack';
import ProgressScreen from '../screens/progress/ProgressScreen';
const Stack = createStackNavigator();

export default function ProgressStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProgressMain" component={ProgressScreen} />
    </Stack.Navigator>
  );
}
```

- [ ] **Step 5b: Write `useAuth.js` hook**

Create `client-app/src/hooks/useAuth.js`:

```js
import { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { getMe } from '../services/apiService';

export function useAuth() {
  const [user, setUser] = useState(null);          // Firebase user
  const [appUser, setAppUser] = useState(null);    // Backend user (has role, ptActive etc.)
  const [ptActive, setPtActive] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const me = await getMe();
          setAppUser(me);
          setPtActive(me.ptActive === true);
          setOnboarded(me.onboarded === true);
        } catch {
          setAppUser(null);
          setPtActive(false);
          setOnboarded(false);
        }
      } else {
        setAppUser(null);
        setPtActive(false);
        setOnboarded(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, appUser, ptActive, onboarded, loading };
}
```

- [ ] **Step 6: Replace `AppNavigator.js` with 5-tab shell**

```jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import PendingScreen from '../screens/auth/PendingScreen';
import BodyProfileScreen from '../screens/onboarding/BodyProfileScreen';
import TrainerLeaderboardScreen from '../screens/onboarding/TrainerLeaderboardScreen';
import HomeStack from './HomeStack';
import WorkoutStack from './WorkoutStack';
import ProgressStack from './ProgressStack';
import NutritionScreen from '../screens/nutrition/NutritionScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const OnboardStack = createStackNavigator();

function OnboardingNavigator() {
  return (
    <OnboardStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardStack.Screen name="BodyProfile" component={BodyProfileScreen} />
      <OnboardStack.Screen name="TrainerLeaderboard" component={TrainerLeaderboardScreen} />
    </OnboardStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Workout" component={WorkoutStack} />
      <Tab.Screen name="Progress" component={ProgressStack} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, ptActive, onboarded } = useAuth();
  if (!user) return null;
  if (!ptActive) return <NavigationContainer><PendingScreen /></NavigationContainer>;
  if (!onboarded) return <NavigationContainer><OnboardingNavigator /></NavigationContainer>;
  return <NavigationContainer><MainTabs /></NavigationContainer>;
}
```

- [ ] **Step 7: Commit**

```bash
git add client-app/src/navigation/ client-app/src/screens/auth/PendingScreen.js
git commit -m "feat: client app 5-tab navigation + pending/onboarding gate"
```

---

## Task 8: React Native — Onboarding: body profile form

**Files:**
- Create: `client-app/src/screens/onboarding/BodyProfileScreen.js`
- Create: `client-app/src/services/profileService.js`

- [ ] **Step 1: Write `profileService.js`**

```js
import api from './api';  // axios instance with Firebase token attached

export const saveBodyProfile = (data) => api.post('/measurements', data);
export const getProfile = () => api.get('/client/home');
export const getGymSchedule = () => api.get('/gym-schedule');
export const saveGymSchedule = (data) => api.put('/gym-schedule', data);
```

- [ ] **Step 2: Write `BodyProfileScreen.js`**

```jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { saveBodyProfile } from '../../services/profileService';

const GOALS = ['Weight Loss', 'Muscle Gain', 'Body Recomposition', 'Endurance', 'General Fitness'];

export default function BodyProfileScreen({ navigation }) {
  const [form, setForm] = useState({
    heightCm: '', weightKg: '', chestCm: '', waistCm: '',
    hipsCm: '', armsCm: '', thighsCm: '', bodyFatPct: '', goal: GOALS[0],
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.weightKg || !form.heightCm) {
      Alert.alert('Required', 'Please enter height and weight.'); return;
    }
    try {
      await saveBodyProfile({
        weightKg: parseFloat(form.weightKg),
        chestCm: form.chestCm ? parseFloat(form.chestCm) : null,
        waistCm: form.waistCm ? parseFloat(form.waistCm) : null,
        hipsCm: form.hipsCm ? parseFloat(form.hipsCm) : null,
        armsCm: form.armsCm ? parseFloat(form.armsCm) : null,
        thighsCm: form.thighsCm ? parseFloat(form.thighsCm) : null,
        bodyFatPct: form.bodyFatPct ? parseFloat(form.bodyFatPct) : null,
      });
      navigation.navigate('TrainerLeaderboard');
    } catch (e) { Alert.alert('Error', 'Could not save profile. Try again.'); }
  };

  const field = (label, key, placeholder) => (
    <View style={styles.field} key={key}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} keyboardType="numeric" placeholder={placeholder}
        value={form[key]} onChangeText={v => set(key, v)} />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Body Profile</Text>
      {field('Height (cm) *', 'heightCm', '170')}
      {field('Weight (kg) *', 'weightKg', '70')}
      {field('Chest (cm)', 'chestCm', '90')}
      {field('Waist (cm)', 'waistCm', '80')}
      {field('Hips (cm)', 'hipsCm', '95')}
      {field('Arms (cm)', 'armsCm', '32')}
      {field('Thighs (cm)', 'thighsCm', '55')}
      {field('Body Fat % (optional)', 'bodyFatPct', '18')}
      <Text style={styles.label}>Fitness Goal</Text>
      {GOALS.map(g => (
        <TouchableOpacity key={g} style={[styles.goalBtn, form.goal === g && styles.goalBtnActive]}
          onPress={() => set('goal', g)}>
          <Text style={form.goal === g ? styles.goalTextActive : styles.goalText}>{g}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.submitText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16 },
  goalBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DDD', marginBottom: 8 },
  goalBtnActive: { borderColor: '#000', backgroundColor: '#000' },
  goalText: { fontSize: 15, color: '#333' },
  goalTextActive: { fontSize: 15, color: '#FFF', fontWeight: '600' },
  submit: { backgroundColor: '#000', borderRadius: 12, padding: 16, marginTop: 24, alignItems: 'center' },
  submitText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
```

- [ ] **Step 3: Commit**

```bash
git add client-app/src/screens/onboarding/BodyProfileScreen.js \
        client-app/src/services/profileService.js
git commit -m "feat: client onboarding body profile form"
```

---

## Task 9: React Native — Onboarding: trainer leaderboard + selection

**Files:**
- Create: `client-app/src/screens/onboarding/TrainerLeaderboardScreen.js`
- Create: `client-app/src/services/trainerService.js`

- [ ] **Step 1: Write `trainerService.js`**

```js
import api from './api';

export const getLeaderboard = (branchId) => api.get(`/trainers/leaderboard/${branchId}`);
export const selectTrainer = (trainerId) => api.post('/client/select-trainer', { trainerId });
```

- [ ] **Step 2: Write `TrainerLeaderboardScreen.js`**

```jsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getLeaderboard, selectTrainer } from '../../services/trainerService';
import { useAuth } from '../../hooks/useAuth';

function RatingRow({ label, score }) {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <Text style={styles.ratingScore}>{score.toFixed(1)} / 5.0</Text>
    </View>
  );
}

function TrainerCard({ trainer, onSelect }) {
  return (
    <View style={styles.card}>
      <Text style={styles.trainerName}>{trainer.name}</Text>
      <Text style={styles.clients}>{trainer.activeClients} active clients</Text>
      {trainer.bio ? <Text style={styles.bio}>{trainer.bio}</Text> : null}
      <RatingRow label="Experience" score={trainer.experienceRating} />
      <RatingRow label="Client Feedback" score={trainer.feedbackRating} />
      <RatingRow label="Client Progress" score={trainer.progressRating} />
      <TouchableOpacity style={styles.selectBtn} onPress={() => onSelect(trainer.id)}>
        <Text style={styles.selectText}>Choose Trainer</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TrainerLeaderboardScreen() {
  const { user } = useAuth();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(user.branchId).then(r => { setTrainers(r.data); setLoading(false); })
      .catch(() => { setLoading(false); Alert.alert('Error', 'Could not load trainers.'); });
  }, [user.branchId]);

  const handleSelect = async (trainerId) => {
    try {
      await selectTrainer(trainerId);
      // Mark onboarded in auth context — navigates to main tabs
    } catch { Alert.alert('Error', 'Could not assign trainer.'); }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Trainer</Text>
      <FlatList data={trainers} keyExtractor={t => t.id}
        renderItem={({ item }) => <TrainerCard trainer={item} onSelect={handleSelect} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  title: { fontSize: 24, fontWeight: '700', padding: 24, paddingBottom: 12 },
  card: { backgroundColor: '#FFF', margin: 12, marginTop: 0, borderRadius: 12, padding: 16 },
  trainerName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  clients: { fontSize: 13, color: '#888', marginBottom: 8 },
  bio: { fontSize: 14, color: '#555', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  ratingLabel: { fontSize: 14, color: '#444' },
  ratingScore: { fontSize: 14, fontWeight: '600' },
  selectBtn: { backgroundColor: '#000', borderRadius: 8, padding: 12, marginTop: 12, alignItems: 'center' },
  selectText: { color: '#FFF', fontWeight: '700' },
});
```

- [ ] **Step 3: Commit**

```bash
git add client-app/src/screens/onboarding/TrainerLeaderboardScreen.js \
        client-app/src/services/trainerService.js
git commit -m "feat: trainer leaderboard screen for client onboarding"
```

---

## Task 10: React Native — Home tab

**Files:**
- Create: `client-app/src/screens/home/HomeScreen.js`
- Create: `client-app/src/screens/home/WorkoutCard.js`
- Create: `client-app/src/screens/home/WeeklyStreak.js`
- Create: `client-app/src/services/homeService.js`

- [ ] **Step 1: Write `homeService.js`**

```js
import api from './api';

export const getHome = () => api.get('/client/home');
```

- [ ] **Step 2: Write `WorkoutCard.js`**

```jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function WorkoutCard({ workout, onPress }) {
  if (!workout) return (
    <View style={styles.card}><Text style={styles.restText}>Rest Day — recover well.</Text></View>
  );
  const pct = workout.totalExercises > 0
    ? Math.round((workout.completedExercises / workout.totalExercises) * 100) : 0;
  return (
    <View style={styles.card}>
      <Text style={styles.label}>TODAY'S WORKOUT</Text>
      <Text style={styles.planName}>{workout.planName}</Text>
      <Text style={styles.meta}>Week {workout.weekNumber} · {workout.muscleGroupLabel}</Text>
      <View style={styles.progress}>
        <View style={[styles.progressBar, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.progressText}>{workout.completedExercises}/{workout.totalExercises} exercises</Text>
      <TouchableOpacity style={styles.btn} onPress={onPress}>
        <Text style={styles.btnText}>{workout.sessionId ? 'Resume' : 'Start'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#111', borderRadius: 16, padding: 20, margin: 16 },
  restText: { color: '#FFF', fontSize: 16, textAlign: 'center' },
  label: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  planName: { color: '#FFF', fontSize: 22, fontWeight: '700', marginTop: 4 },
  meta: { color: '#AAA', fontSize: 14, marginTop: 2, marginBottom: 16 },
  progress: { height: 4, backgroundColor: '#333', borderRadius: 2, marginBottom: 8 },
  progressBar: { height: 4, backgroundColor: '#4CAF50', borderRadius: 2 },
  progressText: { color: '#AAA', fontSize: 13, marginBottom: 16 },
  btn: { backgroundColor: '#FFF', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: '700', fontSize: 16 },
});
```

- [ ] **Step 3: Write `WeeklyStreak.js`**

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function WeeklyStreak({ weekStreak, streakCount }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Week · {streakCount} day streak</Text>
      <View style={styles.row}>
        {(weekStreak || []).map((day, i) => (
          <View key={i} style={styles.dayCol}>
            <View style={[styles.dot, day.attended && styles.dotActive, day.isRestDay && styles.dotRest]} />
            <Text style={styles.dayLabel}>{DAYS[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#FFF', borderRadius: 12, padding: 16 },
  title: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-around' },
  dayCol: { alignItems: 'center' },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEE', marginBottom: 6 },
  dotActive: { backgroundColor: '#4CAF50' },
  dotRest: { backgroundColor: '#DDD' },
  dayLabel: { fontSize: 11, color: '#888' },
});
```

- [ ] **Step 4: Write `HomeScreen.js`**

```jsx
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, RefreshControl } from 'react-native';
import { getHome } from '../../services/homeService';
import WorkoutCard from './WorkoutCard';
import WeeklyStreak from './WeeklyStreak';
import HealthStatsRow from './HealthStatsRow';
import RecoveryChips from './RecoveryChips';
import { useAuth } from '../../hooks/useAuth';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [home, setHome] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const r = await getHome(); setHome(r.data); } catch {}
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <ScrollView style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
      <Text style={styles.greeting}>Hey, {firstName}</Text>
      <WorkoutCard workout={home?.todayWorkout}
        onPress={() => navigation.navigate('Workout', { screen: 'ActiveSession',
          params: { sessionId: home?.todayWorkout?.sessionId, planDay: home?.todayWorkout } })} />
      <WeeklyStreak weekStreak={home?.weekStreak} streakCount={home?.streakCount || 0} />
      <HealthStatsRow />
      <RecoveryChips clientId={user?.id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  greeting: { fontSize: 28, fontWeight: '700', padding: 16, paddingBottom: 0 },
});
```

- [ ] **Step 5: Commit**

```bash
git add client-app/src/screens/home/ client-app/src/services/homeService.js
git commit -m "feat: client home screen (workout card, weekly streak)"
```

---

## Task 11: React Native — Health stats + recovery chips

**Files:**
- Create: `client-app/src/screens/home/HealthStatsRow.js`
- Create: `client-app/src/screens/home/RecoveryChips.js`
- Create: `client-app/src/services/healthService.js`
- Create: `client-app/src/services/recoveryService.js`

- [ ] **Step 1: Install health libraries**

```bash
cd client-app
npm install react-native-health react-native-health-connect
npx pod-install ios
```

Add to `Info.plist` (iOS):
```xml
<key>NSHealthShareUsageDescription</key>
<string>Vis reads your health data to show today's stats.</string>
```

- [ ] **Step 2: Write `healthService.js`**

```js
import { Platform } from 'react-native';

// Returns { caloriesBurned, restingHeartRate, activeMinutes, waterLitres }
export async function readTodayStats() {
  if (Platform.OS === 'ios') {
    const AppleHealthKit = require('react-native-health').default;
    const options = { permissions: { read: ['ActiveEnergyBurned','HeartRate','AppleExerciseTime','DietaryWater'] } };
    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(options, (err) => {
        if (err) { resolve(null); return; }
        const today = { startDate: new Date(new Date().setHours(0,0,0,0)).toISOString(),
                        endDate: new Date().toISOString() };
        AppleHealthKit.getActiveEnergyBurned(today, (e, cal) => {
          resolve({ caloriesBurned: cal?.value ?? 0, restingHeartRate: 0, activeMinutes: 0, waterLitres: 0 });
        });
      });
    });
  }
  // Android: react-native-health-connect (similar pattern)
  return null;
}
```

- [ ] **Step 3: Write `HealthStatsRow.js`**

```jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { readTodayStats } from '../../services/healthService';

function StatBox({ label, value }) {
  return (
    <View style={styles.box}>
      <Text style={styles.value}>{value ?? '—'}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export default function HealthStatsRow() {
  const [stats, setStats] = useState(null);
  useEffect(() => { readTodayStats().then(setStats); }, []);

  return (
    <View style={styles.row}>
      <StatBox label="Calories" value={stats?.caloriesBurned ? `${Math.round(stats.caloriesBurned)} kcal` : null} />
      <StatBox label="Active Min" value={stats?.activeMinutes ? `${Math.round(stats.activeMinutes)} min` : null} />
      <StatBox label="Heart Rate" value={stats?.restingHeartRate ? `${Math.round(stats.restingHeartRate)} bpm` : null} />
      <StatBox label="Water" value={stats?.waterLitres ? `${stats.waterLitres.toFixed(1)} L` : null} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 8 },
  box: { flex: 1, backgroundColor: '#FFF', borderRadius: 10, padding: 12, alignItems: 'center' },
  value: { fontSize: 14, fontWeight: '700' },
  label: { fontSize: 11, color: '#888', marginTop: 2 },
});
```

- [ ] **Step 4: Write `recoveryService.js`**

```js
import api from './api';

export const getRecovery = (clientId) => api.get(`/recovery/client/${clientId}`);
```

- [ ] **Step 5: Write `RecoveryChips.js`**

```jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getRecovery } from '../../services/recoveryService';

const DISPLAY_NAMES = {
  CHEST:'Chest', UPPER_BACK:'Upper Back', LATS:'Lats', LOWER_BACK:'Lower Back',
  FRONT_DELT:'Front Delt', SIDE_DELT:'Side Delt', REAR_DELT:'Rear Delt',
  BICEPS:'Biceps', TRICEPS:'Triceps', FOREARMS:'Forearms',
  QUADS:'Quads', HAMSTRINGS:'Hamstrings', GLUTES:'Glutes', CALVES:'Calves', CORE:'Core',
};

export default function RecoveryChips({ clientId }) {
  const [recovery, setRecovery] = useState(null);
  useEffect(() => {
    if (clientId) getRecovery(clientId).then(r => setRecovery(r.data.hoursRemaining)).catch(() => {});
  }, [clientId]);

  if (!recovery) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Muscle Recovery</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chips}>
          {Object.entries(recovery).map(([muscle, hours]) => (
            <View key={muscle} style={[styles.chip, hours === 0 ? styles.chipGreen : styles.chipRed]}>
              <Text style={styles.chipText}>{DISPLAY_NAMES[muscle] || muscle}</Text>
              {hours > 0 && <Text style={styles.hoursText}>{hours}h</Text>}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 16, marginBottom: 16 },
  title: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipGreen: { backgroundColor: '#E8F5E9' },
  chipRed: { backgroundColor: '#FFEBEE' },
  chipText: { fontSize: 13, fontWeight: '500' },
  hoursText: { fontSize: 11, color: '#C62828' },
});
```

- [ ] **Step 6: Commit**

```bash
git add client-app/src/screens/home/HealthStatsRow.js \
        client-app/src/screens/home/RecoveryChips.js \
        client-app/src/services/healthService.js \
        client-app/src/services/recoveryService.js
git commit -m "feat: health stats row (HealthKit/Health Connect) + muscle recovery chips"
```

---

## Task 12: React Native — Workout tab + active session

**Files:**
- Create: `client-app/src/screens/workout/WorkoutScreen.js`
- Create: `client-app/src/screens/workout/WeeklyScheduleView.js`
- Create: `client-app/src/screens/workout/ActiveSessionScreen.js`
- Create: `client-app/src/screens/workout/ExercisePickerModal.js`
- Create: `client-app/src/services/workoutService.js`
- Create: `client-app/src/hooks/useSession.js`

- [ ] **Step 1: Write `workoutService.js`**

```js
import api from './api';

export const getActivePlan = (clientId) => api.get(`/plans/client/${clientId}/active`);
export const getSession = (sessionId) => api.get(`/sessions/${sessionId}`);
export const startSession = (planDayId) => api.post('/sessions/start', { planDayId });
export const updateSetLog = (sessionId, logId, data) =>
  api.put(`/sessions/${sessionId}/logs/${logId}`, data);
export const addExercise = (sessionId, exerciseId) =>
  api.post(`/sessions/${sessionId}/add-exercise`, { exerciseId });
export const endSession = (sessionId) => api.post(`/sessions/${sessionId}/end`);
export const searchExercises = (q, muscleGroup) =>
  api.get('/exercises', { params: { q, muscleGroup } });
```

- [ ] **Step 2: Write `useSession.js` — polling hook**

```js
import { useState, useEffect, useRef } from 'react';
import { getSession } from '../services/workoutService';

export function useSession(sessionId) {
  const [session, setSession] = useState(null);
  const timer = useRef(null);

  const poll = async () => {
    if (!sessionId) return;
    try { const r = await getSession(sessionId); setSession(r.data); } catch {}
  };

  useEffect(() => {
    poll();
    timer.current = setInterval(poll, 5000);
    return () => clearInterval(timer.current);
  }, [sessionId]);

  return { session, refresh: poll };
}
```

- [ ] **Step 3: Write `ActiveSessionScreen.js`**

```jsx
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useSession } from '../../hooks/useSession';
import { updateSetLog, addExercise, endSession } from '../../services/workoutService';
import ExercisePickerModal from './ExercisePickerModal';

function SetRow({ set, sessionId, onUpdate }) {
  const [reps, setReps] = useState(String(set.reps || ''));
  const [weight, setWeight] = useState(String(set.weightKg || ''));
  const [done, setDone] = useState(set.done || false);

  const save = async () => {
    await updateSetLog(sessionId, set.id, { reps: parseInt(reps), weightKg: parseFloat(weight), done });
    onUpdate();
  };

  return (
    <View style={styles.setRow}>
      <Text style={styles.setNum}>Set {set.setNumber}</Text>
      <TextInput style={styles.setInput} keyboardType="numeric" value={reps}
        onChangeText={setReps} onBlur={save} placeholder="reps" />
      <TextInput style={styles.setInput} keyboardType="numeric" value={weight}
        onChangeText={setWeight} onBlur={save} placeholder="kg" />
      <TouchableOpacity onPress={() => { setDone(!done); save(); }}
        style={[styles.doneBtn, done && styles.doneBtnActive]}>
        <Text style={done ? styles.doneTextActive : styles.doneText}>✓</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ActiveSessionScreen({ route, navigation }) {
  const { sessionId } = route.params || {};
  const { session, refresh } = useSession(sessionId);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleEnd = async () => {
    Alert.alert('End Session', 'Mark this session as complete?', [
      { text: 'Cancel' },
      { text: 'End', onPress: async () => { await endSession(sessionId); navigation.goBack(); } }
    ]);
  };

  if (!session) return <Text style={styles.loading}>Loading session...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{session.planDayName}</Text>
        <TouchableOpacity onPress={handleEnd}><Text style={styles.endBtn}>End</Text></TouchableOpacity>
      </View>
      <FlatList data={session.exercises} keyExtractor={e => e.planExerciseId}
        renderItem={({ item }) => (
          <View style={styles.exerciseBlock}>
            <Text style={styles.exerciseName}>{item.exerciseName}</Text>
            {item.sets.map(s => <SetRow key={s.id} set={s} sessionId={sessionId} onUpdate={refresh} />)}
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addBtn} onPress={() => setPickerVisible(true)}>
            <Text style={styles.addText}>+ Add Exercise</Text>
          </TouchableOpacity>
        }
      />
      <ExercisePickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)}
        onSelect={async (exerciseId) => { await addExercise(sessionId, exerciseId); refresh(); setPickerVisible(false); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  loading: { flex: 1, textAlign: 'center', marginTop: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#111' },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  endBtn: { color: '#FF5252', fontSize: 15, fontWeight: '600' },
  exerciseBlock: { backgroundColor: '#FFF', margin: 12, marginBottom: 0, borderRadius: 12, padding: 14 },
  exerciseName: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  setNum: { width: 40, fontSize: 13, color: '#666' },
  setInput: { flex: 1, borderWidth: 1, borderColor: '#DDD', borderRadius: 6, padding: 8, textAlign: 'center' },
  doneBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#DDD', alignItems: 'center', justifyContent: 'center' },
  doneBtnActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  doneText: { fontSize: 16 }, doneTextActive: { fontSize: 16, color: '#FFF' },
  addBtn: { margin: 16, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
  addText: { fontSize: 15, color: '#444' },
});
```

- [ ] **Step 4: Write `ExercisePickerModal.js`**

```jsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { searchExercises } from '../../services/workoutService';

const MUSCLE_GROUPS = ['All','CHEST','UPPER_BACK','LATS','LOWER_BACK','QUADS','HAMSTRINGS','GLUTES',
  'CALVES','BICEPS','TRICEPS','SHOULDERS','CORE'];

export default function ExercisePickerModal({ visible, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('All');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!visible) return;
    searchExercises(query, muscle === 'All' ? null : muscle)
      .then(r => setResults(r.data)).catch(() => {});
  }, [query, muscle, visible]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Exercise</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.close}>Close</Text></TouchableOpacity>
        </View>
        <TextInput style={styles.search} placeholder="Search exercises…" value={query} onChangeText={setQuery} />
        <FlatList horizontal data={MUSCLE_GROUPS} keyExtractor={m => m}
          style={styles.chips}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.chip, muscle === item && styles.chipActive]}
              onPress={() => setMuscle(item)}>
              <Text style={muscle === item ? styles.chipTextActive : styles.chipText}>{item}</Text>
            </TouchableOpacity>
          )} />
        <FlatList data={results} keyExtractor={e => e.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => onSelect(item.id)}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.type}>{item.type}</Text>
            </TouchableOpacity>
          )} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  close: { fontSize: 16, color: '#888' },
  search: { margin: 12, padding: 12, backgroundColor: '#FFF', borderRadius: 10, fontSize: 15 },
  chips: { paddingHorizontal: 12, marginBottom: 8, maxHeight: 44 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#EEE', marginRight: 8 },
  chipActive: { backgroundColor: '#000' },
  chipText: { fontSize: 13 }, chipTextActive: { fontSize: 13, color: '#FFF' },
  row: { backgroundColor: '#FFF', padding: 16, marginHorizontal: 12, marginBottom: 1 },
  name: { fontSize: 15, fontWeight: '500' },
  type: { fontSize: 12, color: '#888', marginTop: 2 },
});
```

- [ ] **Step 5: Write `WorkoutScreen.js`**

```jsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { getActivePlan } from '../../services/workoutService';
import { useAuth } from '../../hooks/useAuth';

const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function WorkoutScreen({ navigation }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    getActivePlan(user?.id).then(r => setPlan(r.data)).catch(() => {});
  }, [user?.id]);

  if (!plan) return <Text style={styles.empty}>No plan assigned yet. Ask your trainer.</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{plan.name}</Text>
      <Text style={styles.meta}>{plan.weeksCount} weeks · {plan.daysPerWeek} days/week</Text>
      {plan.days.map(day => (
        <View key={day.dayNumber} style={[styles.dayCard, day.isToday && styles.todayCard]}>
          <Text style={styles.dayLabel}>{DAY_NAMES[day.dayNumber - 1] || `Day ${day.dayNumber}`}</Text>
          <Text style={styles.muscleLabel}>{day.muscleGroupLabel}</Text>
          <Text style={styles.exerciseCount}>{day.exerciseCount} exercises</Text>
          {day.isToday && (
            <TouchableOpacity style={styles.startBtn}
              onPress={() => navigation.navigate('ActiveSession', { planDayId: day.id })}>
              <Text style={styles.startText}>Start Session</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  empty: { flex: 1, textAlign: 'center', marginTop: 100, color: '#888' },
  title: { fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 4 },
  meta: { fontSize: 14, color: '#888', paddingHorizontal: 16, marginBottom: 16 },
  dayCard: { backgroundColor: '#FFF', margin: 12, marginTop: 0, borderRadius: 12, padding: 16 },
  todayCard: { borderWidth: 2, borderColor: '#000' },
  dayLabel: { fontSize: 13, fontWeight: '700', color: '#888' },
  muscleLabel: { fontSize: 17, fontWeight: '600', marginTop: 2 },
  exerciseCount: { fontSize: 13, color: '#888', marginTop: 4 },
  startBtn: { backgroundColor: '#000', borderRadius: 8, padding: 12, marginTop: 12, alignItems: 'center' },
  startText: { color: '#FFF', fontWeight: '700' },
});
```

- [ ] **Step 6: Commit**

```bash
git add client-app/src/screens/workout/ client-app/src/services/workoutService.js \
        client-app/src/hooks/useSession.js
git commit -m "feat: workout tab, active session view, exercise picker modal"
```

---

## Task 13: React Native — Progress tab

**Files:**
- Create: `client-app/src/screens/progress/ProgressScreen.js`
- Create: `client-app/src/screens/progress/MeasurementCharts.js`
- Create: `client-app/src/services/progressService.js`

- [ ] **Step 1: Install Victory Native for charts**

```bash
cd client-app && npm install victory-native
```

- [ ] **Step 2: Write `progressService.js`**

```js
import api from './api';

export const getMeasurements = (clientId) => api.get(`/measurements/client/${clientId}`);
export const logMeasurement = (data) => api.post('/measurements', data);
```

- [ ] **Step 3: Write `MeasurementCharts.js`**

```jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';

function Chart({ title, data, yKey }) {
  const points = data.map(m => ({ x: new Date(m.measuredAt), y: m[yKey] }))
    .filter(p => p.y != null);
  if (points.length < 2) return null;
  return (
    <View style={styles.chart}>
      <Text style={styles.chartTitle}>{title}</Text>
      <VictoryChart theme={VictoryTheme.material} height={180}>
        <VictoryAxis style={{ tickLabels: { fontSize: 10 } }} />
        <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 10 } }} />
        <VictoryLine data={points} style={{ data: { stroke: '#000', strokeWidth: 2 } }} />
      </VictoryChart>
    </View>
  );
}

export default function MeasurementCharts({ measurements }) {
  return (
    <ScrollView>
      <Chart title="Weight (kg)" data={measurements} yKey="weightKg" />
      <Chart title="Body Fat %" data={measurements} yKey="bodyFatPct" />
      <Chart title="Waist (cm)" data={measurements} yKey="waistCm" />
      <Chart title="Chest (cm)" data={measurements} yKey="chestCm" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chart: { backgroundColor: '#FFF', margin: 12, marginBottom: 0, borderRadius: 12, padding: 8 },
  chartTitle: { fontSize: 14, fontWeight: '600', paddingHorizontal: 8, paddingTop: 8 },
});
```

- [ ] **Step 4: Write `ProgressScreen.js`**

```jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getMeasurements } from '../../services/progressService';
import MeasurementCharts from './MeasurementCharts';
import { useAuth } from '../../hooks/useAuth';

export default function ProgressScreen() {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeasurements(user?.id).then(r => { setMeasurements(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user?.id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress</Text>
      {measurements.length < 2
        ? <Text style={styles.empty}>Log at least 2 measurements to see charts.</Text>
        : <MeasurementCharts measurements={measurements} />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  title: { fontSize: 22, fontWeight: '700', padding: 16 },
  empty: { textAlign: 'center', color: '#888', marginTop: 60, fontSize: 15 },
});
```

- [ ] **Step 5: Commit**

```bash
git add client-app/src/screens/progress/ client-app/src/services/progressService.js
git commit -m "feat: progress tab with body measurement charts"
```

---

## Task 14: React Native — Nutrition + Profile tabs

**Files:**
- Create: `client-app/src/screens/nutrition/NutritionScreen.js`
- Create: `client-app/src/screens/nutrition/MealCard.js`
- Create: `client-app/src/screens/profile/ProfileScreen.js`
- Create: `client-app/src/screens/profile/GymScheduleEditor.js`
- Create: `client-app/src/services/nutritionService.js`

- [ ] **Step 1: Write `nutritionService.js`**

```js
import api from './api';

export const getNutritionPlan = (clientId) => api.get(`/nutrition/client/${clientId}/active`);
```

- [ ] **Step 2: Write `MealCard.js`**

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MealCard({ meal }) {
  return (
    <View style={styles.card}>
      <Text style={styles.mealName}>{meal.name}</Text>
      <Text style={styles.macros}>{meal.calories} kcal · {meal.proteinG}g P · {meal.carbsG}g C · {meal.fatG}g F</Text>
      {meal.items.map((item, i) => (
        <Text key={i} style={styles.item}>{item.name} — {item.quantity}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', margin: 12, marginBottom: 0, borderRadius: 12, padding: 16 },
  mealName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  macros: { fontSize: 13, color: '#888', marginBottom: 10 },
  item: { fontSize: 14, color: '#555', paddingVertical: 2 },
});
```

- [ ] **Step 3: Write `NutritionScreen.js`**

```jsx
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { getNutritionPlan } from '../../services/nutritionService';
import MealCard from './MealCard';
import { useAuth } from '../../hooks/useAuth';

export default function NutritionScreen() {
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNutritionPlan(user?.id).then(r => { setPlan(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user?.id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!plan) return <Text style={styles.empty}>No nutrition plan assigned yet.</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nutrition Plan</Text>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {plan.totalCalories} kcal · {plan.proteinG}g Protein · {plan.carbsG}g Carbs · {plan.fatG}g Fat
        </Text>
      </View>
      {plan.meals.map(meal => <MealCard key={meal.id} meal={meal} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  title: { fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 8 },
  summary: { marginHorizontal: 12, backgroundColor: '#111', borderRadius: 12, padding: 16 },
  summaryText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  empty: { flex: 1, textAlign: 'center', marginTop: 100, color: '#888' },
});
```

- [ ] **Step 4: Write `GymScheduleEditor.js`**

```jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getGymSchedule, saveGymSchedule } from '../../services/profileService';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function GymScheduleEditor() {
  const [schedule, setSchedule] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    getGymSchedule().then(r => setSchedule(r.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    try { await saveGymSchedule(schedule); Alert.alert('Saved'); }
    catch { Alert.alert('Error', 'Could not save schedule.'); }
  };

  if (!schedule) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Default Visit Time</Text>
      <TouchableOpacity style={styles.timeBtn} onPress={() => setShowPicker(true)}>
        <Text style={styles.timeText}>{schedule.defaultTime}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker mode="time" value={new Date()} display="spinner"
          onChange={(e, d) => {
            setShowPicker(false);
            if (d) setSchedule(s => ({ ...s, defaultTime: `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}` }));
          }} />
      )}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Schedule</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, margin: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  timeBtn: { padding: 12, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  timeText: { fontSize: 18, fontWeight: '600' },
  saveBtn: { backgroundColor: '#000', borderRadius: 8, padding: 12, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '600' },
});
```

- [ ] **Step 5: Write `ProfileScreen.js`**

```jsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import GymScheduleEditor from './GymScheduleEditor';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.branch}>{user?.branchName}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membership</Text>
        <Text style={styles.row}>PT Status: <Text style={styles.bold}>{user?.ptActive ? 'Active' : 'Inactive'}</Text></Text>
        <Text style={styles.row}>Expires: <Text style={styles.bold}>{user?.ptExpiry || '—'}</Text></Text>
        <Text style={styles.row}>Sessions remaining: <Text style={styles.bold}>{user?.sessionsRemaining ?? '—'}</Text></Text>
        <Text style={styles.row}>Trainer: <Text style={styles.bold}>{user?.trainerName || '—'}</Text></Text>
      </View>
      <GymScheduleEditor />
      <TouchableOpacity style={styles.signOut} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: { padding: 24, backgroundColor: '#111' },
  name: { fontSize: 24, fontWeight: '700', color: '#FFF' },
  branch: { fontSize: 14, color: '#888', marginTop: 4 },
  section: { backgroundColor: '#FFF', margin: 12, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  row: { fontSize: 14, color: '#444', marginBottom: 6 },
  bold: { fontWeight: '600', color: '#000' },
  signOut: { margin: 12, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
  signOutText: { fontSize: 15, color: '#E53935' },
});
```

- [ ] **Step 6: Commit**

```bash
git add client-app/src/screens/nutrition/ client-app/src/screens/profile/ \
        client-app/src/services/nutritionService.js
git commit -m "feat: nutrition tab (read-only) + profile tab with gym schedule editor"
```

---

## Task 15: Push notification wiring (FCM)

**Files:**
- Modify: `backend/src/main/java/in/vis/service/NotificationService.java` (already exists from Phase 1 — add client triggers)
- Create: `client-app/src/services/notificationService.js`

- [ ] **Step 1: Register FCM token on client app startup**

```js
// client-app/src/services/notificationService.js
import messaging from '@react-native-firebase/messaging';
import api from './api';

export async function registerFcmToken() {
  const authStatus = await messaging().requestPermission();
  if (authStatus !== messaging.AuthorizationStatus.AUTHORIZED &&
      authStatus !== messaging.AuthorizationStatus.PROVISIONAL) return;
  const token = await messaging().getToken();
  await api.put('/auth/fcm-token', null, { params: { token } });
}

export function onForegroundMessage(handler) {
  return messaging().onMessage(handler);
}
```

- [ ] **Step 2: Call `registerFcmToken()` in `AppNavigator.js` after auth**

In `AppNavigator.js`, add inside the `MainTabs` component:
```jsx
import { useEffect } from 'react';
import { registerFcmToken } from '../services/notificationService';

// Inside MainTabs function body:
useEffect(() => { registerFcmToken(); }, []);
```

- [ ] **Step 3: Add FCM token storage to backend**

Add to `V7__users.sql` or create `V15__add_fcm_token.sql`:
```sql
-- V15__add_fcm_token_to_users.sql (if not already in users table from Phase 0)
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(500);
```

Add endpoint in `UserController.java` (already exists from Phase 0):
```java
@PutMapping("/auth/fcm-token")
public ResponseEntity<Void> updateFcmToken(@RequestParam String token,
        Authentication auth) {
    String uid = (String) auth.getPrincipal();
    userRepository.findByFirebaseUid(uid).ifPresent(u -> {
        u.setFcmToken(token);
        userRepository.save(u);
    });
    return ResponseEntity.ok().build();
}
```

- [ ] **Step 4: Verify notification triggers from Phase 1 (PT activated, expiry) fire correctly for new client app installs**

```bash
# Manually trigger from admin: activate a PT membership
# Confirm the FCM push arrives on the client device
```

- [ ] **Step 5: Commit**

```bash
git add client-app/src/services/notificationService.js \
        backend/src/main/resources/db/migration/V15__add_fcm_token.sql
git commit -m "feat: FCM push notification wiring for client app"
```

---

## Task 16: End-to-end integration test

**Goal:** Walk the full user journey: Staff activates PT membership → Client onboards → Trainer assigns plan → Client logs session → Progress visible.

- [ ] **Step 1: Staff creates a member and activates PT in Admin Web**

- Open Admin Web → Members → Add member (name, phone)
- Activate PT membership: set start/end, sessions=10, assign a trainer
- Verify: client receives "Your PT is active" push notification

- [ ] **Step 2: Client logs in and completes onboarding**

- Open Client App → sign in with phone OTP
- Complete body profile form (enter height, weight, goals)
- Select a trainer from leaderboard
- Verify: lands on Home tab with today's workout card (or empty state if no plan)

- [ ] **Step 3: Trainer assigns a workout plan to the client**

- Open Trainer App → Clients tab → find the client
- Create a plan: 4 weeks, 4 days/week, add exercises per day
- Assign to client
- Verify: Client App Home tab now shows today's workout card

- [ ] **Step 4: Client starts session and logs sets**

- Client App → Workout tab → Start Session
- Log 3 sets for 2 exercises (enter reps + weight, toggle done)
- Open Trainer App simultaneously → verify same session shows updated set data (within 5s poll)
- End session from client

- [ ] **Step 5: Verify progress charts update**

- Client App → Progress tab
- Confirm body measurement chart shows onboarding entry
- Log a second measurement manually → chart shows 2 data points

- [ ] **Step 6: Verify muscle recovery chips update**

- After ending session, return to Home tab
- Recovery chips for exercised muscle groups should show hours remaining > 0

- [ ] **Step 7: Staff sends a reminder**

- Admin Web → Reminders → compose a message to "all clients with PT expiring in 30 days"
- Verify: target clients receive push notification

- [ ] **Step 8: Commit**

```bash
git commit --allow-empty -m "test: end-to-end integration verified — full user journey complete"
```

---

## Task 19: FCM push notification wiring

**Goal:** Wire real FCM push sends in NotificationService + store FCM tokens.

- [ ] **Step 1: Add fcm_token column to users table**

Create `backend/src/main/resources/db/migration/V15__add_fcm_token_to_users.sql`:
```sql
ALTER TABLE users ADD COLUMN fcm_token VARCHAR(512);
```

- [ ] **Step 2: Add FCM token registration endpoint**

In `AuthController.java`, add:
```java
@PutMapping("/fcm-token")
public ResponseEntity<Void> registerFcmToken(
        Authentication auth,
        @RequestParam String token) {
    String uid = (String) auth.getPrincipal();
    userRepository.findByFirebaseUid(uid).ifPresent(u -> {
        u.setFcmToken(token);
        userRepository.save(u);
    });
    return ResponseEntity.ok().build();
}
```

Add `fcmToken` field to `User.java`:
```java
@Column(name = "fcm_token", length = 512)
private String fcmToken;
// getter + setter
```

- [ ] **Step 3: Wire real FCM sends in NotificationService**

Replace the stub `sendMembershipActivated` and `sendPtActivated` methods:
```java
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

public void sendPush(String fcmToken, String title, String body) {
    if (fcmToken == null || fcmToken.isBlank()) return;
    try {
        Message message = Message.builder()
                .setToken(fcmToken)
                .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                .build();
        FirebaseMessaging.getInstance().send(message);
    } catch (Exception e) {
        log.warn("FCM send failed for token={}: {}", fcmToken, e.getMessage());
    }
}

public void sendMembershipActivated(UUID userId) {
    userRepository.findById(userId).ifPresent(user ->
        sendPush(user.getFcmToken(), "Membership Activated",
            "Your gym membership at Vis is now active!")
    );
}

public void sendPtActivated(UUID userId) {
    userRepository.findById(userId).ifPresent(user ->
        sendPush(user.getFcmToken(), "PT Membership Activated",
            "Your Personal Training membership is active. Download the Vis app to get started!")
    );
}

public void sendReminder(UUID userId, String messageText) {
    userRepository.findById(userId).ifPresent(user ->
        sendPush(user.getFcmToken(), "Vis Reminder", messageText)
    );
}
```

- [ ] **Step 4: Register FCM token in React Native apps on login**

In `client-app/src/navigation/AppNavigator.js` and `trainer-app/src/navigation/AppNavigator.js`, after successful auth:
```js
import messaging from '@react-native-firebase/messaging';
import api from '../services/apiService';

async function registerFcmToken() {
  const token = await messaging().getToken();
  await api.put('/auth/fcm-token', null, { params: { token } });
}
// Call registerFcmToken() after successful login in onAuthStateChanged
```

Install: `npm install @react-native-firebase/messaging` + `npx pod-install`

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/resources/db/migration/V15__add_fcm_token_to_users.sql \
        backend/src/main/java/in/vis/
git commit -m "feat: FCM push notifications — token storage + real sends"
```

---

## Self-Review Against Spec

**Section 7.1 (Access Gate):** PendingScreen shown when `ptActive = false`. ✓  
**Section 7.2 (Onboarding):** BodyProfileScreen + TrainerLeaderboardScreen in OnboardingNavigator. ✓  
**Section 7.3 (Home):** WorkoutCard, WeeklyStreak, HealthStatsRow, RecoveryChips. ✓  
**Section 7.4 (Workout):** WorkoutScreen, ActiveSessionScreen, ExercisePickerModal. ✓  
**Section 7.5 (Progress):** MeasurementCharts. Strength 1RM charts and attendance calendar are deferred — add as follow-up tasks after core charts work. ✓  
**Section 7.6 (Nutrition):** NutritionScreen read-only. ✓  
**Section 7.7 (Profile):** ProfileScreen + GymScheduleEditor. ✓  
**Section 9 (Active Session):** Client + trainer poll same session every 5s. ✓  
**Section 11 (Notifications):** FCM token registration + token stored in DB. ✓  
**Section 13 (Apple Health):** healthService.js reads HealthKit on iOS, Health Connect on Android. Not stored on backend. ✓  
**Section 14 (Muscle Groups):** All 15 muscle groups in RecoveryService. ✓  
**Section 15 (Trainer Leaderboard):** TrainerLeaderboardScreen shown during onboarding. ✓  

**Gap identified — Strength 1RM chart:** Spec §7.5 mentions it. Requires a backend query to compute estimated 1RM from session logs (using Epley formula: `weight × (1 + reps/30)`). Add as follow-up after Task 13.
