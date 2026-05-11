CREATE TABLE IF NOT EXISTS person (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS phone_type (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS phone (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
  person_id BIGINT NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  phone_type_id BIGINT NOT NULL REFERENCES phone_type(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (number, phone_type_id)
);

CREATE TABLE IF NOT EXISTS address (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  locality VARCHAR(120) NOT NULL,
  street VARCHAR(120) NOT NULL,
  number INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_activity (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  activity_type VARCHAR(20) NOT NULL CHECK (
    activity_type IN ('call', 'meeting', 'email')
  ),
  activity_date TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_person_full_name
  ON person (first_name, last_name);

CREATE INDEX IF NOT EXISTS idx_phone_number_type
  ON phone (number, phone_type_id);

CREATE INDEX IF NOT EXISTS idx_contact_activity_person_type
  ON contact_activity (person_id, activity_type);

INSERT INTO phone_type (type_name)
VALUES ('mobile'), ('home'), ('work')
ON CONFLICT (type_name) DO NOTHING;
