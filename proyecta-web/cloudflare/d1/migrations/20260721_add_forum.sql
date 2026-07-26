CREATE TABLE IF NOT EXISTS forum_topics (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_forum_topics_recent ON forum_topics(updated_at DESC);

CREATE TABLE IF NOT EXISTS forum_replies (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_forum_replies_topic ON forum_replies(topic_id, created_at ASC);
