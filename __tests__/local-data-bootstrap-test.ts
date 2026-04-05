import {
  bootstrapLocalData,
  clearLocalData,
  type LocalDatabaseAdapter,
} from '@/lib/local-data/bootstrap';

type MetaRecord = {
  value: string;
  updatedAt: string;
};

class FakeDatabaseAdapter implements LocalDatabaseAdapter {
  private readonly appMeta = new Map<string, MetaRecord>();
  private isCleared = false;

  async execAsync(sql: string): Promise<void> {
    if (sql.includes('DROP TABLE IF EXISTS')) {
      this.isCleared = true;
      this.appMeta.clear();
    }

    if (sql.includes('CREATE TABLE IF NOT EXISTS')) {
      this.isCleared = false;
    }
  }

  async runAsync(sql: string, ...params: (string | number | null)[]): Promise<unknown> {
    if (this.isCleared && !sql.includes('CREATE TABLE')) {
      throw new Error('Database is cleared, must re-bootstrap before use');
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

  async getAllAsync<T>(_sql: string): Promise<T[]> {
    return [];
  }

  getMeta(key: string): MetaRecord | undefined {
    return this.appMeta.get(key);
  }

  getIsCleared(): boolean {
    return this.isCleared;
  }
}

describe('bootstrapLocalData', () => {
  it('bootstraps schema and baseline records for untouched installs', async () => {
    const adapter = new FakeDatabaseAdapter();

    const result = await bootstrapLocalData(adapter);

    expect(result.wasUntouchedInstall).toBe(true);
    expect(adapter.getMeta('initializedAt')).toBeDefined();
    expect(adapter.getMeta('lastBootstrapAt')).toBeDefined();
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

describe('clearLocalData', () => {
  it('clears all persisted app state and returns clearedAt timestamp', async () => {
    const adapter = new FakeDatabaseAdapter();

    await bootstrapLocalData(adapter);
    expect(adapter.getMeta('initializedAt')).toBeDefined();

    const result = await clearLocalData(adapter);

    expect(result.clearedAt).toBeDefined();
    expect(adapter.getIsCleared()).toBe(true);
  });

  it('allows reinitialization after clear to behave like fresh install', async () => {
    const adapter = new FakeDatabaseAdapter();

    const firstRun = await bootstrapLocalData(adapter);
    expect(firstRun.wasUntouchedInstall).toBe(true);

    await clearLocalData(adapter);

    const secondRun = await bootstrapLocalData(adapter);
    expect(secondRun.wasUntouchedInstall).toBe(true);
  });
});
