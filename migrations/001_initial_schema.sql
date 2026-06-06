CREATE TABLE IF NOT EXISTS factories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    address TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_lines (
    id TEXT PRIMARY KEY,
    factory_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factory_id) REFERENCES factories(id)
);

CREATE TABLE IF NOT EXISTS gateways (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sn TEXT NOT NULL UNIQUE,
    factory_id TEXT NOT NULL,
    production_line_id TEXT NOT NULL,
    ip_address TEXT,
    status TEXT NOT NULL DEFAULT 'offline',
    last_heartbeat DATETIME,
    certificate_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (factory_id) REFERENCES factories(id),
    FOREIGN KEY (production_line_id) REFERENCES production_lines(id)
);

CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    gateway_id TEXT NOT NULL,
    gateway_sn TEXT NOT NULL,
    factory_id TEXT NOT NULL,
    production_line_id TEXT NOT NULL,
    serial_number TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    issuer TEXT NOT NULL,
    valid_from DATETIME NOT NULL,
    valid_to DATETIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'valid',
    revoked_at DATETIME,
    revoke_reason TEXT,
    pem_content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gateway_id) REFERENCES gateways(id),
    FOREIGN KEY (factory_id) REFERENCES factories(id),
    FOREIGN KEY (production_line_id) REFERENCES production_lines(id)
);

CREATE TABLE IF NOT EXISTS collected_data (
    id TEXT PRIMARY KEY,
    gateway_id TEXT NOT NULL,
    gateway_sn TEXT NOT NULL,
    factory_id TEXT NOT NULL,
    production_line_id TEXT NOT NULL,
    data_type TEXT NOT NULL,
    value REAL NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (gateway_id) REFERENCES gateways(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    operator TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    detail TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_valid_to ON certificates(valid_to);
CREATE INDEX IF NOT EXISTS idx_certificates_gateway_id ON certificates(gateway_id);
CREATE INDEX IF NOT EXISTS idx_gateways_status ON gateways(status);
CREATE INDEX IF NOT EXISTS idx_gateways_factory_id ON gateways(factory_id);
CREATE INDEX IF NOT EXISTS idx_collected_data_gateway_id ON collected_data(gateway_id);
CREATE INDEX IF NOT EXISTS idx_collected_data_timestamp ON collected_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
