-- Phase 0 smoke-test users
--
-- Each Firebase UID below must be replaced with the real UID from
-- Firebase Console → Authentication → Users (visible only after the
-- corresponding Google account has signed in to the matching app at
-- least once).
--
-- branch_id = 1 corresponds to the "Kandivali" seed row inserted by
-- V1__create_branches.sql.
--
-- Run with:
--   docker exec -i vis-postgres psql -U vis -d vis < docs/smoke-test/users.sql

INSERT INTO users (firebase_uid, email, name, phone, role, branch_id, active)
VALUES
  ('REPLACE_WITH_STAFF_UID',   'staff.test@vis',   'Test Staff',   NULL, 'STAFF',   1, TRUE),
  ('REPLACE_WITH_TRAINER_UID', 'trainer.test@vis', 'Test Trainer', NULL, 'TRAINER', 1, TRUE),
  ('REPLACE_WITH_CLIENT_UID',  'client.test@vis',  'Test Client',  NULL, 'CLIENT',  1, TRUE)
ON CONFLICT (firebase_uid) DO UPDATE
SET role = EXCLUDED.role,
    branch_id = EXCLUDED.branch_id,
    active = EXCLUDED.active,
    updated_at = now();

-- Sanity check
SELECT firebase_uid, name, role, branch_id, active
FROM users
WHERE firebase_uid LIKE 'REPLACE_%' OR email LIKE '%@vis';
