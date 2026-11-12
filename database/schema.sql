
-- ==========================================
-- Gemini NPC Dialogue
-- Estrutura do banco Cloudflare D1
-- ==========================================

-- Tabela de usuários
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    pass_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tabela de sessões de autenticação
CREATE TABLE sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Tabela de interações entre jogadores e NPCs
CREATE TABLE interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    npc_key TEXT NOT NULL,
    map_id INTEGER,
    event_id INTEGER,
    player_text TEXT,
    ai_text TEXT,
    meta_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    run_id TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Índice para otimizar a recuperação do histórico
CREATE INDEX idx_interactions_user_npc_run
ON interactions(user_id, npc_key, run_id);
