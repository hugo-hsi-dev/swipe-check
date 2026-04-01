import { useCallback, useEffect, useState } from 'react';

import type { Question, QuestionResponse } from '@/constants/question-contract';
import type { TypeSnapshot } from '@/constants/scoring-contract';
import { ONBOARDING_QUESTIONS, AXES } from '@/constants/questions';
import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';
import {
  completeOnboardingSession,
  OnboardingCompletionError,
  readSessionAnswers,
  startOrResumeOnboardingSession,
  upsertSessionAnswer,
  upsertTypeSnapshot,
} from '@/lib/local-data/session-lifecycle';
import type { PersistedSession, PersistedSessionAnswer } from '@/lib/local-data/session-lifecycle';
import { createTypeSnapshot } from '@/lib/scoring';

export type OnboardingQuestionState = {
  question: Question;
  answer: QuestionResponse | null;
  answeredAt: Date | null;
};

export type OnboardingController = {
  /** The active onboarding session */
  session: PersistedSession | null;
  /** The 12 onboarding questions in stable order */
  questions: OnboardingQuestionState[];
  /** Index of the current question (0-11), or -1 if all completed */
  currentQuestionIndex: number;
  /** Number of questions answered */
  answeredCount: number;
  /** Total number of questions (always 12) */
  totalCount: number;
  /** Whether the data is still loading */
  isLoading: boolean;
  /** Whether an operation is in progress */
  isSubmitting: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** Submit an answer for a question */
  submitAnswer: (questionId: string, response: QuestionResponse) => Promise<void>;
  /** Complete the onboarding (requires 12 answers) */
  completeOnboarding: () => Promise<void>;
  /** Whether onboarding can be completed */
  canComplete: boolean;
  /** Refresh the controller state */
  refresh: () => Promise<void>;
};

/**
 * Hook to manage the onboarding assessment session.
 *
 * Provides:
 * - Access to the 12 fixed onboarding questions in stable order
 * - Persisted answer tracking
 * - Current question index (next unanswered)
 * - Progress counts
 * - Submit and complete actions
 *
 * Completion requires exactly 12 valid answers and will:
 * - Create a TypeSnapshot
 * - Store it tied to the session
 * - Mark the session as completed
 */
export function useOnboardingSession(): OnboardingController {
  const [session, setSession] = useState<PersistedSession | null>(null);
  const [answers, setAnswers] = useState<PersistedSessionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const db = await getSQLiteDatabase();
      const onboardingSession = await startOrResumeOnboardingSession(db);
      setSession(onboardingSession);

      // Load existing answers
      const sessionAnswers = await readSessionAnswers(db, onboardingSession.id);
      setAnswers(sessionAnswers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load onboarding session';
      setError(message);
      console.error('Failed to initialize onboarding session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      if (isMounted) {
        await loadSession();
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [loadSession]);

  // Build the questions state with answers
  const questions: OnboardingQuestionState[] = ONBOARDING_QUESTIONS.map((question) => {
    const answerRecord = answers.find((a) => a.questionId === question.id);
    return {
      question,
      answer: answerRecord?.answer ?? null,
      answeredAt: answerRecord ? new Date(answerRecord.answeredAt) : null,
    };
  });

  // Find the next unanswered question index
  const currentQuestionIndex = questions.findIndex((q) => q.answer === null);

  const answeredCount = answers.length;
  const totalCount = ONBOARDING_QUESTIONS.length;
  const canComplete = answeredCount === totalCount;

  const submitAnswer = useCallback(
    async (questionId: string, response: QuestionResponse) => {
      if (!session) {
        throw new Error('No active session');
      }

      // Validate question is part of onboarding
      const isValidQuestion = ONBOARDING_QUESTIONS.some((q) => q.id === questionId);
      if (!isValidQuestion) {
        throw new Error(`Question ${questionId} is not part of the onboarding set`);
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const db = await getSQLiteDatabase();
        await upsertSessionAnswer(db, session.id, questionId, response);

        // Refresh answers after submission
        const sessionAnswers = await readSessionAnswers(db, session.id);
        setAnswers(sessionAnswers);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit answer';
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [session]
  );

  const completeOnboarding = useCallback(async () => {
    if (!session) {
      throw new Error('No active session');
    }

    if (!canComplete) {
      throw new OnboardingCompletionError(
        `Onboarding requires ${totalCount} answers, but only ${answeredCount} provided`,
        totalCount,
        answeredCount
      );
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const db = await getSQLiteDatabase();

      // Build answered questions for scoring
      const answeredQuestions = answers
        .map((answer) => {
          const question = ONBOARDING_QUESTIONS.find((q) => q.id === answer.questionId);
          if (!question) return null;

          // Determine supported pole based on response
          const supportedPoleId =
            answer.answer === 'agree'
              ? question.agreePoleId
              : // Find opposite pole
                question.agreePoleId === AXES.find((a) => a.id === question.axisId)?.poleA.id
                ? AXES.find((a) => a.id === question.axisId)?.poleB.id
                : AXES.find((a) => a.id === question.axisId)?.poleA.id;

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
      const snapshotId = `snapshot-${Date.now()}`;
      const snapshot = createTypeSnapshot(snapshotId, answeredQuestions, AXES, {
        type: 'onboarding',
        sessionId: session.id,
      });

      // Complete the session with snapshot
      await completeOnboardingSession(db, session.id, snapshot);

      // Store snapshot separately as well
      await upsertTypeSnapshot(db, snapshot);

      // Update local state
      const updatedSession = { ...session, status: 'completed' as const };
      setSession(updatedSession);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete onboarding';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [session, answers, canComplete, answeredCount, totalCount]);

  const refresh = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  return {
    session,
    questions,
    currentQuestionIndex,
    answeredCount,
    totalCount,
    isLoading,
    isSubmitting,
    error,
    submitAnswer,
    completeOnboarding,
    canComplete,
    refresh,
  };
}

// Re-export for consumers
export { OnboardingCompletionError };
export type { PersistedSession, PersistedSessionAnswer };
