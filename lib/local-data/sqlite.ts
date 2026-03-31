import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { bootstrapLocalData, type BootstrapResult, type LocalDatabaseAdapter } from '@/lib/local-data/bootstrap';

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
}

export async function bootstrapSQLite(dbName = 'swipe-check.db'): Promise<BootstrapResult> {
  const db = await openDatabaseAsync(dbName);
  const adapter = new ExpoSQLiteAdapter(db);
  return bootstrapLocalData(adapter);
}
