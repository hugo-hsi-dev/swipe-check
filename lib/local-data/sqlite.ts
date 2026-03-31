import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import {
  bootstrapLocalData,
  readQuestionCatalog,
  type BootstrapResult,
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

async function openAdapter(dbName: string): Promise<ExpoSQLiteAdapter> {
  const db = await openDatabaseAsync(dbName);
  return new ExpoSQLiteAdapter(db);
}

export async function bootstrapSQLite(dbName = 'swipe-check.db'): Promise<BootstrapResult> {
  const adapter = await openAdapter(dbName);
  return bootstrapLocalData(adapter);
}

export async function getStoredQuestionsSQLite(dbName = 'swipe-check.db'): Promise<Question[]> {
  const adapter = await openAdapter(dbName);
  return readQuestionCatalog(adapter);
}
