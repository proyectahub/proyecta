CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  affiliation TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  orcid_id TEXT,
  institution TEXT,
  research_area TEXT,
  monero_wallet_main_address TEXT,
  monero_wallet_view_key TEXT NOT NULL DEFAULT '',
  monero_wallet_user_vita_address TEXT,
  monero_wallet_linked_at INTEGER,
  wallet_mode TEXT NOT NULL DEFAULT 'external',
  wallet_web_url TEXT NOT NULL DEFAULT '',
  vita_backed INTEGER NOT NULL DEFAULT 0,
  vita_earned INTEGER NOT NULL DEFAULT 0,
  vita_pledged INTEGER NOT NULL DEFAULT 0,
  accepted_privacy_notice INTEGER NOT NULL DEFAULT 0,
  accepted_publishing_terms INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

CREATE TABLE IF NOT EXISTS wallet_profiles (
  id TEXT PRIMARY KEY,
  main_address TEXT NOT NULL UNIQUE,
  view_key TEXT NOT NULL DEFAULT '',
  user_vita_address TEXT NOT NULL,
  wallet_mode TEXT NOT NULL DEFAULT 'external',
  wallet_web_url TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  institution TEXT NOT NULL DEFAULT '',
  research_area TEXT NOT NULL DEFAULT '',
  orcid_id TEXT,
  reputation INTEGER NOT NULL DEFAULT 0,
  vita_backed INTEGER NOT NULL DEFAULT 0,
  vita_earned INTEGER NOT NULL DEFAULT 0,
  vita_pledged INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS wallet_sessions (
  token TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (wallet_id) REFERENCES wallet_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wallet_sessions_wallet_id ON wallet_sessions(wallet_id);

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

CREATE TABLE IF NOT EXISTS project_comments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_comments_project
ON project_comments(project_id, created_at DESC);
