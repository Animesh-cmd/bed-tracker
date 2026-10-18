CREATE TABLE wards(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE beds(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id     UUID NOT NULL REFERENCES wards(id),
    label       TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'available' 
                CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    patient_ref TEXT NULL,       -- synthetic ID only, never real name
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by  TEXT NULL,       -- becomes a user UUID once auth exists
    version     INT NOT NULL DEFAULT 1,
    UNIQUE (ward_id, label)
);