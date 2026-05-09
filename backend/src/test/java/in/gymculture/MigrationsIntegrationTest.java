package in.gymculture;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(classes = GymCultureApplication.class)
@ActiveProfiles("test")
@Transactional
class MigrationsIntegrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void branches_are_seeded_with_seven_rows() {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM branches", Integer.class);
        assertThat(count).isEqualTo(7);

        var names = jdbc.queryForList("SELECT name FROM branches ORDER BY id", String.class);
        assertThat(names).containsExactly(
                "Kandivali", "Borivali", "Mira Road", "Malad East", "Orlem", "Haridwar", "Sundar Nagar"
        );
    }

    @Test
    void check_constraint_rejects_non_owner_without_branch() {
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO users (firebase_uid, email, name, role, branch_id, active)
                VALUES ('uid-test-1', 'a@b.c', 'Tester', 'CLIENT'::user_role, NULL, TRUE)
                """))
                .hasMessageContaining("users_non_owner_has_branch");
    }

    @Test
    void owner_without_branch_is_allowed() {
        int rows = jdbc.update("""
                INSERT INTO users (firebase_uid, email, name, role, branch_id, active)
                VALUES ('uid-owner-1', 'owner@gc.in', 'Owner', 'OWNER'::user_role, NULL, TRUE)
                """);
        assertThat(rows).isEqualTo(1);
    }
}
