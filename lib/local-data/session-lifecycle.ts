import type { QuestionResponse } from '@/constants/question-contract';
import type { LocalDatabaseAdapter } from '@/lib/local-data/bootstrap';

export type PersistedSessionType = 'onboarding' | 'daily';
export type PersistedSessionStatus = 'in_progress' | 'completed';

export type PersistedSession = {
  id: string;
  type: PersistedSessionType;
  status: PersistedSessionStatus;
  localDayKey: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PersistedSessionAnswer = {
  sessionId: string;
  questionId: string;
  answer: QuestionResponse;
  answeredAt: string;
};

type SessionRow = {
  id: string;
  session_type: PersistedSessionType;
  status: PersistedSessionStatus;
  local_day_key: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type SessionAnswerRow = {
  session_id: string;
  question_id: string;
  answer: QuestionResponse;
  answered_at: string;
};

function createSessionId(): string {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mapSessionRow(row: SessionRow): PersistedSession {
  return {
    id: row.id,
    type: row.session_type,
    status: row.status,
    localDayKey: row.local_day_key,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getInProgressOnboardingSession(
  adapter: LocalDatabaseAdapter
): Promise<PersistedSession | null> {
  const row = await adapter.getFirstAsync<SessionRow>(
    `SELECT id, session_type, status, local_day_key, started_at, completed_at, created_at, updated_at
     FROM sessions
     WHERE session_type = 'onboarding' AND status = 'in_progress'
     ORDER BY started_at DESC
     LIMIT 1;`
  );

  return row ? mapSessionRow(row) : null;
}

export async function startOrResumeOnboardingSession(
  adapter: LocalDatabaseAdapter,
  now = new Date()
): Promise<PersistedSession> {
  const existing = await getInProgressOnboardingSession(adapter);
  if (existing) {
    return existing;
  }

  const nowIso = now.toISOString();
  const sessionId = createSessionId();

  await adapter.runAsync(
    `INSERT INTO sessions
     (id, session_type, status, local_day_key, started_at, completed_at, created_at, updated_at)
     VALUES (?, 'onboarding', 'in_progress', NULL, ?, NULL, ?, ?);`,
    sessionId,
    nowIso,
    nowIso,
    nowIso
  );

  return {
    id: sessionId,
    type: 'onboarding',
    status: 'in_progress',
    localDayKey: null,
    startedAt: nowIso,
    completedAt: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export async function getDailySessionForLocalDay(
  adapter: LocalDatabaseAdapter,
  localDayKey: string
): Promise<PersistedSession | null> {
  const row = await adapter.getFirstAsync<SessionRow>(
    `SELECT id, session_type, status, local_day_key, started_at, completed_at, created_at, updated_at
     FROM sessions
     WHERE session_type = 'daily' AND local_day_key = ?
     ORDER BY started_at DESC
     LIMIT 1;`,
    localDayKey
  );

  return row ? mapSessionRow(row) : null;
}

export async function getOrCreateDailySessionForLocalDay(
  adapter: LocalDatabaseAdapter,
  localDayKey: string,
  now = new Date()
): Promise<PersistedSession> {
  const existing = await getDailySessionForLocalDay(adapter, localDayKey);
  if (existing) {
    return existing;
  }

  const nowIso = now.toISOString();
  const sessionId = createSessionId();

  await adapter.runAsync(
    `INSERT INTO sessions
     (id, session_type, status, local_day_key, started_at, completed_at, created_at, updated_at)
     VALUES (?, 'daily', 'in_progress', ?, ?, NULL, ?, ?);`,
    sessionId,
    localDayKey,
    nowIso,
    nowIso,
    nowIso
  );

  return {
    id: sessionId,
    type: 'daily',
    status: 'in_progress',
    localDayKey,
    startedAt: nowIso,
    completedAt: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export async function upsertSessionAnswer(
  adapter: LocalDatabaseAdapter,
  sessionId: string,
  questionId: string,
  answer: QuestionResponse,
  answeredAt = new Date()
): Promise<void> {
  const answeredAtIso = answeredAt.toISOString();

  await adapter.runAsync(
    `INSERT INTO session_answers
     (session_id, question_id, answer, answered_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(session_id, question_id) DO UPDATE SET
       answer = excluded.answer,
       answered_at = excluded.answered_at,
       updated_at = excluded.updated_at;`,
    sessionId,
    questionId,
    answer,
    answeredAtIso,
    answeredAtIso,
    answeredAtIso
  );
}

export async function readSessionAnswers(
  adapter: LocalDatabaseAdapter,
  sessionId: string
): Promise<PersistedSessionAnswer[]> {
  const rows = await adapter.getAllAsync<SessionAnswerRow>(
    `SELECT session_id, question_id, answer, answered_at
     FROM session_answers
     WHERE session_id = ?
     ORDER BY answered_at ASC, question_id ASC;`,
    sessionId
  );

  return rows.map((row) => ({
    sessionId: row.session_id,
    questionId: row.question_id,
    answer: row.answer,
    answeredAt: row.answered_at,
  }));
}

export async function completeSession(
  adapter: LocalDatabaseAdapter,
  sessionId: string,
  completedAt = new Date()
): Promise<void> {
  const completedAtIso = completedAt.toISOString();

  await adapter.runAsync(
    `UPDATE sessions
     SET status = 'completed', completed_at = ?, updated_at = ?
     WHERE id = ?;`,
    completedAtIso,
    completedAtIso,
    sessionId
  );
}

export function toLocalDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}
