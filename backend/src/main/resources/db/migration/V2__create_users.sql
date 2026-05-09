CREATE TYPE user_role AS ENUM ('CLIENT', 'TRAINER', 'STAFF', 'OWNER');

CREATE TABLE users (
    id            BIGSERIAL    PRIMARY KEY,
    firebase_uid  VARCHAR(128) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL,
    name          VARCHAR(150) NOT NULL,
    role          user_role    NOT NULL,
    branch_id    BIGINT       REFERENCES branches(id),
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT users_non_owner_has_branch
        CHECK (role = 'OWNER' OR branch_id IS NOT NULL)
);

CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_role      ON users(role);
