CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Action: "service.created", "deployment.triggered", "team.member_added"
    action          VARCHAR(255) NOT NULL,

    -- Resource yang dikenai action
    resource_type   VARCHAR(100) NOT NULL,  -- service, deployment, team, user
    resource_id     UUID,

    -- Detail tambahan (before/after state, dll)
    metadata        JSONB DEFAULT '{}',

    -- Request context
    ip_address      INET,
    user_agent      TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id       ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action        ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource      ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at    ON audit_logs(created_at DESC);
