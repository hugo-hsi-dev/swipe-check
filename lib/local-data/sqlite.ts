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

export type ExportedUserData = {
  exportedAt: string;
  version: number;
  sessions: Array<{
    id: string;
    type: string;
    status: string;
    localDayKey: string | null;
    startedAt: string;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  sessionAnswers: Array<{
    sessionId: string;
    questionId: string;
    questionText: string;
    answer: string;
    answeredAt: string;
  }>;
  typeSnapshots: Array<{
    id: string;
    currentType: string;
    axisScores: Record<string, number>;
    axisStrengths: Record<string, number>;
    sourceType: string;
    sourceSessionId: string | null;
    questionCount: number;
    createdAt: string;
  }>;
};

export async function exportUserData(dbName = 'swipe-check.db'): Promise<ExportedUserData> {
  const db = await getBootstrappedSQLiteDatabase(dbName);
  const adapter = new ExpoSQLiteAdapter(db);

  const sessionRows = await adapter.getAllAsync<{
    id: string;
    session_type: string;
    status: string;
    local_day_key: string | null;
    started_at: string;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM sessions ORDER BY created_at ASC;');

  const answerRows = await adapter.getAllAsync<{
    session_id: string;
    question_id: string;
    question_text: string;
    answer: string;
    answered_at: string;
  }>('SELECT * FROM session_answers ORDER BY answered_at ASC;');

  const snapshotRows = await adapter.getAllAsync<{
    id: string;
    current_type: string;
    axis_scores_json: string;
    axis_strengths_json: string;
    source_type: string;
    source_session_id: string | null;
    question_count: number;
    created_at: string;
  }>('SELECT * FROM type_snapshots ORDER BY created_at ASC;');

  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    sessions: sessionRows.map((row) => ({
      id: row.id,
      type: row.session_type,
      status: row.status,
      localDayKey: row.local_day_key,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    sessionAnswers: answerRows.map((row) => ({
      sessionId: row.session_id,
      questionId: row.question_id,
      questionText: row.question_text,
      answer: row.answer,
      answeredAt: row.answered_at,
    })),
    typeSnapshots: snapshotRows.map((row) => ({
      id: row.id,
      currentType: row.current_type,
      axisScores: JSON.parse(row.axis_scores_json),
      axisStrengths: JSON.parse(row.axis_strengths_json),
      sourceType: row.source_type,
      sourceSessionId: row.source_session_id,
      questionCount: row.question_count,
      createdAt: row.created_at,
    })),
  };
}
