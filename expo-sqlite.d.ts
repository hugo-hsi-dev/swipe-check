declare module 'expo-sqlite' {
  export type SQLiteDatabase = {
    execAsync(sql: string): Promise<void>;
    runAsync(sql: string, ...params: (string | number | null)[]): Promise<unknown>;
    getFirstAsync<T>(sql: string, ...params: (string | number | null)[]): Promise<T | null>;
  };

  export function openDatabaseAsync(name: string): Promise<SQLiteDatabase>;
}
