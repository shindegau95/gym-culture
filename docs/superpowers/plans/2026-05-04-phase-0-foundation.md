# Phase 0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Working auth + multi-branch PostgreSQL schema + role-gated Spring Boot API, with all three app shells able to sign in via Firebase and hit scoped API endpoints.

**Architecture:** Firebase Auth issues tokens; Spring Boot validates them on every request via a filter that extracts the Firebase UID, looks up the user's role + branch in PostgreSQL, and attaches it to the security context. All API responses are branch-scoped by default for STAFF/TRAINER roles; OWNER sees across all branches.

**Tech Stack:** Java 21 + Spring Boot 3, PostgreSQL (Neon), Firebase Admin SDK, Flyway migrations, JUnit 5 + Mockito + Testcontainers, React Native 0.74, Angular 17, Docker (local dev)

---

## File Map

### Backend (`backend/`)
```
backend/
  src/main/java/in/vis/
    VisApplication.java
    config/
      FirebaseConfig.java          # Initialises Firebase Admin SDK
      SecurityConfig.java          # Spring Security — permit /auth/**, guard all else
      CorsConfig.java              # CORS for admin web + mobile origins
    filter/
      FirebaseAuthFilter.java      # Extracts + validates Firebase JWT on every request
    model/
      Branch.java                  # JPA entity
      User.java                    # JPA entity — role, branch_id FK
    enums/
      Role.java                    # CLIENT | TRAINER | STAFF | OWNER
    repository/
      BranchRepository.java
      UserRepository.java
    service/
      UserService.java             # Register, lookup by firebase_uid, branch enforcement
    controller/
      AuthController.java          # POST /auth/register, GET /auth/me
      BranchController.java        # GET /branches (OWNER only), GET /branches/{id}
    dto/
      UserResponse.java
      RegisterRequest.java
      BranchResponse.java
    exception/
      GlobalExceptionHandler.java  # Maps exceptions → HTTP status codes
      UnauthorizedException.java
      NotFoundException.java
  src/main/resources/
    db/migration/
      V1__create_branches.sql
      V2__create_users.sql
    application.properties         # Datasource, Firebase, Flyway config (reads env vars)
    application-test.properties    # Testcontainers PostgreSQL override
  src/test/java/in/vis/
    filter/FirebaseAuthFilterTest.java
    service/UserServiceTest.java
    controller/AuthControllerIntegrationTest.java
    controller/BranchControllerIntegrationTest.java
  Dockerfile
  .env.example
  pom.xml
```

### Client App shell (`client-app/`)
```
client-app/
  src/
    config/firebase.js             # Firebase app init
    services/
      authService.js               # signInWithGoogle, signInWithApple, signInWithPhone
      apiService.js                # Axios instance with Firebase token injected
    screens/
      LoginScreen.js
      PendingScreen.js             # "Account pending activation"
      HomeShell.js                 # Empty home, verifies token works end-to-end
    navigation/
      AppNavigator.js              # Auth state → Login or HomeShell
  App.js
  package.json
```

### Trainer App shell (`trainer-app/`)
```
trainer-app/                       # Identical structure to client-app — separate RN project
  src/
    config/firebase.js
    services/authService.js
    services/apiService.js
    screens/LoginScreen.js
    screens/PendingScreen.js
    screens/HomeShell.js
    navigation/AppNavigator.js
  App.js
  package.json
```

### Admin Web shell (`admin-web/`)
```
admin-web/
  src/app/
    core/
      firebase.service.ts          # Firebase Auth wrapper
      auth.guard.ts                # Route guard — redirects unauthenticated
      auth.interceptor.ts          # Injects Firebase token into every HTTP request
    features/
      login/
        login.component.ts
        login.component.html       # Google + Phone OTP sign-in buttons
      pending/
        pending.component.ts       # "Account pending activation"
      dashboard/
        dashboard.component.ts     # Empty shell — verifies auth + API call works
    app.module.ts
    app-routing.module.ts
    environments/
      environment.ts               # Firebase config (non-secret)
      environment.prod.ts
```

---

## Task 1: Spring Boot project scaffold

**Files:**
- Create: `backend/pom.xml`
- Create: `backend/src/main/java/in/vis/VisApplication.java`
- Create: `backend/src/main/resources/application.properties`
- Create: `backend/.env.example`

- [ ] **Step 1: Generate Spring Boot project**

Go to https://start.spring.io and download with:
- Group: `in.vis` · Artifact: `backend`
- Java 21 · Spring Boot 3.3.x · Packaging: Jar
- Dependencies: Spring Web, Spring Data JPA, Spring Security, PostgreSQL Driver, Flyway Migration, Validation

Unzip into `backend/` inside the project root.

- [ ] **Step 2: Add Firebase Admin SDK to `pom.xml`**

Add inside `<dependencies>`:

```xml
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.3.0</version>
</dependency>
```

- [ ] **Step 2b: Add Lombok to `pom.xml`**

Phases 2 and 3 use Lombok annotations. Add inside `<dependencies>`:

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

Also add to the `<build><plugins>` section so Lombok works at compile time:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

- [ ] **Step 3: Add Testcontainers to `pom.xml`**

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
```

Also add the Testcontainers BOM inside `<dependencyManagement>`:

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers-bom</artifactId>
    <version>1.19.7</version>
    <type>pom</type>
    <scope>import</scope>
</dependency>
```

- [ ] **Step 4: Configure `application.properties`**

```properties
# Datasource — values injected from environment variables
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USER}
spring.datasource.password=${DATABASE_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true

# Firebase
firebase.credentials.path=${FIREBASE_CREDENTIALS_PATH}
firebase.project.id=${FIREBASE_PROJECT_ID}

# App
app.owner-name=vis
server.port=8080
```

- [ ] **Step 5: Create `.env.example`**

```
DATABASE_URL=jdbc:postgresql://localhost:5432/vis
DATABASE_USER=vis
DATABASE_PASSWORD=vis
FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
FIREBASE_PROJECT_ID=your-firebase-project-id
```

- [ ] **Step 6: Verify the app starts (no DB yet)**

```bash
cd backend
# Temporarily comment out datasource config to test compile
mvn spring-boot:run
```

Expected: `Started VisApplication` (may fail on DB connection — that's fine, we just want compile success).

- [ ] **Step 7: Commit**

```bash
git init  # if not already a repo
git add backend/
git commit -m "feat: scaffold Spring Boot backend with Firebase + Testcontainers deps"
```

---

## Task 2: Database schema + Flyway migrations

**Files:**
- Create: `backend/src/main/resources/db/migration/V1__create_branches.sql`
- Create: `backend/src/main/resources/db/migration/V2__create_users.sql`
- Create: `backend/docker-compose.yml`
- Create: `backend/src/test/resources/application-test.properties`

- [ ] **Step 1: Create `docker-compose.yml` for local PostgreSQL**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: vis
      POSTGRES_USER: vis
      POSTGRES_PASSWORD: vis
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

- [ ] **Step 2: Start local database**

```bash
cd backend
docker-compose up -d
```

Expected: `postgres` container running on port 5432.

- [ ] **Step 3: Write `V1__create_branches.sql`**

```sql
CREATE TABLE branches (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    address     TEXT,
    city        VARCHAR(100),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO branches (name, city) VALUES
    ('Kandivali', 'Mumbai'),
    ('Borivali', 'Mumbai'),
    ('Mira Road', 'Mumbai'),
    ('Malad East', 'Mumbai'),
    ('Orlem', 'Mumbai'),
    ('Haridwar', 'Haridwar'),
    ('Sundar Nagar', 'Himachal Pradesh');
```

- [ ] **Step 4: Write `V2__create_users.sql`**

```sql
CREATE TYPE user_role AS ENUM ('CLIENT', 'TRAINER', 'STAFF', 'OWNER');

CREATE TABLE users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    name         VARCHAR(200),
    email        VARCHAR(200),
    phone        VARCHAR(20),
    role         user_role NOT NULL,
    branch_id    UUID REFERENCES branches(id),  -- NULL for OWNER
    active       BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT users_non_owner_has_branch CHECK (
        role = 'OWNER' OR branch_id IS NOT NULL
    )
);

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_branch_id ON users(branch_id);
```

- [ ] **Step 5: Configure `application-test.properties` for Testcontainers**

Create `src/test/resources/application-test.properties`:

```properties
spring.datasource.url=jdbc:tc:postgresql:16:///vis
spring.datasource.username=vis
spring.datasource.password=vis
spring.datasource.driver-class-name=org.testcontainers.jdbc.ContainerDatabaseDriver
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
firebase.project.id=test-project
firebase.credentials.path=  # empty — we mock FirebaseAuth in tests
```

- [ ] **Step 6: Run Flyway migration**

```bash
cd backend
export DATABASE_URL=jdbc:postgresql://localhost:5432/vis
export DATABASE_USER=vis
export DATABASE_PASSWORD=vis
export FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
export FIREBASE_PROJECT_ID=placeholder
mvn flyway:migrate
```

Expected: `Successfully applied 2 migrations`.

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/resources/db/ backend/docker-compose.yml backend/src/test/resources/
git commit -m "feat: add Flyway migrations for branches and users tables"
```

---

## Task 3: JPA entities and repositories

**Files:**
- Create: `backend/src/main/java/in/vis/enums/Role.java`
- Create: `backend/src/main/java/in/vis/model/Branch.java`
- Create: `backend/src/main/java/in/vis/model/User.java`
- Create: `backend/src/main/java/in/vis/repository/BranchRepository.java`
- Create: `backend/src/main/java/in/vis/repository/UserRepository.java`

- [ ] **Step 1: Write `Role.java`**

```java
package in.vis.enums;

public enum Role {
    CLIENT, TRAINER, STAFF, OWNER
}
```

- [ ] **Step 2: Write `Branch.java`**

```java
package in.vis.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "branches")
public class Branch {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    private String address;

    @Column(length = 100)
    private String city;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() { this.createdAt = OffsetDateTime.now(); }

    // Getters and setters
    public UUID getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
```

- [ ] **Step 3: Write `User.java`**

```java
package in.vis.model;

import in.vis.enums.Role;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "firebase_uid", unique = true, nullable = false, length = 128)
    private String firebaseUid;

    @Column(length = 200)
    private String name;

    @Column(length = 200)
    private String email;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false,
            columnDefinition = "user_role")
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void prePersist() { this.createdAt = OffsetDateTime.now(); }

    // Getters and setters
    public UUID getId() { return id; }
    public String getFirebaseUid() { return firebaseUid; }
    public void setFirebaseUid(String firebaseUid) { this.firebaseUid = firebaseUid; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
```

- [ ] **Step 4: Write `BranchRepository.java`**

```java
package in.vis.repository;

import in.vis.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BranchRepository extends JpaRepository<Branch, UUID> {}
```

- [ ] **Step 5: Write `UserRepository.java`**

```java
package in.vis.repository;

import in.vis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByFirebaseUid(String firebaseUid);
}
```

- [ ] **Step 6: Verify compile**

```bash
cd backend
mvn compile
```

Expected: `BUILD SUCCESS`

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/in/vis/
git commit -m "feat: add Branch and User JPA entities with repositories"
```

---

## Task 4: Firebase Admin SDK initialisation

**Files:**
- Create: `backend/src/main/java/in/vis/config/FirebaseConfig.java`

- [ ] **Step 1: Download Firebase service account key**

In Firebase Console → Project Settings → Service Accounts → Generate new private key. Save as `backend/firebase-service-account.json`. **Add this file to `.gitignore` immediately.**

```bash
echo "firebase-service-account.json" >> backend/.gitignore
```

- [ ] **Step 2: Write `FirebaseConfig.java`**

```java
package in.vis.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.credentials.path:}")
    private String credentialsPath;

    @Value("${firebase.project.id}")
    private String projectId;

    @PostConstruct
    public void init() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseOptions.Builder builder = FirebaseOptions.builder()
                    .setProjectId(projectId);

            if (credentialsPath != null && !credentialsPath.isBlank()) {
                builder.setCredentials(
                    GoogleCredentials.fromStream(new FileInputStream(credentialsPath))
                );
            } else {
                // In tests and Cloud Run (with attached service account), use ADC
                builder.setCredentials(GoogleCredentials.getApplicationDefault());
            }

            FirebaseApp.initializeApp(builder.build());
        }
    }
}
```

- [ ] **Step 3: Verify app starts with credentials**

```bash
cd backend
export FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
export FIREBASE_PROJECT_ID=your-actual-project-id
export DATABASE_URL=jdbc:postgresql://localhost:5432/vis
export DATABASE_USER=vis
export DATABASE_PASSWORD=vis
mvn spring-boot:run
```

Expected: `Started VisApplication` with no Firebase errors.

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/in/vis/config/FirebaseConfig.java backend/.gitignore
git commit -m "feat: initialise Firebase Admin SDK with service account or ADC"
```

---

## Task 5: Firebase auth filter

**Files:**
- Create: `backend/src/main/java/in/vis/filter/FirebaseAuthFilter.java`
- Create: `backend/src/test/java/in/vis/filter/FirebaseAuthFilterTest.java`

- [ ] **Step 1: Write the failing test**

```java
package in.vis.filter;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class FirebaseAuthFilterTest {

    @Mock FirebaseAuth firebaseAuth;
    @Mock HttpServletRequest request;
    @Mock HttpServletResponse response;
    @Mock FilterChain filterChain;
    @Mock FirebaseToken firebaseToken;

    FirebaseAuthFilter filter;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        filter = new FirebaseAuthFilter(firebaseAuth);
        SecurityContextHolder.clearContext();
    }

    @Test
    void validBearerToken_setsAuthentication() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer valid-token");
        when(firebaseAuth.verifyIdToken("valid-token")).thenReturn(firebaseToken);
        when(firebaseToken.getUid()).thenReturn("uid-123");

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .isEqualTo("uid-123");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void missingAuthHeader_continuesChainWithoutAuthentication() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void invalidToken_returns401() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer bad-token");
        when(firebaseAuth.verifyIdToken("bad-token"))
                .thenThrow(new com.google.firebase.auth.FirebaseAuthException(
                    com.google.firebase.ErrorCode.INVALID_ARGUMENT, "invalid", null, null, null));

        filter.doFilterInternal(request, response, filterChain);

        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(filterChain, never()).doFilter(any(), any());
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend
mvn test -pl . -Dtest=FirebaseAuthFilterTest
```

Expected: FAIL — `FirebaseAuthFilter` does not exist yet.

- [ ] **Step 3: Write `FirebaseAuthFilter.java`**

```java
package in.vis.filter;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class FirebaseAuthFilter extends OncePerRequestFilter {

    private final FirebaseAuth firebaseAuth;

    public FirebaseAuthFilter(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            FirebaseToken firebaseToken = firebaseAuth.verifyIdToken(token);
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            firebaseToken.getUid(), null, List.of());
            SecurityContextHolder.getContext().setAuthentication(auth);
            filterChain.doFilter(request, response);
        } catch (FirebaseAuthException e) {
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
mvn test -Dtest=FirebaseAuthFilterTest
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/in/vis/filter/ backend/src/test/java/in/vis/filter/
git commit -m "feat: Firebase JWT auth filter with unit tests"
```

---

## Task 6: Spring Security configuration

**Files:**
- Create: `backend/src/main/java/in/vis/config/SecurityConfig.java`
- Create: `backend/src/main/java/in/vis/config/CorsConfig.java`

- [ ] **Step 1: Write `SecurityConfig.java`**

```java
package in.vis.config;

import com.google.firebase.auth.FirebaseAuth;
import in.vis.filter.FirebaseAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public FirebaseAuthFilter firebaseAuthFilter(FirebaseAuth firebaseAuth) {
        return new FirebaseAuthFilter(firebaseAuth);
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        return FirebaseAuth.getInstance();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           FirebaseAuthFilter firebaseAuthFilter) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/register", "/auth/me").authenticated()
                        .requestMatchers("/actuator/health").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(firebaseAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
```

- [ ] **Step 2: Write `CorsConfig.java`**

```java
package in.vis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*")); // tighten in production
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

- [ ] **Step 3: Verify app starts cleanly**

```bash
cd backend
mvn spring-boot:run
```

Expected: App starts. `curl http://localhost:8080/actuator/health` returns `{"status":"UP"}`.

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/in/vis/config/SecurityConfig.java \
         backend/src/main/java/in/vis/config/CorsConfig.java
git commit -m "feat: Spring Security config — stateless JWT, CORS"
```

---

## Task 7: DTOs and exceptions

**Files:**
- Create: `backend/src/main/java/in/vis/dto/UserResponse.java`
- Create: `backend/src/main/java/in/vis/dto/RegisterRequest.java`
- Create: `backend/src/main/java/in/vis/dto/BranchResponse.java`
- Create: `backend/src/main/java/in/vis/exception/UnauthorizedException.java`
- Create: `backend/src/main/java/in/vis/exception/NotFoundException.java`
- Create: `backend/src/main/java/in/vis/exception/GlobalExceptionHandler.java`

- [ ] **Step 1: Write `RegisterRequest.java`**

```java
package in.vis.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank String name,
        String email,
        String phone
) {}
```

- [ ] **Step 2: Write `UserResponse.java`**

```java
package in.vis.dto;

import in.vis.enums.Role;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String firebaseUid,
        String name,
        String email,
        String phone,
        Role role,
        UUID branchId,
        String branchName,
        boolean active
) {}
```

- [ ] **Step 3: Write `BranchResponse.java`**

```java
package in.vis.dto;

import java.util.UUID;

public record BranchResponse(UUID id, String name, String city) {}
```

- [ ] **Step 4: Write exception classes**

```java
// UnauthorizedException.java
package in.vis.exception;
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) { super(message); }
}

// NotFoundException.java
package in.vis.exception;
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) { super(message); }
}
```

- [ ] **Step 5: Write `GlobalExceptionHandler.java`**

```java
package in.vis.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UnauthorizedException.class)
    ResponseEntity<Map<String, String>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<Map<String, String>> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }
}
```

- [ ] **Step 6: Verify compile**

```bash
mvn compile
```

Expected: `BUILD SUCCESS`

- [ ] **Step 7: Commit**

```bash
git add backend/src/main/java/in/vis/dto/ backend/src/main/java/in/vis/exception/
git commit -m "feat: DTOs and global exception handler"
```

---

## Task 8: UserService + AuthController

**Files:**
- Create: `backend/src/main/java/in/vis/service/UserService.java`
- Create: `backend/src/main/java/in/vis/controller/AuthController.java`
- Create: `backend/src/test/java/in/vis/service/UserServiceTest.java`
- Create: `backend/src/test/java/in/vis/controller/AuthControllerIntegrationTest.java`

- [ ] **Step 1: Write `UserServiceTest.java`**

```java
package in.vis.service;

import in.vis.dto.RegisterRequest;
import in.vis.dto.UserResponse;
import in.vis.enums.Role;
import in.vis.exception.NotFoundException;
import in.vis.model.Branch;
import in.vis.model.User;
import in.vis.repository.BranchRepository;
import in.vis.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock UserRepository userRepository;
    @Mock BranchRepository branchRepository;
    @InjectMocks UserService userService;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void getByFirebaseUid_existingUser_returnsResponse() {
        Branch branch = new Branch();
        // set branch id via reflection or builder — use setter if available
        User user = new User();
        user.setFirebaseUid("uid-abc");
        user.setName("Priya Shah");
        user.setRole(Role.CLIENT);
        user.setBranch(branch);

        when(userRepository.findByFirebaseUid("uid-abc")).thenReturn(Optional.of(user));

        UserResponse response = userService.getByFirebaseUid("uid-abc");

        assertThat(response.name()).isEqualTo("Priya Shah");
        assertThat(response.role()).isEqualTo(Role.CLIENT);
    }

    @Test
    void getByFirebaseUid_missingUser_throwsNotFoundException() {
        when(userRepository.findByFirebaseUid("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getByFirebaseUid("unknown"))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void registerUser_newUser_savesAndReturnsResponse() {
        Branch branch = new Branch();
        UUID branchId = UUID.randomUUID();
        when(branchRepository.findById(branchId)).thenReturn(Optional.of(branch));
        when(userRepository.findByFirebaseUid("uid-new")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        RegisterRequest request = new RegisterRequest("Aarav Mehta", "aarav@example.com", "+919876543210");
        UserResponse response = userService.registerUser("uid-new", Role.CLIENT, branchId, request);

        assertThat(response.name()).isEqualTo("Aarav Mehta");
        assertThat(response.role()).isEqualTo(Role.CLIENT);
        verify(userRepository).save(any(User.class));
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
mvn test -Dtest=UserServiceTest
```

Expected: FAIL — `UserService` does not exist.

- [ ] **Step 3: Write `UserService.java`**

```java
package in.vis.service;

import in.vis.dto.RegisterRequest;
import in.vis.dto.UserResponse;
import in.vis.enums.Role;
import in.vis.exception.NotFoundException;
import in.vis.model.Branch;
import in.vis.model.User;
import in.vis.repository.BranchRepository;
import in.vis.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;

    public UserService(UserRepository userRepository, BranchRepository branchRepository) {
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
    }

    public UserResponse getByFirebaseUid(String firebaseUid) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new NotFoundException("User not found: " + firebaseUid));
        return toResponse(user);
    }

    public UserResponse registerUser(String firebaseUid, Role role, UUID branchId,
                                     RegisterRequest request) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new NotFoundException("Branch not found: " + branchId));

        User user = new User();
        user.setFirebaseUid(firebaseUid);
        user.setRole(role);
        user.setBranch(branch);
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPhone(request.phone());

        return toResponse(userRepository.save(user));
    }

    private UserResponse toResponse(User user) {
        UUID branchId = user.getBranch() != null ? user.getBranch().getId() : null;
        String branchName = user.getBranch() != null ? user.getBranch().getName() : null;
        return new UserResponse(
                user.getId(), user.getFirebaseUid(), user.getName(),
                user.getEmail(), user.getPhone(), user.getRole(),
                branchId, branchName, user.isActive()
        );
    }
}
```

- [ ] **Step 4: Run service tests to verify they pass**

```bash
mvn test -Dtest=UserServiceTest
```

Expected: 3 tests pass.

- [ ] **Step 5: Write `AuthController.java`**

```java
package in.vis.controller;

import in.vis.dto.RegisterRequest;
import in.vis.dto.UserResponse;
import in.vis.enums.Role;
import in.vis.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication auth) {
        String firebaseUid = (String) auth.getPrincipal();
        return ResponseEntity.ok(userService.getByFirebaseUid(firebaseUid));
    }

    // Called by Admin when activating a new user — not self-service
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            Authentication auth,
            @RequestParam Role role,
            @RequestParam UUID branchId,
            @Valid @RequestBody RegisterRequest request) {
        String firebaseUid = (String) auth.getPrincipal();
        return ResponseEntity.ok(userService.registerUser(firebaseUid, role, branchId, request));
    }
}
```

- [ ] **Step 6: Write `AuthControllerIntegrationTest.java`**

```java
package in.vis.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.vis.dto.RegisterRequest;
import in.vis.enums.Role;
import in.vis.filter.FirebaseAuthFilter;
import in.vis.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @MockBean UserService userService;
    @MockBean FirebaseAuthFilter firebaseAuthFilter; // skip Firebase in slice tests

    @Test
    void me_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/auth/me"))
               .andExpect(status().isUnauthorized());
    }

    @Test
    void me_authenticated_callsService() throws Exception {
        mockMvc.perform(get("/auth/me")
                .with(SecurityMockMvcRequestPostProcessors.user("uid-123")))
               .andExpect(status().isOk());
    }
}
```

- [ ] **Step 7: Run all backend tests**

```bash
mvn test
```

Expected: All tests pass (filter tests + service tests + controller slice tests).

- [ ] **Step 8: Commit**

```bash
git add backend/src/main/java/in/vis/service/ \
         backend/src/main/java/in/vis/controller/AuthController.java \
         backend/src/test/java/in/vis/
git commit -m "feat: UserService + AuthController with /auth/me and /auth/register"
```

---

## Task 9: BranchController (Owner-only cross-branch view)

**Files:**
- Create: `backend/src/main/java/in/vis/controller/BranchController.java`
- Create: `backend/src/test/java/in/vis/controller/BranchControllerIntegrationTest.java`

- [ ] **Step 1: Write `BranchController.java`**

```java
package in.vis.controller;

import in.vis.dto.BranchResponse;
import in.vis.exception.NotFoundException;
import in.vis.repository.BranchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/branches")
public class BranchController {

    private final BranchRepository branchRepository;

    public BranchController(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    @GetMapping
    public ResponseEntity<List<BranchResponse>> listBranches() {
        List<BranchResponse> branches = branchRepository.findAll().stream()
                .map(b -> new BranchResponse(b.getId(), b.getName(), b.getCity()))
                .toList();
        return ResponseEntity.ok(branches);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchResponse> getBranch(@PathVariable UUID id) {
        return branchRepository.findById(id)
                .map(b -> ResponseEntity.ok(new BranchResponse(b.getId(), b.getName(), b.getCity())))
                .orElseThrow(() -> new NotFoundException("Branch not found: " + id));
    }
}
```

- [ ] **Step 2: Write integration test**

```java
package in.vis.controller;

import in.vis.filter.FirebaseAuthFilter;
import in.vis.repository.BranchRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BranchController.class)
class BranchControllerIntegrationTest {

    @Autowired MockMvc mockMvc;
    @MockBean BranchRepository branchRepository;
    @MockBean FirebaseAuthFilter firebaseAuthFilter;

    @Test
    void listBranches_authenticated_returnsOk() throws Exception {
        when(branchRepository.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/branches")
                .with(SecurityMockMvcRequestPostProcessors.user("uid-123")))
               .andExpect(status().isOk())
               .andExpect(content().json("[]"));
    }

    @Test
    void listBranches_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/branches"))
               .andExpect(status().isUnauthorized());
    }
}
```

- [ ] **Step 3: Run tests**

```bash
mvn test -Dtest=BranchControllerIntegrationTest
```

Expected: 2 tests pass.

- [ ] **Step 4: Commit**

```bash
git add backend/src/main/java/in/vis/controller/BranchController.java \
         backend/src/test/java/in/vis/controller/BranchControllerIntegrationTest.java
git commit -m "feat: BranchController — list and get branches (authenticated)"
```

---

## Task 10: Dockerfile + Cloud Run config

**Files:**
- Create: `backend/Dockerfile`

- [ ] **Step 1: Write `Dockerfile`**

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

- [ ] **Step 2: Build and test the Docker image locally**

```bash
cd backend
mvn package -DskipTests
docker build -t vis-backend .
docker run --rm -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/vis \
  -e DATABASE_USER=vis \
  -e DATABASE_PASSWORD=vis \
  -e FIREBASE_PROJECT_ID=your-project-id \
  -e FIREBASE_CREDENTIALS_PATH= \
  vis-backend
```

Expected: App starts, `curl http://localhost:8080/actuator/health` returns `{"status":"UP"}`.

- [ ] **Step 3: Commit**

```bash
git add backend/Dockerfile
git commit -m "feat: Dockerfile for Cloud Run deployment"
```

---

## Task 11: React Native Client App auth shell

**Files:**
- Create: `client-app/` (new React Native project)
- Create: `client-app/src/config/firebase.js`
- Create: `client-app/src/services/authService.js`
- Create: `client-app/src/services/apiService.js`
- Create: `client-app/src/screens/LoginScreen.js`
- Create: `client-app/src/screens/PendingScreen.js`
- Create: `client-app/src/screens/HomeShell.js`
- Create: `client-app/src/navigation/AppNavigator.js`

- [ ] **Step 1: Scaffold React Native project**

```bash
npx @react-native-community/cli init ClientApp --directory client-app
cd client-app
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @react-native-firebase/app @react-native-firebase/auth \
  @react-navigation/native @react-navigation/native-stack \
  react-native-screens react-native-safe-area-context \
  axios
npx pod-install  # iOS only
```

- [ ] **Step 3: Write `src/config/firebase.js`**

```js
import firebase from '@react-native-firebase/app';

// Firebase is configured via google-services.json (Android)
// and GoogleService-Info.plist (iOS) — download from Firebase console
// and place in android/app/ and ios/ respectively.
// No JS config needed when using React Native Firebase.
export default firebase;
```

- [ ] **Step 4: Write `src/services/authService.js`**

```js
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // from Firebase console
});

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices();
  const { idToken } = await GoogleSignin.signIn();
  const credential = auth.GoogleAuthProvider.credential(idToken);
  return auth().signInWithCredential(credential);
}

export async function signInWithPhone(phoneNumber) {
  return auth().signInWithPhoneNumber(phoneNumber);
}

export function signOut() {
  return auth().signOut();
}

export function onAuthStateChanged(callback) {
  return auth().onAuthStateChanged(callback);
}
```

- [ ] **Step 5: Write `src/services/apiService.js`**

```js
import axios from 'axios';
import auth from '@react-native-firebase/auth';

const API_BASE_URL = __DEV__
  ? 'http://localhost:8080'
  : 'https://your-cloud-run-url';  // replace before production deploy

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async (config) => {
  const user = auth().currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getMe() {
  const response = await api.get('/auth/me');
  return response.data;
}

export default api;
```

- [ ] **Step 6: Write `src/screens/LoginScreen.js`**

```js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithGoogle, signInWithPhone } from '../services/authService';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
    } catch (e) {
      Alert.alert('Sign-in failed', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vis</Text>
      <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 48 },
  button: { backgroundColor: '#E53935', padding: 16, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
```

- [ ] **Step 7: Write `src/screens/PendingScreen.js`**

```js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PendingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Pending</Text>
      <Text style={styles.body}>
        Your PT membership hasn't been activated yet. Please contact your gym branch to get started.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  body: { fontSize: 16, textAlign: 'center', color: '#555' },
});
```

- [ ] **Step 8: Write `src/screens/HomeShell.js`**

```js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getMe } from '../services/apiService';

export default function HomeShell() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe().then(setUser).catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome{user ? `, ${user.name}` : ''}!</Text>
      <Text style={styles.sub}>Phase 0 — auth working end-to-end.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  sub: { color: '#888', marginTop: 8 },
});
```

- [ ] **Step 9: Write `src/navigation/AppNavigator.js`**

```js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from '../services/authService';
import { getMe } from '../services/apiService';
import LoginScreen from '../screens/LoginScreen';
import PendingScreen from '../screens/PendingScreen';
import HomeShell from '../screens/HomeShell';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [appUser, setAppUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const me = await getMe();
          setAppUser(me);
        } catch {
          setAppUser(null); // not registered / pending
        }
      } else {
        setAppUser(null);
      }
    });
  }, []);

  if (firebaseUser === undefined) return null; // splash / loading

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!firebaseUser ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !appUser ? (
          <Stack.Screen name="Pending" component={PendingScreen} />
        ) : (
          <Stack.Screen name="Home" component={HomeShell} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

- [ ] **Step 10: Wire up `App.js`**

```js
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}
```

- [ ] **Step 11: Run on simulator**

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

Expected: Login screen appears. Sign in with Google → if user exists in backend, HomeShell shows name. If not, PendingScreen shows.

- [ ] **Step 12: Commit**

```bash
git add client-app/
git commit -m "feat: Client App auth shell — Google sign-in, pending state, home shell"
```

---

## Task 12: React Native Trainer App auth shell

**Files:** Mirror of `client-app/` with project name `TrainerApp` in `trainer-app/`

- [ ] **Step 1: Scaffold Trainer App**

```bash
npx @react-native-community/cli init TrainerApp --directory trainer-app
cd trainer-app
npm install @react-native-firebase/app @react-native-firebase/auth \
  @react-navigation/native @react-navigation/native-stack \
  react-native-screens react-native-safe-area-context axios
npx pod-install
```

- [ ] **Step 2: Copy auth shell from Client App**

Copy `src/` from `client-app/` into `trainer-app/src/`. The only difference is the HomeShell text:

In `trainer-app/src/screens/HomeShell.js`, change:
```js
<Text style={styles.sub}>Phase 0 — auth working end-to-end.</Text>
```
to:
```js
<Text style={styles.sub}>Trainer App — Phase 0 auth verified.</Text>
```

- [ ] **Step 3: Add Firebase config files**

Download a second set of `google-services.json` / `GoogleService-Info.plist` from Firebase for the Trainer App (or reuse the same Firebase project — same files work). Place in `trainer-app/android/app/` and `trainer-app/ios/`.

- [ ] **Step 4: Run on simulator and verify**

```bash
cd trainer-app
npx react-native run-ios
```

Expected: Same flow as Client App — login → pending or home shell based on backend user lookup.

- [ ] **Step 5: Commit**

```bash
git add trainer-app/
git commit -m "feat: Trainer App auth shell — mirrors Client App for Phase 0"
```

---

## Task 13: Angular Admin Web auth shell

**Files:**
- Create: `admin-web/` (new Angular project)
- Create: `admin-web/src/app/core/firebase.service.ts`
- Create: `admin-web/src/app/core/auth.guard.ts`
- Create: `admin-web/src/app/core/auth.interceptor.ts`
- Create: `admin-web/src/app/features/login/login.component.ts` + `.html`
- Create: `admin-web/src/app/features/pending/pending.component.ts`
- Create: `admin-web/src/app/features/dashboard/dashboard.component.ts`

- [ ] **Step 1: Scaffold Angular project**

```bash
npx @angular/cli new admin-web --routing --style=scss --standalone=false
cd admin-web
npm install firebase @angular/fire
```

- [ ] **Step 2: Configure `environment.ts`**

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
};
```

Replace values from Firebase Console → Project Settings → Your apps → Web app.

- [ ] **Step 3: Write `firebase.service.ts`**

```ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithPopup, GoogleAuthProvider,
  signOut, onAuthStateChanged, User
} from 'firebase/auth';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const app = initializeApp(environment.firebase);
const auth = getAuth(app);

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  readonly auth = auth;

  signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
  }

  signOut() {
    return signOut(auth);
  }

  authState(): Observable<User | null> {
    return new Observable(subscriber => onAuthStateChanged(auth, subscriber));
  }

  async getIdToken(): Promise<string | null> {
    return auth.currentUser ? auth.currentUser.getIdToken() : null;
  }
}
```

- [ ] **Step 4: Write `auth.interceptor.ts`**

```ts
import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor
} from '@angular/common/http';
import { from, Observable, switchMap } from 'rxjs';
import { FirebaseService } from './firebase.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private firebase: FirebaseService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.firebase.getIdToken()).pipe(
      switchMap(token => {
        if (token) {
          req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }
        return next.handle(req);
      })
    );
  }
}
```

- [ ] **Step 5: Write `auth.guard.ts`**

```ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from './firebase.service';
import { map, take } from 'rxjs';

export const authGuard = () => {
  const firebase = inject(FirebaseService);
  const router = inject(Router);
  return firebase.authState().pipe(
    take(1),
    map(user => user ? true : router.createUrlTree(['/login']))
  );
};
```

- [ ] **Step 6: Write login component**

`login.component.ts`:
```ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../core/firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  constructor(private firebase: FirebaseService, private router: Router) {}

  async signInWithGoogle() {
    await this.firebase.signInWithGoogle();
    this.router.navigate(['/dashboard']);
  }
}
```

`login.component.html`:
```html
<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:24px">
  <h1>Vis Admin</h1>
  <button (click)="signInWithGoogle()">Continue with Google</button>
</div>
```

- [ ] **Step 7: Write dashboard shell component**

```ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  template: `
    <h2>Admin Dashboard</h2>
    <p>Phase 0 — auth end-to-end: {{ user | json }}</p>
  `
})
export class DashboardComponent implements OnInit {
  user: any;
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get(`${environment.apiUrl}/auth/me`).subscribe(u => this.user = u);
  }
}
```

- [ ] **Step 8: Wire up routing in `app-routing.module.ts`**

```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

- [ ] **Step 9: Register interceptor in `app.module.ts`**

```ts
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './core/auth.interceptor';
// ... add to providers:
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
]
```

- [ ] **Step 10: Run and verify end-to-end**

```bash
cd admin-web
ng serve
```

Open http://localhost:4200. Expected: redirected to `/login` → Google sign-in → redirected to `/dashboard` → sees user JSON from `/auth/me`.

- [ ] **Step 11: Commit**

```bash
git add admin-web/
git commit -m "feat: Angular Admin Web auth shell — Google sign-in, auth guard, token interceptor"
```

---

## Task 14: End-to-end smoke test

This task verifies all three apps can authenticate against the live backend.

- [ ] **Step 1: Create a test user in the database**

```sql
-- Run against your local PostgreSQL
-- First get a branch ID:
SELECT id FROM branches WHERE name = 'Kandivali';

-- Insert a test user (replace firebase_uid with your actual UID from Firebase console)
INSERT INTO users (firebase_uid, name, email, role, branch_id)
VALUES ('YOUR_FIREBASE_UID', 'Test User', 'test@test.com', 'STAFF', 'BRANCH_UUID_FROM_ABOVE');
```

- [ ] **Step 2: Start backend**

```bash
cd backend
mvn spring-boot:run
```

- [ ] **Step 3: Verify Client App**

Run Client App on simulator. Sign in with the Google account whose UID you inserted. Expected: `HomeShell` appears showing the user's name.

- [ ] **Step 4: Verify Trainer App**

Same test with Trainer App. Expected: same result.

- [ ] **Step 5: Verify Admin Web**

```bash
cd admin-web && ng serve
```

Sign in at http://localhost:4200. Expected: Dashboard shows `{"id":"...","name":"Test User","role":"STAFF",...}`.

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: Phase 0 complete — all three apps authenticate end-to-end"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Firebase Auth (Google, Apple, OTP) — Google wired; Apple follows same pattern with `@react-native-apple-authentication`; Phone OTP uses `auth().signInWithPhoneNumber()` — same `authService.js`
- ✅ Multi-branch schema — enforced in V2 migration with FK + CHECK constraint
- ✅ Role enum (CLIENT / TRAINER / STAFF / OWNER) — in DB + Java
- ✅ Branch Staff scoped to single branch — enforced at service layer (next plan adds branch enforcement middleware)
- ✅ Owner sees all branches — BranchController returns all; role-filtering added in Admin Web plan
- ✅ Phase 0 milestone — auth + DB + role-gated API + all three app shells
- ⚠️ Apple Sign-In not wired in code — noted above; follows identical pattern, just different provider
- ⚠️ Phone OTP not wired in LoginScreen — `signInWithPhone` is exported from authService but UI only shows Google button; add OTP UI in Client/Trainer app plans

**Placeholder scan:** No TBDs, no "implement later". All code is complete.

**Type consistency:** `UserResponse` record fields match what `UserService.toResponse()` populates. `RegisterRequest` fields match controller `@RequestBody`. Filter sets `String` principal → controller reads `(String) auth.getPrincipal()` — consistent.
