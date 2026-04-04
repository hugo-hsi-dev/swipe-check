export const SCHEMA_VERSION = 4;

export type BootstrapResult = {
  initializedAt: string;
  lastBootstrapAt: string;
  schemaVersion: number;
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
  `CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY NOT NULL,
    applied_at TEXT NOT NULL
  );`,
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
  `DROP TABLE IF EXISTS schema_migrations;`,
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

    const existingVersionRow = await adapter.getFirstAsync<{ version: number }>(
      'SELECT version FROM schema_migrations WHERE version = ? LIMIT 1;',
      SCHEMA_VERSION
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

    await adapter.runAsync(
      'INSERT OR REPLACE INTO app_meta (key, value, updated_at) VALUES (?, ?, ?);',
      'schemaVersion',
      String(SCHEMA_VERSION),
      nowIso
    );

    if (!existingVersionRow) {
      await adapter.runAsync(
        'INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?);',
        SCHEMA_VERSION,
        nowIso
      );
    }

    await adapter.execAsync('COMMIT;');

    const initializedAtRow = await adapter.getFirstAsync<MetaRow>(
      'SELECT value FROM app_meta WHERE key = ? LIMIT 1;',
      'initializedAt'
    );
    const lastBootstrapAtRow = await adapter.getFirstAsync<MetaRow>(
      'SELECT value FROM app_meta WHERE key = ? LIMIT 1;',
      'lastBootstrapAt'
    );
    const schemaVersionRow = await adapter.getFirstAsync<MetaRow>(
      'SELECT value FROM app_meta WHERE key = ? LIMIT 1;',
      'schemaVersion'
    );

    return {
      initializedAt: initializedAtRow?.value ?? nowIso,
      lastBootstrapAt: lastBootstrapAtRow?.value ?? nowIso,
      schemaVersion: Number(schemaVersionRow?.value ?? SCHEMA_VERSION),
      wasUntouchedInstall: existingInitialization == null,
    };
  } catch (error) {
    await adapter.execAsync('ROLLBACK;');
    throw error;
  }
}

export async function migrateToSchemaV4(adapter: LocalDatabaseAdapter): Promise<void> {
  await adapter.execAsync('BEGIN IMMEDIATE;');

  try {
    await adapter.execAsync(
      `CREATE TABLE IF NOT EXISTS session_answers_v4 (
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
      );`
    );

    await adapter.execAsync(
      `CREATE UNIQUE INDEX IF NOT EXISTS idx_session_answers_v4_unique
       ON session_answers_v4(session_id, question_id);`
    );

    await adapter.execAsync(
      `CREATE INDEX IF NOT EXISTS idx_sessions_completed_at
       ON sessions(completed_at DESC, started_at DESC, id DESC);`
    );

    await adapter.execAsync(
      `INSERT INTO session_answers_v4 (session_id, question_id, question_text, answer, answered_at, created_at, updated_at)
       SELECT sa.session_id, sa.question_id, sa.question_text, sa.answer, sa.answered_at, sa.created_at, sa.updated_at
       FROM session_answers sa;`
    );

    await adapter.execAsync('DROP TABLE session_answers;');

    await adapter.execAsync(
      `ALTER TABLE session_answers_v4 RENAME TO session_answers;`
    );

    await adapter.runAsync(
      'INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?);',
      4,
      new Date().toISOString()
    );

    await adapter.execAsync('COMMIT;');
  } catch (error) {
    await adapter.execAsync('ROLLBACK;');
    throw error;
  }
}
