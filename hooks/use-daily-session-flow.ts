import { useCallback, useEffect, useState } from 'react';

import type { Question, QuestionResponse } from '@/constants/question-contract';
import { getQuestionById, AXES } from '@/constants/questions';
import type { TypeSnapshot } from '@/constants/scoring-contract';
import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import {
  completeDailySessionAtomic,
  getOrCreateDailySessionForLocalDay,
  readSessionAnswers,
  toLocalDayKey,
  type PersistedSession,
  type PersistedSessionAnswer,
  upsertSessionAnswer,
} from '@/lib/local-data/session-lifecycle';
import {
  getOrCreateDailyQuestionSelection,
  type DailyQuestionsSelection,
} from '@/lib/local-data/daily-selection-tracking';
import { createTypeSnapshot } from '@/lib/scoring';

export type DailySessionQuestionState = {
  question: Question;
  answer: QuestionResponse | null;
  answeredAt: Date | null;
};

export type DailySessionPhase = 'loading' | 'active' | 'completed' | 'error';

export type DailySessionFlowController = {
  /** Current phase of the session */
  phase: DailySessionPhase;
  /** The daily session */
  session: PersistedSession | null;
  /** The 3 daily questions with their answers */
  questions: DailySessionQuestionState[];
  /** Index of the current question (0-2), or -1 if all completed */
  currentQuestionIndex: number;
  /** Number of questions answered */
  answeredCount: number;
  /** Total number of questions (always 3) */
  totalCount: number;
  /** Progress percentage (0-100) */
  progressPercentage: number;
  /** Whether an operation is in progress */
  isSubmitting: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Submit an answer for the current question */
  submitAnswer: (response: QuestionResponse) => Promise<void>;
};

function getYesterdayKey(todayKey: string): string {
  const [year, month, day] = todayKey.split('-').map(Number);
  const today = new Date(year, month - 1, day);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yYear = yesterday.getFullYear();
  const yMonth = `${yesterday.getMonth() + 1}`.padStart(2, '0');
  const yDay = `${yesterday.getDate()}`.padStart(2, '0');

  return `${yYear}-${yMonth}-${yDay}`;
}

function resolveSupportedPoleId(
  question: Question,
  response: QuestionResponse
): string | null {
  if (response === 'agree') {
    return question.agreePoleId;
  }

  // For disagree, find the opposite pole
  const axis = AXES.find((a) => a.id === question.axisId);
  if (!axis) return null;

  return question.agreePoleId === axis.poleA.id ? axis.poleB.id : axis.poleA.id;
}

/**
 * Hook to manage the daily swipe session flow.
 *
 * Provides:
 * - Access to the 3 selected daily questions
 * - One-question-at-a-time presentation
 * - Swipe-based answer submission (Agree/Disagree)
 * - Immediate persistence after each answer
 * - Progress tracking
 * - Automatic completion after 3 answers
 * - Completed state with type snapshot creation
 */
export function useDailySessionFlow(): DailySessionFlowController {
  const [phase, setPhase] = useState<DailySessionPhase>('loading');
  const [session, setSession] = useState<PersistedSession | null>(null);
  const [selection, setSelection] = useState<DailyQuestionsSelection | null>(null);
  const [answers, setAnswers] = useState<PersistedSessionAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    setPhase('loading');
    setError(null);

    try {
      const db = await getSQLiteDatabase();
      const todayKey = toLocalDayKey(new Date());
      const yesterdayKey = getYesterdayKey(todayKey);

      // Get or create today's session
      const dailySession = await getOrCreateDailySessionForLocalDay(db, todayKey);
      setSession(dailySession);

      // If session is already completed, go to completed state
      if (dailySession.status === 'completed') {
        // Load answers for display
        const sessionAnswers = await readSessionAnswers(db, dailySession.id);
        setAnswers(sessionAnswers);

        // Try to load the selection for display
        const storedSelection = await readStoredDailyQuestionSelection(
          db,
          dailySession.id
        );
        setSelection(storedSelection);

        setPhase('completed');
        return;
      }

      // Get or create the question selection for this session
      const questionSelection = await getOrCreateDailyQuestionSelection(
        db,
        dailySession.id,
        todayKey,
        yesterdayKey
      );
      setSelection(questionSelection);

      // Load existing answers
      const sessionAnswers = await readSessionAnswers(db, dailySession.id);
      setAnswers(sessionAnswers);

      // Check if all questions are already answered
      if (sessionAnswers.length >= 3) {
        // Complete the session
        await completeDailySession(db, dailySession.id, sessionAnswers);
        setPhase('completed');
      } else {
        setPhase('active');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load session';
      setError(message);
      setPhase('error');
      console.error('Failed to initialize daily session:', err);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  // Build question states from selection and answers
  const questions: DailySessionQuestionState[] = (selection?.questionIds ?? [])
    .map((questionId) => {
      const question = getQuestionById(questionId);
      if (!question) return null;

      const answerRecord = answers.find((a) => a.questionId === questionId);
      return {
        question,
        answer: answerRecord?.answer ?? null,
        answeredAt: answerRecord ? new Date(answerRecord.answeredAt) : null,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Find the next unanswered question index
  const currentQuestionIndex = questions.findIndex((q) => q.answer === null);

  const answeredCount = answers.length;
  const totalCount: number = 3;
  const progressPercentage = Math.round((answeredCount / totalCount) * 100);

  async function completeDailySession(
    db: Awaited<ReturnType<typeof getSQLiteDatabase>>,
    sessionId: string,
    sessionAnswers: PersistedSessionAnswer[]
  ): Promise<void> {
    if (sessionAnswers.length < 3) {
      throw new Error('Cannot complete session with fewer than 3 answers');
    }

    // Build answered questions for scoring
    const answeredQuestions = sessionAnswers
      .map((answer) => {
        const question = getQuestionById(answer.questionId);
        if (!question) return null;

        const supportedPoleId = resolveSupportedPoleId(question, answer.answer);
        if (!supportedPoleId) return null;

        return {
          question,
          response: answer.answer,
          supportedPoleId,
          answeredAt: new Date(answer.answeredAt),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Create snapshot
    const snapshotId = `snapshot-daily-${Date.now()}`;
    const snapshot = createTypeSnapshot(snapshotId, answeredQuestions, AXES, {
      type: 'daily',
      sessionId,
    });

    const questionIds = sessionAnswers.map((a) => a.questionId);
    await completeDailySessionAtomic(db, sessionId, snapshot, questionIds);
  }

  const submitAnswer = useCallback(
    async (response: QuestionResponse) => {
      if (!session || phase !== 'active') {
        throw new Error('No active session');
      }

      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) {
        throw new Error('No current question to answer');
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const db = await getSQLiteDatabase();

        // Persist the answer
        await upsertSessionAnswer(
          db,
          session.id,
          currentQuestion.question.id,
          currentQuestion.question.prompt,
          response
        );

        // Refresh answers
        const sessionAnswers = await readSessionAnswers(db, session.id);
        setAnswers(sessionAnswers);

        // Check if this was the last question
        if (sessionAnswers.length >= 3) {
          await completeDailySession(db, session.id, sessionAnswers);
          setPhase('completed');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit answer';
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [session, phase, questions, currentQuestionIndex]
  );

  return {
    phase,
    session,
    questions,
    currentQuestionIndex,
    answeredCount,
    totalCount,
    progressPercentage,
    isSubmitting,
    error,
    submitAnswer,
  };
}

// Helper function to read stored selection (exported for testing)
async function readStoredDailyQuestionSelection(
  adapter: Awaited<ReturnType<typeof getSQLiteDatabase>>,
  sessionId: string
): Promise<DailyQuestionsSelection | null> {
  const { getFirstAsync, runAsync } = adapter;
  const row = await getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ? LIMIT 1;',
    `daily_session_questions_${sessionId}`
  );

  if (!row?.value) {
    return null;
  }

  return JSON.parse(row.value) as DailyQuestionsSelection;
}
