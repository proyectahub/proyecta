CREATE TABLE IF NOT EXISTS request_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  funding_goal REAL NOT NULL,
  fundraising_address TEXT NOT NULL,
  monero_address TEXT NOT NULL,
  author TEXT NOT NULL,
  author_name TEXT NOT NULL,
  raised REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  hitos_json TEXT NOT NULL DEFAULT '[]',
  cover_image TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
