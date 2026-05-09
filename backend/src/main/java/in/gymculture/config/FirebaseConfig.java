package in.gymculture.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.util.StringUtils;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
@Profile("!test")
@Slf4j
public class FirebaseConfig {

    @Value("${gymculture.firebase.credentials-path:}")
    private String credentialsPath;

    @Value("${gymculture.firebase.project-id:}")
    private String projectId;

    @PostConstruct
    void initialize() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("FirebaseApp already initialized — skipping");
            return;
        }

        GoogleCredentials credentials = loadCredentials();

        FirebaseOptions.Builder builder = FirebaseOptions.builder()
                .setCredentials(credentials);
        if (StringUtils.hasText(projectId)) {
            builder.setProjectId(projectId);
        }

        FirebaseApp.initializeApp(builder.build());
        log.info("FirebaseApp initialized for project '{}'", projectId);
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        return FirebaseAuth.getInstance();
    }

    private GoogleCredentials loadCredentials() throws IOException {
        if (StringUtils.hasText(credentialsPath) && Files.exists(Path.of(credentialsPath))) {
            log.info("Loading Firebase credentials from {}", credentialsPath);
            try (InputStream in = new FileInputStream(credentialsPath)) {
                return GoogleCredentials.fromStream(in);
            }
        }
        log.info("Falling back to Application Default Credentials");
        return GoogleCredentials.getApplicationDefault();
    }
}
