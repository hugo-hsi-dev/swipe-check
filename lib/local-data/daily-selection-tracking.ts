import type {
  AxisExposureMap,
  AxisPoleExposureMap,
  DailySelectionInput,
  QuestionLastUsedMap,
} from '@/constants/daily-selection';
import {
  createEmptyAxisExposure,
  createEmptyAxisPoleExposure,
  selectDailyQuestions,
  updateAxisExposure,
  updateAxisPoleExposure,
  updateQuestionLastUsed,
} from '@/constants/daily-selection';
import type { LocalDatabaseAdapter } from '@/lib/local-data/bootstrap';

type DailyTrackingMeta = {
  axisExposure: AxisExposureMap;
  axisPoleExposure: AxisPoleExposureMap;
  questionLastUsed: QuestionLastUsedMap;
};

function getMetaKey(key: string): string {
  return `daily_tracking_${key}`;
}

async function readTrackingMeta(
  adapter: LocalDatabaseAdapter
): Promise<DailyTrackingMeta> {
  const axisExposureRow = await adapter.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ? LIMIT 1;',
    getMetaKey('axis_exposure')
  );

  const axisPoleExposureRow = await adapter.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ? LIMIT 1;',
    getMetaKey('axis_pole_exposure')
  );

  const questionLastUsedRow = await adapter.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ? LIMIT 1;',
    getMetaKey('question_last_used')
  );

  return {
    axisExposure: axisExposureRow?.value
      ? (JSON.parse(axisExposureRow.value) as AxisExposureMap)
      : createEmptyAxisExposure(),
    axisPoleExposure: axisPoleExposureRow?.value
      ? (JSON.parse(axisPoleExposureRow.value) as AxisPoleExposureMap)
      : createEmptyAxisPoleExposure(),
    questionLastUsed: questionLastUsedRow?.value
      ? (JSON.parse(questionLastUsedRow.value) as QuestionLastUsedMap)
      : {},
  };
}

async function writeTrackingMeta(
  adapter: LocalDatabaseAdapter,
  meta: DailyTrackingMeta,
  now = new Date()
): Promise<void> {
  const nowIso = now.toISOString();

  await adapter.runAsync(
    `INSERT OR REPLACE INTO app_meta (key, value, updated_at) VALUES (?, ?, ?);`,
    getMetaKey('axis_exposure'),
    JSON.stringify(meta.axisExposure),
    nowIso
  );

  await adapter.runAsync(
    `INSERT OR REPLACE INTO app_meta (key, value, updated_at) VALUES (?, ?, ?);`,
    getMetaKey('axis_pole_exposure'),
    JSON.stringify(meta.axisPoleExposure),
    nowIso
  );

  await adapter.runAsync(
    `INSERT OR REPLACE INTO app_meta (key, value, updated_at) VALUES (?, ?, ?);`,
    getMetaKey('question_last_used'),
    JSON.stringify(meta.questionLastUsed),
    nowIso
  );
}

async function readYesterdaySession(
  adapter: LocalDatabaseAdapter,
  yesterdayKey: string
): Promise<{ date: string; questionIds: string[] } | undefined> {
  // Find yesterday's completed daily session
  const sessionRow = await adapter.getFirstAsync<{ id: string }>(
    `SELECT id FROM sessions 
     WHERE session_type = 'daily' 
     AND local_day_key = ? 
     AND status = 'completed'
     LIMIT 1;`,
    yesterdayKey
  );

  if (!sessionRow) {
    return undefined;
  }

  // Get the question IDs from that session
  const answerRows = await adapter.getAllAsync<{ question_id: string }>(
    `SELECT question_id FROM session_answers 
     WHERE session_id = ? 
     ORDER BY answered_at ASC;`,
    sessionRow.id
  );

  if (answerRows.length === 0) {
    return undefined;
  }

  return {
    date: yesterdayKey,
    questionIds: answerRows.map((r) => r.question_id),
  };
}

export type DailyQuestionsSelection = {
  questionIds: string[];
  selectedAxisIds: string[];
};

/**
 * Select daily questions for today and store the selection.
 * Uses tracking data to ensure balanced rotation.
 */
export async function selectAndStoreDailyQuestions(
  adapter: LocalDatabaseAdapter,
  todayKey: string,
  yesterdayKey: string
): Promise<DailyQuestionsSelection> {
  const tracking = await readTrackingMeta(adapter);
  const yesterdaySession = await readYesterdaySession(adapter, yesterdayKey);

  const input: DailySelectionInput = {
    today: todayKey,
    axisExposure: tracking.axisExposure,
    axisPoleExposure: tracking.axisPoleExposure,
    questionLastUsed: tracking.questionLastUsed,
    yesterdaySession,
  };

  const result = selectDailyQuestions(input);

  return {
    questionIds: result.questions.map((q) => q.id),
    selectedAxisIds: result.selectedAxisIds,
  };
}

/**
 * Read stored daily question selection for a session.
 * Returns null if no selection exists.
 */
export async function readStoredDailyQuestionSelection(
  adapter: LocalDatabaseAdapter,
  sessionId: string
): Promise<DailyQuestionsSelection | null> {
  const row = await adapter.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ? LIMIT 1;',
    `daily_session_questions_${sessionId}`
  );

  if (!row?.value) {
    return null;
  }

  return JSON.parse(row.value) as DailyQuestionsSelection;
}

/**
 * Store daily question selection for a session.
 */
export async function storeDailyQuestionSelection(
  adapter: LocalDatabaseAdapter,
  sessionId: string,
  selection: DailyQuestionsSelection,
  now = new Date()
): Promise<void> {
  await adapter.runAsync(
    `INSERT OR REPLACE INTO app_meta (key, value, updated_at) VALUES (?, ?, ?);`,
    `daily_session_questions_${sessionId}`,
    JSON.stringify(selection),
    now.toISOString()
  );
}

/**
 * Update tracking data after a daily session is completed.
 * This updates axis exposure and question last-used timestamps.
 */
export async function updateTrackingAfterDailyCompletion(
  adapter: LocalDatabaseAdapter,
  completedQuestionIds: string[],
  now = new Date()
): Promise<void> {
  const tracking = await readTrackingMeta(adapter);

  const updatedTracking: DailyTrackingMeta = {
    axisExposure: updateAxisExposure(tracking.axisExposure, completedQuestionIds),
    axisPoleExposure: updateAxisPoleExposure(
      tracking.axisPoleExposure,
      completedQuestionIds
    ),
    questionLastUsed: updateQuestionLastUsed(
      tracking.questionLastUsed,
      completedQuestionIds,
      now.getTime()
    ),
  };

  await writeTrackingMeta(adapter, updatedTracking, now);
}

/**
 * Get or create the daily question selection for a session.
 * If selection already exists, returns it; otherwise creates new selection.
 */
export async function getOrCreateDailyQuestionSelection(
  adapter: LocalDatabaseAdapter,
  sessionId: string,
  todayKey: string,
  yesterdayKey: string
): Promise<DailyQuestionsSelection> {
  const existing = await readStoredDailyQuestionSelection(adapter, sessionId);
  if (existing) {
    return existing;
  }

  const selection = await selectAndStoreDailyQuestions(
    adapter,
    todayKey,
    yesterdayKey
  );
  await storeDailyQuestionSelection(adapter, sessionId, selection);
  return selection;
}
