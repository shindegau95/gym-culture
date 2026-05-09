CREATE TABLE branches (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    city        VARCHAR(100) NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

INSERT INTO branches (name, city) VALUES
    ('Kandivali',    'Mumbai'),
    ('Borivali',     'Mumbai'),
    ('Mira Road',    'Thane'),
    ('Malad East',   'Mumbai'),
    ('Orlem',        'Mumbai'),
    ('Haridwar',     'Haridwar'),
    ('Sundar Nagar', 'Mandi');
