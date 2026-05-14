CREATE TYPE service_status AS ENUM (
    'healthy', 'degraded', 'down', 'unknown'
);

CREATE TYPE service_lifecycle AS ENUM (
    'active', 'deprecated', 'archived'
);

CREATE TYPE service_tier AS ENUM (
    'tier-1',   -- critical, on-call 24/7
    'tier-2',   -- important, business hours
    'tier-3'    -- internal tools, best-effort
);

CREATE TABLE IF NOT EXISTS services (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    team_id         UUID REFERENCES teams(id) ON DELETE SET NULL,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Repository
    repo_url        TEXT,
    repo_name       VARCHAR(255),

    -- Classification
    language        VARCHAR(100),
    tier            service_tier NOT NULL DEFAULT 'tier-3',
    lifecycle       service_lifecycle NOT NULL DEFAULT 'active',

    -- Health (di-update dari K8s sync nanti)
    status          service_status NOT NULL DEFAULT 'unknown',
    status_checked_at TIMESTAMPTZ,

    -- Links
    dashboard_url   TEXT,
    docs_url        TEXT,
    oncall_url      TEXT,

    -- Metadata bebas (JSONB untuk extensibility)
    tags            TEXT[] DEFAULT '{}',
    metadata        JSONB DEFAULT '{}',

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_slug      ON services(slug);
CREATE INDEX idx_services_team_id   ON services(team_id);
CREATE INDEX idx_services_status    ON services(status);
CREATE INDEX idx_services_lifecycle ON services(lifecycle);
CREATE INDEX idx_services_tags      ON services USING GIN(tags);

CREATE TRIGGER services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
