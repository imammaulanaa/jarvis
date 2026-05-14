CREATE TYPE deploy_status AS ENUM (
    'pending', 'running', 'success', 'failed', 'rolled_back', 'cancelled'
);

CREATE TYPE deploy_environment AS ENUM (
    'development', 'staging', 'production'
);

CREATE TABLE IF NOT EXISTS deployments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    triggered_by    UUID REFERENCES users(id) ON DELETE SET NULL,

    -- What
    image_tag       VARCHAR(255) NOT NULL,
    environment     deploy_environment NOT NULL,

    -- Status
    status          deploy_status NOT NULL DEFAULT 'pending',
    status_message  TEXT,

    -- Timing
    started_at      TIMESTAMPTZ,
    finished_at     TIMESTAMPTZ,

    -- Reference ke ArgoCD / GitHub Actions
    external_id     VARCHAR(255),
    external_url    TEXT,

    -- Snapshot config saat deploy
    metadata        JSONB DEFAULT '{}',

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deployments_service_id   ON deployments(service_id);
CREATE INDEX idx_deployments_environment  ON deployments(environment);
CREATE INDEX idx_deployments_status       ON deployments(status);
CREATE INDEX idx_deployments_triggered_by ON deployments(triggered_by);
CREATE INDEX idx_deployments_created_at   ON deployments(created_at DESC);
