import { bootstrapLocalData, SCHEMA_VERSION, type LocalDatabaseAdapter } from '@/lib/local-data/bootstrap';

type MetaRecord = {
  value: string;
  updatedAt: string;
};

class FakeDatabaseAdapter implements LocalDatabaseAdapter {
  private readonly appMeta = new Map<string, MetaRecord>();
  private readonly migrations = new Set<number>();

  async execAsync(_sql: string): Promise<void> {
    // No-op for BEGIN / COMMIT / ROLLBACK in fake adapter.
  }

  async runAsync(sql: string, ...params: (string | number | null)[]): Promise<unknown> {
    if (sql.includes('schema_migrations')) {
      const version = Number(params[0]);
      this.migrations.add(version);
      return;
    }

    if (sql.includes('INSERT OR IGNORE INTO app_meta')) {
      const [key, value, updatedAt] = params as [string, string, string];
      if (!this.appMeta.has(key)) {
        this.appMeta.set(key, { value, updatedAt });
      }
      return;
    }

    if (sql.includes('INSERT OR REPLACE INTO app_meta')) {
      const [key, value, updatedAt] = params as [string, string, string];
      this.appMeta.set(key, { value, updatedAt });
    }
  }

  async getFirstAsync<T>(sql: string, ...params: (string | number | null)[]): Promise<T | null> {
    if (sql.includes('FROM app_meta')) {
      const key = String(params[0]);
      const record = this.appMeta.get(key);

      if (!record) {
        return null;
      }

      return { value: record.value } as T;
    }

    return null;
  }

  hasMigration(version: number): boolean {
    return this.migrations.has(version);
  }

  getMeta(key: string): MetaRecord | undefined {
    return this.appMeta.get(key);
  }
}

describe('bootstrapLocalData', () => {
  it('bootstraps schema and baseline records for untouched installs', async () => {
    const adapter = new FakeDatabaseAdapter();

    const result = await bootstrapLocalData(adapter);

    expect(result.wasUntouchedInstall).toBe(true);
    expect(result.schemaVersion).toBe(SCHEMA_VERSION);
    expect(adapter.hasMigration(SCHEMA_VERSION)).toBe(true);
    expect(adapter.getMeta('initializedAt')).toBeDefined();
    expect(adapter.getMeta('lastBootstrapAt')).toBeDefined();
    expect(adapter.getMeta('schemaVersion')?.value).toBe(String(SCHEMA_VERSION));
  });

  it('keeps initializedAt stable while refreshing bootstrap metadata', async () => {
    const adapter = new FakeDatabaseAdapter();

    const firstRun = await bootstrapLocalData(adapter);
    const secondRun = await bootstrapLocalData(adapter);

    expect(secondRun.wasUntouchedInstall).toBe(false);
    expect(secondRun.initializedAt).toBe(firstRun.initializedAt);
    expect(new Date(secondRun.lastBootstrapAt).getTime()).toBeGreaterThanOrEqual(
      new Date(firstRun.lastBootstrapAt).getTime()
    );
  });
});
