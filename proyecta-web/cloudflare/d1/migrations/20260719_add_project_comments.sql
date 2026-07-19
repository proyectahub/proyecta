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
