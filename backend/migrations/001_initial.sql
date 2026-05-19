CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email       TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS diagrams (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    owner_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL DEFAULT 'Untitled',
    content     TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Auto-update updated_at on every UPDATE
CREATE TRIGGER IF NOT EXISTS diagrams_updated_at
    AFTER UPDATE ON diagrams
    FOR EACH ROW
BEGIN
    UPDATE diagrams SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TABLE IF NOT EXISTS share_links (
    token       TEXT PRIMARY KEY,
    diagram_id  TEXT NOT NULL REFERENCES diagrams(id) ON DELETE CASCADE,
    permission  TEXT NOT NULL CHECK (permission IN ('read', 'edit')) DEFAULT 'read',
    expires_at  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_diagrams_owner ON diagrams(owner_id);
CREATE INDEX IF NOT EXISTS idx_share_links_diagram ON share_links(diagram_id);
