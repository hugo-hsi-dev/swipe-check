import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import {
  bootstrapLocalData,
  clearLocalData,
  readQuestionCatalog,
  migrateToSchemaV4,
  type BootstrapResult,
  type ClearResult,
  type LocalDatabaseAdapter,
} from '@/lib/local-data/bootstrap';
import type { Question } from '@/constants/question-contract';

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
let schemaVersion: number | null = null;
let bootstrapGeneration = 0;

export function getSchemaVersion(): number | null {
  return schemaVersion;
}

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
      const result = await bootstrapLocalData(adapter);

      if (result.schemaVersion < 4) {
        await migrateToSchemaV4(adapter);
      }

      schemaVersion = result.schemaVersion;

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

export async function getStoredQuestionsSQLite(dbName = 'swipe-check.db'): Promise<Question[]> {
  const { adapter } = await openAdapter(dbName);
  return readQuestionCatalog(adapter);
}

export async function clearSQLiteData(dbName = 'swipe-check.db'): Promise<ClearResult> {
  const db = await getBootstrappedSQLiteDatabase(dbName);
  const adapter = new ExpoSQLiteAdapter(db);

  const result = await clearLocalData(adapter);

  bootstrapPromise = null;
  bootstrapGeneration++;

  const rebootstrapResult = await bootstrapLocalData(adapter);
  schemaVersion = rebootstrapResult.schemaVersion;

  return result;
}
