import { QUESTIONS } from '@/constants/questions';
import {
  bootstrapLocalData,
  clearLocalData,
  readQuestionCatalog,
  SCHEMA_VERSION,
  type LocalDatabaseAdapter,
} from '@/lib/local-data/bootstrap';

type MetaRecord = {
  value: string;
  updatedAt: string;
};

type QuestionRecord = {
  id: string;
  prompt: string;
  axisId: string;
  agreePoleId: string;
  pool: string;
  isActive: number;
  metadataJson: string | null;
  sortIndex: number;
};

class FakeDatabaseAdapter implements LocalDatabaseAdapter {
  private readonly appMeta = new Map<string, MetaRecord>();
  private readonly migrations = new Set<number>();
  private readonly questionCatalog = new Map<string, QuestionRecord>();
  private isCleared = false;

  async execAsync(sql: string): Promise<void> {
    // No-op for BEGIN / COMMIT / ROLLBACK in fake adapter.
    // Handle DROP TABLE statements for clearLocalData
    if (sql.includes('DROP TABLE IF EXISTS')) {
      this.isCleared = true;
      this.appMeta.clear();
      this.migrations.clear();
      this.questionCatalog.clear();
    }

    // Reset cleared state when tables are being created (during re-bootstrap)
    if (sql.includes('CREATE TABLE IF NOT EXISTS')) {
      this.isCleared = false;
    }
  }

  async runAsync(sql: string, ...params: (string | number | null)[]): Promise<unknown> {
    if (this.isCleared && !sql.includes('CREATE TABLE')) {
      throw new Error('Database is cleared, must re-bootstrap before use');
    }

    if (sql.includes('schema_migrations')) {
      const version = Number(params[0]);
      this.migrations.add(version);
      return;
    }

    if (sql.includes('INSERT OR IGNORE INTO question_catalog')) {
      const [id, prompt, axisId, agreePoleId, pool, isActive, metadataJson, sortIndex] = params as [
        string,
        string,
        string,
        string,
        string,
        number,
        string | null,
        number,
      ];

      if (!this.questionCatalog.has(id)) {
        this.questionCatalog.set(id, {
          id,
          prompt,
          axisId,
          agreePoleId,
          pool,
          isActive,
          metadataJson,
          sortIndex,
        });
      }
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

  async getAllAsync<T>(sql: string): Promise<T[]> {
    if (sql.includes('FROM question_catalog')) {
      return [...this.questionCatalog.values()]
        .sort((a, b) => a.sortIndex - b.sortIndex || a.id.localeCompare(b.id))
        .map((record) => ({
          id: record.id,
          prompt: record.prompt,
          axis_id: record.axisId,
          agree_pole_id: record.agreePoleId,
          pool: record.pool,
          is_active: record.isActive,
          metadata_json: record.metadataJson,
          sort_index: record.sortIndex,
        })) as T[];
    }

    return [];
  }

  hasMigration(version: number): boolean {
    return this.migrations.has(version);
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
    expect(result.schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.catalogQuestionCount).toBe(QUESTIONS.length);
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
    expect(secondRun.catalogQuestionCount).toBe(QUESTIONS.length);
    expect(secondRun.initializedAt).toBe(firstRun.initializedAt);
    expect(new Date(secondRun.lastBootstrapAt).getTime()).toBeGreaterThanOrEqual(
      new Date(firstRun.lastBootstrapAt).getTime()
    );
  });

  it('reads question catalog with the same stable order after restart', async () => {
    const adapter = new FakeDatabaseAdapter();

    await bootstrapLocalData(adapter);
    const firstCatalogRead = await readQuestionCatalog(adapter);

    await bootstrapLocalData(adapter);
    const secondCatalogRead = await readQuestionCatalog(adapter);

    expect(firstCatalogRead.map((question) => question.id)).toEqual(
      QUESTIONS.map((question) => question.id)
    );
    expect(secondCatalogRead).toEqual(firstCatalogRead);
  });
});

describe('clearLocalData', () => {
  it('clears all persisted app state and returns clearedAt timestamp', async () => {
    const adapter = new FakeDatabaseAdapter();

    await bootstrapLocalData(adapter);
    expect(adapter.hasMigration(SCHEMA_VERSION)).toBe(true);
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
    expect(secondRun.schemaVersion).toBe(SCHEMA_VERSION);
    expect(secondRun.catalogQuestionCount).toBe(QUESTIONS.length);
  });

  it('produces consistent catalog after clear and re-bootstrap', async () => {
    const adapter = new FakeDatabaseAdapter();

    await bootstrapLocalData(adapter);
    const firstCatalog = await readQuestionCatalog(adapter);

    await clearLocalData(adapter);
    await bootstrapLocalData(adapter);

    const secondCatalog = await readQuestionCatalog(adapter);

    expect(secondCatalog).toEqual(firstCatalog);
    expect(secondCatalog.map((q) => q.id)).toEqual(QUESTIONS.map((q) => q.id));
  });
});
