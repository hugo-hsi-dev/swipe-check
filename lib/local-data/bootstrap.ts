export type BootstrapResult = {
  initializedAt: string;
  lastBootstrapAt: string;
  wasUntouchedInstall: boolean;
};

type MetaRow = {
  value: string;
};

export interface LocalDatabaseAdapter {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, ...params: (string | number | null)[]): Promise<unknown>;
  getFirstAsync<T>(sql: string, ...params: (string | number | null)[]): Promise<T | null>;
  getAllAsync<T>(sql: string, ...params: (string | number | null)[]): Promise<T[]>;
}

const createTableStatements = [
  `CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY NOT NULL,
    session_type TEXT NOT NULL,
    status TEXT NOT NULL,
    local_day_key TEXT,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK (session_type IN ('onboarding', 'daily')),
    CHECK (status IN ('in_progress', 'completed')),
    CHECK (
      (session_type = 'daily' AND local_day_key IS NOT NULL)
      OR (session_type = 'onboarding' AND local_day_key IS NULL)
    )
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_daily_unique_day
   ON sessions(session_type, local_day_key);`,

  `CREATE TABLE IF NOT EXISTS session_answers (
    session_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    answer TEXT NOT NULL,
    answered_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (session_id, question_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    CHECK (answer IN ('agree', 'disagree'))
  );`,

  `CREATE INDEX IF NOT EXISTS idx_sessions_completed_at
   ON sessions(completed_at DESC, started_at DESC, id DESC);`,

  `CREATE TABLE IF NOT EXISTS type_snapshots (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT,
    current_type TEXT NOT NULL,
    axis_scores_json TEXT NOT NULL,
    axis_strengths_json TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_session_id TEXT,
    question_count INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    inserted_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL,
    CHECK (source_type IN ('onboarding', 'daily', 'manual'))
  );`,
  `CREATE INDEX IF NOT EXISTS idx_type_snapshots_created_at
    ON type_snapshots(created_at);`,
  `CREATE INDEX IF NOT EXISTS idx_type_snapshots_session_id
    ON type_snapshots(session_id);`,
];

const dropTableStatements = [
  `DROP TABLE IF EXISTS session_answers;`,
  `DROP TABLE IF EXISTS type_snapshots;`,
  `DROP TABLE IF EXISTS sessions;`,
  `DROP TABLE IF EXISTS app_meta;`,
];

export type ClearResult = {
  clearedAt: string;
};

export async function clearLocalData(adapter: LocalDatabaseAdapter): Promise<ClearResult> {
  const nowIso = new Date().toISOString();

  await adapter.execAsync('BEGIN IMMEDIATE;');

  try {
    for (const statement of dropTableStatements) {
      await adapter.execAsync(statement);
    }

    await adapter.execAsync('COMMIT;');

    return { clearedAt: nowIso };
  } catch (error) {
    await adapter.execAsync('ROLLBACK;');
    throw error;
  }
}

export async function bootstrapLocalData(adapter: LocalDatabaseAdapter): Promise<BootstrapResult> {
  const nowIso = new Date().toISOString();

  await adapter.execAsync('BEGIN IMMEDIATE;');

  try {
    for (const statement of createTableStatements) {
      await adapter.execAsync(statement);
    }

    const existingInitialization = await adapter.getFirstAsync<MetaRow>(
      'SELECT value FROM app_meta WHERE key = ? LIMIT 1;',
      'initializedAt'
    );

    await adapter.runAsync(
      'INSERT OR IGNORE INTO app_meta (key, value, updated_at) VALUES (?, ?, ?);',
      'initializedAt',
      nowIso,
      nowIso
    );

    await adapter.runAsync(
      'INSERT OR REPLACE INTO app_meta (key, value, updated_at) VALUES (?, ?, ?);',
      'lastBootstrapAt',
      nowIso,
      nowIso
    );

    await adapter.execAsync('COMMIT;');

    const initializedAtRow = await adapter.getFirstAsync<MetaRow>(
      'SELECT value FROM app_meta WHERE key = ? LIMIT 1;',
      'initializedAt'
    );
    const lastBootstrapAtRow = await adapter.getFirstAsync<MetaRow>(
      'SELECT value FROM app_meta WHERE key = ? LIMIT 1;',
      'lastBootstrapAt'
    );

    return {
      initializedAt: initializedAtRow?.value ?? nowIso,
      lastBootstrapAt: lastBootstrapAtRow?.value ?? nowIso,
      wasUntouchedInstall: existingInitialization == null,
    };
  } catch (error) {
    await adapter.execAsync('ROLLBACK;');
    throw error;
  }
}
