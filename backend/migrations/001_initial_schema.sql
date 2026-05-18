-- ============================================================
-- CrisesMesh AI — Supabase PostgreSQL Schema
-- Task 2.2 | Urban Flooding MVP
-- Run in Supabase SQL Editor or via migration tool
-- ============================================================

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ──────────────────────────────────────────────────────────
-- 1. citizen_reports
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizen_reports (
    id                     TEXT PRIMARY KEY DEFAULT ('report_' || gen_random_uuid()::text),
    citizen_name           TEXT NOT NULL,
    phone                  TEXT NOT NULL,
    category               TEXT NOT NULL CHECK (category IN ('Urban Flooding', 'Water Logging', 'Drain Overflow')),
    severity               TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    description            TEXT NOT NULL,
    transcribed_voice_text TEXT,
    photo_url              TEXT,
    lat                    DOUBLE PRECISION NOT NULL,
    lng                    DOUBLE PRECISION NOT NULL,
    location               GEOGRAPHY(POINT, 4326),  -- PostGIS spatial column
    road_blocked           BOOLEAN DEFAULT FALSE,
    status                 TEXT NOT NULL DEFAULT 'Submitted'
                               CHECK (status IN ('Submitted', 'Under Review', 'Verified', 'Resolved')),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-set PostGIS location from lat/lng
CREATE OR REPLACE FUNCTION set_report_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER citizen_reports_location_trigger
BEFORE INSERT OR UPDATE ON citizen_reports
FOR EACH ROW EXECUTE FUNCTION set_report_location();

-- ──────────────────────────────────────────────────────────
-- 2. signals
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS signals (
    id                      TEXT PRIMARY KEY DEFAULT ('sig_' || gen_random_uuid()::text),
    source                  TEXT NOT NULL CHECK (source IN (
                                'citizen_report', 'weather', 'traffic',
                                'field_officer', 'water_level_sensor',
                                'emergency_calls', 'historical_data'
                            )),
    incident_candidate_id   TEXT,
    report_id               TEXT REFERENCES citizen_reports(id) ON DELETE SET NULL,
    text                    TEXT NOT NULL,
    lat                     DOUBLE PRECISION NOT NULL,
    lng                     DOUBLE PRECISION NOT NULL,
    location                GEOGRAPHY(POINT, 4326),
    credibility_score       DOUBLE PRECISION DEFAULT 0.5 CHECK (credibility_score BETWEEN 0 AND 1),
    geo_confidence          DOUBLE PRECISION DEFAULT 0.5 CHECK (geo_confidence BETWEEN 0 AND 1),
    urgency_score           DOUBLE PRECISION DEFAULT 0.5 CHECK (urgency_score BETWEEN 0 AND 1),
    raw_payload             JSONB,
    timestamp               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_signal_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER signals_location_trigger
BEFORE INSERT OR UPDATE ON signals
FOR EACH ROW EXECUTE FUNCTION set_signal_location();

-- ──────────────────────────────────────────────────────────
-- 3. incidents
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
    id                      TEXT PRIMARY KEY DEFAULT ('inc_' || gen_random_uuid()::text),
    type                    TEXT NOT NULL DEFAULT 'Urban Flooding',
    status                  TEXT NOT NULL DEFAULT 'Candidate'
                                CHECK (status IN ('Candidate', 'Active', 'Resolved', 'False Alarm')),
    severity                TEXT NOT NULL DEFAULT 'Medium'
                                CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    confidence              DOUBLE PRECISION DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
    priority_score          INTEGER DEFAULT 50 CHECK (priority_score BETWEEN 0 AND 100),
    lat                     DOUBLE PRECISION NOT NULL,
    lng                     DOUBLE PRECISION NOT NULL,
    location                GEOGRAPHY(POINT, 4326),
    affected_radius_m       INTEGER DEFAULT 300,
    red_zone_geojson        JSONB,
    estimated_population    INTEGER DEFAULT 0,
    expected_duration_hours INTEGER DEFAULT 2,
    peak_impact_time        TIMESTAMPTZ,
    signal_agreement        DOUBLE PRECISION,
    contradiction_level     DOUBLE PRECISION,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_incident_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER incidents_location_trigger
BEFORE INSERT OR UPDATE ON incidents
FOR EACH ROW EXECUTE FUNCTION set_incident_location();

-- Link table: incident <-> reports
CREATE TABLE IF NOT EXISTS incident_reports (
    incident_id TEXT REFERENCES incidents(id) ON DELETE CASCADE,
    report_id   TEXT REFERENCES citizen_reports(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, report_id)
);

-- Link table: incident <-> signals
CREATE TABLE IF NOT EXISTS incident_signals (
    incident_id TEXT REFERENCES incidents(id) ON DELETE CASCADE,
    signal_id   TEXT REFERENCES signals(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, signal_id)
);

-- ──────────────────────────────────────────────────────────
-- 4. resources
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
    id          TEXT PRIMARY KEY DEFAULT ('res_' || gen_random_uuid()::text),
    type        TEXT NOT NULL CHECK (type IN (
                    'Rescue Team', 'Ambulance', 'Police Unit',
                    'Water Pump', 'Field Officer'
                )),
    name        TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'Available'
                    CHECK (status IN ('Available', 'Assigned', 'Unavailable')),
    lat         DOUBLE PRECISION NOT NULL,
    lng         DOUBLE PRECISION NOT NULL,
    location    GEOGRAPHY(POINT, 4326),
    capacity    INTEGER DEFAULT 5,
    eta_minutes INTEGER,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_resource_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resources_location_trigger
BEFORE INSERT OR UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION set_resource_location();

-- ──────────────────────────────────────────────────────────
-- 5. resource_allocations
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resource_allocations (
    id                      TEXT PRIMARY KEY DEFAULT ('alloc_' || gen_random_uuid()::text),
    incident_id             TEXT REFERENCES incidents(id) ON DELETE CASCADE,
    ai_reason_summary       TEXT,
    ai_tradeoff_summary     TEXT,
    approved_by_government  BOOLEAN DEFAULT FALSE,
    approved_at             TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS allocation_resources (
    allocation_id TEXT REFERENCES resource_allocations(id) ON DELETE CASCADE,
    resource_id   TEXT REFERENCES resources(id) ON DELETE CASCADE,
    status        TEXT DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'Dispatched', 'On Scene')),
    PRIMARY KEY (allocation_id, resource_id)
);

-- ──────────────────────────────────────────────────────────
-- 6. agent_traces
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_traces (
    id               TEXT PRIMARY KEY DEFAULT ('trace_' || gen_random_uuid()::text),
    incident_id      TEXT REFERENCES incidents(id) ON DELETE CASCADE,
    agent_name       TEXT NOT NULL,
    input_summary    TEXT,
    reasoning_summary TEXT NOT NULL,  -- Safe summary only, no raw chain-of-thought
    output           JSONB,
    confidence       DOUBLE PRECISION,
    execution_ms     INTEGER,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 7. alerts
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
    id                TEXT PRIMARY KEY DEFAULT ('alert_' || gen_random_uuid()::text),
    incident_id       TEXT REFERENCES incidents(id) ON DELETE CASCADE,
    status            TEXT NOT NULL DEFAULT 'Draft'
                          CHECK (status IN ('Draft', 'Approved', 'Sent', 'Retracted')),
    severity          TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    english_text      TEXT NOT NULL,
    roman_urdu_text   TEXT,
    channels          TEXT[] DEFAULT ARRAY['in_app'],
    approved_by       TEXT,
    approved_at       TIMESTAMPTZ,
    sent_at           TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- 8. simulation_results
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS simulation_results (
    id               TEXT PRIMARY KEY DEFAULT ('sim_' || gen_random_uuid()::text),
    incident_id      TEXT REFERENCES incidents(id) ON DELETE CASCADE,
    simulation_type  TEXT DEFAULT 'reroute',
    before_state     JSONB,
    action           JSONB,
    after_state      JSONB,
    eta_before_min   INTEGER,
    eta_after_min    INTEGER,
    time_saved_min   INTEGER,
    resource_cost    TEXT,
    congestion_effect TEXT,
    confidence       DOUBLE PRECISION,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- INDEXES for geospatial and common queries
-- ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_citizen_reports_location  ON citizen_reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_citizen_reports_status    ON citizen_reports (status);
CREATE INDEX IF NOT EXISTS idx_signals_location          ON signals USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_incidents_location        ON incidents USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_incidents_status          ON incidents (status);
CREATE INDEX IF NOT EXISTS idx_agent_traces_incident     ON agent_traces (incident_id);
CREATE INDEX IF NOT EXISTS idx_alerts_incident           ON alerts (incident_id);

-- ──────────────────────────────────────────────────────────
-- SEED DATA: Resources (Islamabad/Rawalpindi area)
-- ──────────────────────────────────────────────────────────
INSERT INTO resources (id, type, name, status, lat, lng, capacity, eta_minutes) VALUES
  -- Rescue Teams
  ('res_001', 'Rescue Team', 'Rescue Team Alpha', 'Available', 33.7200, 73.0400, 8, 12),
  ('res_002', 'Rescue Team', 'Rescue Team Bravo', 'Available', 33.6600, 73.0800, 8, 18),
  ('res_003', 'Rescue Team', 'Rescue Team Charlie', 'Available', 33.6900, 73.1000, 8, 22),
  -- Ambulances
  ('res_004', 'Ambulance',   'Ambulance Unit 1', 'Available', 33.7100, 73.0550, 2, 8),
  ('res_005', 'Ambulance',   'Ambulance Unit 2', 'Available', 33.6750, 73.0650, 2, 15),
  ('res_006', 'Ambulance',   'Ambulance Unit 3', 'Available', 33.6950, 73.0300, 2, 20),
  -- Police Units
  ('res_007', 'Police Unit', 'Police Mobile 1 — G-10', 'Available', 33.6830, 73.0460, 6, 5),
  ('res_008', 'Police Unit', 'Police Mobile 2 — G-11', 'Available', 33.6920, 73.0370, 6, 10),
  ('res_009', 'Police Unit', 'Police Mobile 3 — F-10', 'Available', 33.7050, 73.0490, 6, 14),
  -- Water Pumps
  ('res_010', 'Water Pump',  'Heavy Pump Unit A', 'Available', 33.6800, 73.0500, 1, 25),
  ('res_011', 'Water Pump',  'Heavy Pump Unit B', 'Available', 33.7000, 73.0600, 1, 30),
  -- Field Officers
  ('res_012', 'Field Officer', 'Field Officer Malik', 'Available', 33.6844, 73.0479, 1, 3),
  ('res_013', 'Field Officer', 'Field Officer Nawaz', 'Available', 33.6860, 73.0490, 1, 5)
ON CONFLICT (id) DO NOTHING;
