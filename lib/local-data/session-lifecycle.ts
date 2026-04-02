import type { QuestionResponse } from '@/constants/question-contract';
import type { TypeSnapshot } from '@/constants/scoring-contract';
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

export type PersistedHistoryEntry = {
  session: PersistedSession;
  snapshot: TypeSnapshot | null;
};

export type PersistedSessionDetail = {
  session: PersistedSession;
  answers: PersistedSessionAnswer[];
  snapshot: TypeSnapshot | null;
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

type TypeSnapshotRow = {
  id: string;
  session_id: string | null;
  current_type: string;
  axis_scores_json: string;
  axis_strengths_json: string;
  source_type: TypeSnapshot['source']['type'];
  source_session_id: string | null;
  question_count: number;
  created_at: string;
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

  const result = await adapter.runAsync(
    `INSERT INTO session_answers
     (session_id, question_id, answer, answered_at, created_at, updated_at)
     SELECT ?, ?, ?, ?, ?, ?
     WHERE EXISTS (
       SELECT 1
       FROM sessions
       WHERE id = ? AND status = 'in_progress'
     )
     ON CONFLICT(session_id, question_id) DO UPDATE SET
       answer = excluded.answer,
       answered_at = excluded.answered_at,
       updated_at = excluded.updated_at;`,
    sessionId,
    questionId,
    answer,
    answeredAtIso,
    answeredAtIso,
    answeredAtIso,
    sessionId
  );

  if (typeof result === 'object' && result !== null && 'changes' in result && (result as { changes?: number }).changes === 0) {
    throw new Error('Cannot modify answers for a completed session.');
  }
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

export class OnboardingCompletionError extends Error {
  constructor(
    message: string,
    public readonly requiredCount: number,
    public readonly currentCount: number
  ) {
    super(message);
    this.name = 'OnboardingCompletionError';
  }
}

/**
 * Complete an onboarding session with snapshot creation.
 * Validates that exactly 12 answers exist before completing.
 * Creates and stores a TypeSnapshot tied to the completed session.
 *
 * @throws OnboardingCompletionError if less than 12 answers exist
 */
export async function completeOnboardingSession(
  adapter: LocalDatabaseAdapter,
  sessionId: string,
  snapshot: TypeSnapshot,
  completedAt = new Date()
): Promise<void> {
  // Validate session exists and is in_progress onboarding
  const sessionRow = await adapter.getFirstAsync<SessionRow>(
    `SELECT id, session_type, status
     FROM sessions
     WHERE id = ? AND session_type = 'onboarding' AND status = 'in_progress'
     LIMIT 1;`,
    sessionId
  );

  if (!sessionRow) {
    throw new OnboardingCompletionError(
      'Onboarding session not found or already completed',
      12,
      0
    );
  }

  // Count existing answers
  const answerCountRow = await adapter.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM session_answers
     WHERE session_id = ?;`,
    sessionId
  );

  const answerCount = answerCountRow?.count ?? 0;

  if (answerCount < 12) {
    throw new OnboardingCompletionError(
      `Onboarding requires 12 answers, but only ${answerCount} provided`,
      12,
      answerCount
    );
  }

  // Store the snapshot
  await upsertTypeSnapshot(adapter, snapshot);

  // Mark session as completed
  await completeSession(adapter, sessionId, completedAt);
}

export async function hasCompletedOnboardingSession(adapter: LocalDatabaseAdapter): Promise<boolean> {
  const row = await adapter.getFirstAsync<{ id: string }>(
    `SELECT id
     FROM sessions
     WHERE session_type = 'onboarding' AND status = 'completed'
     LIMIT 1;`
  );

  return row != null;
}

export async function resetOnboardingData(adapter: LocalDatabaseAdapter): Promise<void> {
  const onboardingSessions = await adapter.getAllAsync<{ id: string }>(
    `SELECT id
     FROM sessions
     WHERE session_type = 'onboarding'
     ORDER BY started_at ASC, id ASC;`
  );

  if (onboardingSessions.length === 0) {
    return;
  }

  await adapter.execAsync('BEGIN IMMEDIATE;');

  try {
    await adapter.runAsync(`DELETE FROM type_snapshots WHERE source_type = 'onboarding';`);

    for (const session of onboardingSessions) {
      await adapter.runAsync('DELETE FROM session_answers WHERE session_id = ?;', session.id);
      await adapter.runAsync(
        `DELETE FROM sessions
         WHERE id = ? AND session_type = 'onboarding';`,
        session.id
      );
    }

    await adapter.execAsync('COMMIT;');
  } catch (error) {
    await adapter.execAsync('ROLLBACK;');
    throw error;
  }
}

export async function readActiveOrLatestDailySession(
  adapter: LocalDatabaseAdapter
): Promise<PersistedSession | null> {
  const row = await adapter.getFirstAsync<SessionRow>(
    `SELECT id, session_type, status, local_day_key, started_at, completed_at, created_at, updated_at
     FROM sessions
     WHERE session_type = 'daily'
     ORDER BY
      CASE WHEN status = 'in_progress' THEN 0 ELSE 1 END ASC,
      started_at DESC,
      id DESC
     LIMIT 1;`
  );

  return row ? mapSessionRow(row) : null;
}

function mapTypeSnapshotRow(row: TypeSnapshotRow): TypeSnapshot {
  return {
    id: row.id,
    currentType: row.current_type,
    axisScores: JSON.parse(row.axis_scores_json),
    axisStrengths: JSON.parse(row.axis_strengths_json),
    createdAt: new Date(row.created_at),
    source: {
      type: row.source_type,
      sessionId: row.source_session_id ?? undefined,
    },
    questionCount: row.question_count,
  };
}

export async function upsertTypeSnapshot(
  adapter: LocalDatabaseAdapter,
  snapshot: TypeSnapshot
): Promise<void> {
  const nowIso = new Date().toISOString();
  const createdAtIso = snapshot.createdAt.toISOString();
  const sessionId = snapshot.source.sessionId ?? null;

  await adapter.runAsync(
    `INSERT INTO type_snapshots
     (id, session_id, current_type, axis_scores_json, axis_strengths_json, source_type, source_session_id, question_count, created_at, inserted_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      session_id = excluded.session_id,
      current_type = excluded.current_type,
      axis_scores_json = excluded.axis_scores_json,
      axis_strengths_json = excluded.axis_strengths_json,
      source_type = excluded.source_type,
      source_session_id = excluded.source_session_id,
      question_count = excluded.question_count,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at;`,
    snapshot.id,
    sessionId,
    snapshot.currentType,
    JSON.stringify(snapshot.axisScores),
    JSON.stringify(snapshot.axisStrengths),
    snapshot.source.type,
    sessionId,
    snapshot.questionCount,
    createdAtIso,
    nowIso,
    nowIso
  );
}

export async function readSessionTypeSnapshot(
  adapter: LocalDatabaseAdapter,
  sessionId: string
): Promise<TypeSnapshot | null> {
  const row = await adapter.getFirstAsync<TypeSnapshotRow>(
    `SELECT id, session_id, current_type, axis_scores_json, axis_strengths_json, source_type, source_session_id, question_count, created_at
     FROM type_snapshots
     WHERE session_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT 1;`,
    sessionId
  );

  return row ? mapTypeSnapshotRow(row) : null;
}

export async function readAllTypeSnapshots(adapter: LocalDatabaseAdapter): Promise<TypeSnapshot[]> {
  const rows = await adapter.getAllAsync<TypeSnapshotRow>(
    `SELECT id, session_id, current_type, axis_scores_json, axis_strengths_json, source_type, source_session_id, question_count, created_at
     FROM type_snapshots
     ORDER BY created_at ASC, id ASC;`
  );

  return rows.map(mapTypeSnapshotRow);
}

export async function readLatestTypeSnapshot(
  adapter: LocalDatabaseAdapter
): Promise<TypeSnapshot | null> {
  const row = await adapter.getFirstAsync<TypeSnapshotRow>(
    `SELECT id, session_id, current_type, axis_scores_json, axis_strengths_json, source_type, source_session_id, question_count, created_at
     FROM type_snapshots
     ORDER BY created_at DESC, id DESC
     LIMIT 1;`
  );

  return row ? mapTypeSnapshotRow(row) : null;
}

export async function readCompletedSessionHistory(
  adapter: LocalDatabaseAdapter,
  limit?: number
): Promise<PersistedHistoryEntry[]> {
  const normalizedLimit = typeof limit === 'number' ? Math.max(0, Math.trunc(limit)) : null;
  const rows = await adapter.getAllAsync<
    SessionRow & {
      snapshot_id: string | null;
      snapshot_session_id: string | null;
      current_type: string | null;
      axis_scores_json: string | null;
      axis_strengths_json: string | null;
      source_type: TypeSnapshot['source']['type'] | null;
      source_session_id: string | null;
      question_count: number | null;
      snapshot_created_at: string | null;
    }
  >(
    `SELECT
      s.id, s.session_type, s.status, s.local_day_key, s.started_at, s.completed_at, s.created_at, s.updated_at,
      ts.id AS snapshot_id, ts.session_id AS snapshot_session_id, ts.current_type, ts.axis_scores_json, ts.axis_strengths_json,
      ts.source_type, ts.source_session_id, ts.question_count, ts.created_at AS snapshot_created_at
     FROM sessions s
     LEFT JOIN type_snapshots ts ON ts.id = (
      SELECT candidate.id
      FROM type_snapshots candidate
      WHERE candidate.session_id = s.id
      ORDER BY candidate.created_at DESC, candidate.id DESC
      LIMIT 1
     )
     WHERE s.status = 'completed'
     ORDER BY s.completed_at DESC, s.started_at DESC, s.id DESC
     LIMIT ?;`,
    normalizedLimit ?? -1
  );

  const history = rows.map((row) => ({
    session: mapSessionRow(row),
    snapshot:
      row.snapshot_id &&
      row.current_type &&
      row.axis_scores_json &&
      row.axis_strengths_json &&
      row.source_type &&
      row.question_count != null &&
      row.snapshot_created_at
        ? mapTypeSnapshotRow({
            id: row.snapshot_id,
            session_id: row.snapshot_session_id,
            current_type: row.current_type,
            axis_scores_json: row.axis_scores_json,
            axis_strengths_json: row.axis_strengths_json,
            source_type: row.source_type,
            source_session_id: row.source_session_id,
            question_count: row.question_count,
            created_at: row.snapshot_created_at,
          })
        : null,
  }));

  return history;
}

export async function readCompletedSessionDetail(
  adapter: LocalDatabaseAdapter,
  sessionId: string
): Promise<PersistedSessionDetail | null> {
  const sessionRow = await adapter.getFirstAsync<SessionRow>(
    `SELECT id, session_type, status, local_day_key, started_at, completed_at, created_at, updated_at
     FROM sessions
     WHERE id = ? AND status = 'completed'
     LIMIT 1;`,
    sessionId
  );

  if (!sessionRow) {
    return null;
  }

  const session = mapSessionRow(sessionRow);
  const answers = await readSessionAnswers(adapter, sessionId);
  const snapshot = await readSessionTypeSnapshot(adapter, sessionId);

  return {
    session,
    answers,
    snapshot,
  };
}

export async function clearDailySessionForLocalDay(
  adapter: LocalDatabaseAdapter,
  localDayKey: string
): Promise<string | null> {
  const session = await getDailySessionForLocalDay(adapter, localDayKey);

  if (!session) {
    return null;
  }

  await adapter.execAsync('BEGIN IMMEDIATE;');

  try {
    await adapter.runAsync('DELETE FROM session_answers WHERE session_id = ?;', session.id);
    await adapter.runAsync(
      'DELETE FROM type_snapshots WHERE session_id = ? OR source_session_id = ?;',
      session.id,
      session.id
    );
    await adapter.runAsync(
      'DELETE FROM app_meta WHERE key = ?;',
      `daily_session_questions_${session.id}`
    );
    await adapter.runAsync('DELETE FROM sessions WHERE id = ?;', session.id);

    await adapter.execAsync('COMMIT;');

    return session.id;
  } catch (error) {
    await adapter.execAsync('ROLLBACK;');
    throw error;
  }
}

export function toLocalDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}
