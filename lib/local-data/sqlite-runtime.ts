import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import type { LocalDatabaseAdapter } from '@/lib/local-data/bootstrap';

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

let cachedDb: SQLiteDatabase | null = null;

export async function getSQLiteDatabase(dbName = 'swipe-check.db'): Promise<LocalDatabaseAdapter> {
  if (cachedDb) {
    return new ExpoSQLiteAdapter(cachedDb);
  }

  const db = await openDatabaseAsync(dbName);
  await db.execAsync('PRAGMA foreign_keys = ON;');
  cachedDb = db;
  return new ExpoSQLiteAdapter(db);
}
