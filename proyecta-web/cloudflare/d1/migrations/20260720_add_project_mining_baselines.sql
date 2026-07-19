CREATE TABLE IF NOT EXISTS project_mining_baselines (
  project_id TEXT PRIMARY KEY,
  wallet TEXT NOT NULL,
  total_hashes REAL NOT NULL DEFAULT 0,
  valid_shares INTEGER NOT NULL DEFAULT 0,
  invalid_shares INTEGER NOT NULL DEFAULT 0,
  amount_due_atomic REAL NOT NULL DEFAULT 0,
  amount_paid_atomic REAL NOT NULL DEFAULT 0,
  captured_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Preserve the known pre-mining snapshot for the active OTRA PRUEBA project.
-- SupportXMR's next update was exactly one 75,000-difficulty share later.
INSERT OR IGNORE INTO project_mining_baselines (
  project_id, wallet, total_hashes, valid_shares, invalid_shares,
  amount_due_atomic, amount_paid_atomic, captured_at, updated_at
)
SELECT
  'proj_1784349046292',
  '447gTj6Hg6gaAEAUmjqfhqDZr1PziUTvbT4LYLpmLVnTNVFK6cqeqPfh6P4neMKLWX5jDXAr94fWHacJwDvjmCzBBH8wPBt',
  6854895,
  53,
  0,
  4977231,
  0,
  1784504500000,
  1784504500000
WHERE EXISTS (
  SELECT 1 FROM projects
  WHERE id = 'proj_1784349046292'
    AND COALESCE(NULLIF(monero_address, ''), fundraising_address) = '447gTj6Hg6gaAEAUmjqfhqDZr1PziUTvbT4LYLpmLVnTNVFK6cqeqPfh6P4neMKLWX5jDXAr94fWHacJwDvjmCzBBH8wPBt'
);
