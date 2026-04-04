import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import {
  bootstrapLocalData,
  clearLocalData,
  type BootstrapResult,
  type ClearResult,
  type LocalDatabaseAdapter,
} from '@/lib/local-data/bootstrap';

class ExpoSQLiteAdapter implements LocalDatabaseAdapter {
  constructor(private readonly db: SQLiteDatabase) {}

  execAsync(sql: string): Promise<void> {
    return this.db.execAsync(sql);
  }

  runAsync(sql: string, ...params: (string | number | null)[]): Promise<unknown> {
    return this.db.runAsync(sql, ...params);
  }

  getFirstAsync<T>(sql: string, ...params: (string | number | null)[]): Promise<T | null> {
    return this.db.getFirstAsync<T>(sql, ...params);
  }

  getAllAsync<T>(sql: string, ...params: (string | number | null)[]): Promise<T[]> {
    return this.db.getAllAsync<T>(sql, ...params);
  }
}

type InitializedSQLite = {
  db: SQLiteDatabase;
  result: BootstrapResult;
};

type OpenedSQLite = {
  db: SQLiteDatabase;
  adapter: ExpoSQLiteAdapter;
};

let bootstrapPromise: Promise<InitializedSQLite> | null = null;
let bootstrapGeneration = 0;

export function getBootstrapGeneration(): number {
  return bootstrapGeneration;
}

async function openAdapter(dbName: string): Promise<OpenedSQLite> {
  const db = await openDatabaseAsync(dbName);
  await db.execAsync('PRAGMA foreign_keys = ON;');
  return {
    db,
    adapter: new ExpoSQLiteAdapter(db),
  };
}

async function initializeSQLite(dbName: string): Promise<InitializedSQLite> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const { db, adapter } = await openAdapter(dbName);

      // Pre-MVP policy: discard any existing local database on startup.
      // This app has no users yet and schema changes are frequent, so
      // preserving upgrade paths is not worth the complexity. A proper
      // migration pipeline will be added post-MVP.
      await clearLocalData(adapter);

      const result = await bootstrapLocalData(adapter);

      return {
        db,
        result,
      };
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
}

export async function bootstrapSQLite(dbName = 'swipe-check.db'): Promise<BootstrapResult> {
  const { result } = await initializeSQLite(dbName);
  return result;
}

export async function getBootstrappedSQLiteDatabase(
  dbName = 'swipe-check.db'
): Promise<SQLiteDatabase> {
  const { db } = await initializeSQLite(dbName);
  return db;
}

export async function clearSQLiteData(dbName = 'swipe-check.db'): Promise<ClearResult> {
  const db = await getBootstrappedSQLiteDatabase(dbName);
  const adapter = new ExpoSQLiteAdapter(db);

  const result = await clearLocalData(adapter);

  bootstrapPromise = null;
  bootstrapGeneration++;

  const rebootstrapResult = await bootstrapLocalData(adapter);

  return result;
}
