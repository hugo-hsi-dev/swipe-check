export const SCHEMA_VERSION = 1;

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
];

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
      'INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?);',
      SCHEMA_VERSION,
      nowIso
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
