import type { Question } from './question-contract';
import { QUESTIONS } from './questions';

/**
 * Axis exposure tracking.
 * Maps axis ID to count of how many times it has appeared in completed daily sessions.
 */
export type AxisExposureMap = Record<string, number>;

/**
 * Question usage tracking.
 * Maps question ID to the timestamp (ms) when it was last used in a daily session.
 */
export type QuestionLastUsedMap = Record<string, number>;

/**
 * Daily session history for a specific date.
 */
export type DailySessionHistory = {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Question IDs shown on that date */
  questionIds: string[];
};

/**
 * Input data required for daily question selection.
 */
export type DailySelectionInput = {
  /** Today's date as ISO string (YYYY-MM-DD) */
  today: string;
  /** Axis exposure counts across all completed daily sessions */
  axisExposure: AxisExposureMap;
  /** Last used timestamp for each question */
  questionLastUsed: QuestionLastUsedMap;
  /** Yesterday's session history (to avoid repetition) */
  yesterdaySession?: DailySessionHistory;
};

/**
 * Result of daily question selection.
 */
export type DailySelectionResult = {
  /** The 3 selected questions for today */
  questions: Question[];
  /** Selected axis pairs (for tracking/debugging) */
  selectedAxisIds: string[];
  /** Metadata about selection decisions */
  metadata: {
    axisExposureAtSelection: AxisExposureMap;
    tieBreakersUsed: string[];
  };
};

/**
 * Fixed axis order for deterministic tie-breaking.
 * E/I, S/N, T/F, J/P
 */
const FIXED_AXIS_ORDER = ['e-i', 's-n', 't-f', 'j-p'] as const;

/**
 * Number of questions to select per day.
 */
const DAILY_QUESTION_COUNT = 3;

/**
 * Gets all active daily pool questions.
 */
function getActiveDailyQuestions(): Question[] {
  return QUESTIONS.filter((q) => q.isActive && q.pool === 'daily');
}

/**
 * Gets active daily questions for a specific axis.
 */
function getActiveDailyQuestionsForAxis(axisId: string): Question[] {
  return QUESTIONS.filter(
    (q) => q.isActive && q.pool === 'daily' && q.axisId === axisId
  );
}

/**
 * Sorts axis IDs by exposure (ascending), then by recency (least recent first),
 * then by fixed axis order.
 */
function sortAxesBySelectionPriority(
  axisIds: string[],
  axisExposure: AxisExposureMap,
  questionLastUsed: QuestionLastUsedMap,
  activeDailyQuestions: Question[]
): string[] {
  return [...axisIds].sort((a, b) => {
    // Primary: least exposure first
    const exposureA = axisExposure[a] ?? 0;
    const exposureB = axisExposure[b] ?? 0;
    if (exposureA !== exposureB) {
      return exposureA - exposureB;
    }

    // Secondary: least recently used axis first
    const axisQuestionsA = activeDailyQuestions.filter((q) => q.axisId === a);
    const axisQuestionsB = activeDailyQuestions.filter((q) => q.axisId === b);

    const lastUsedA = Math.max(
      ...axisQuestionsA.map((q) => questionLastUsed[q.id] ?? 0),
      0
    );
    const lastUsedB = Math.max(
      ...axisQuestionsB.map((q) => questionLastUsed[q.id] ?? 0),
      0
    );

    if (lastUsedA !== lastUsedB) {
      return lastUsedA - lastUsedB;
    }

    // Tertiary: fixed axis order
    const indexA = FIXED_AXIS_ORDER.indexOf(a as (typeof FIXED_AXIS_ORDER)[number]);
    const indexB = FIXED_AXIS_ORDER.indexOf(b as (typeof FIXED_AXIS_ORDER)[number]);
    return indexA - indexB;
  });
}

/**
 * Selects the best question for an axis based on usage history.
 * Prefers least-recently-used questions and avoids yesterday's question.
 */
function selectQuestionForAxis(
  axisId: string,
  questionLastUsed: QuestionLastUsedMap,
  yesterdayQuestionIds: string[]
): Question | null {
  const axisQuestions = getActiveDailyQuestionsForAxis(axisId);

  if (axisQuestions.length === 0) {
    return null;
  }

  // Filter out yesterday's questions if alternatives exist
  const alternatives = axisQuestions.filter(
    (q) => !yesterdayQuestionIds.includes(q.id)
  );
  const candidates = alternatives.length > 0 ? alternatives : axisQuestions;

  // Sort by last used timestamp (ascending - least recent first)
  const sorted = [...candidates].sort((a, b) => {
    const lastUsedA = questionLastUsed[a.id] ?? 0;
    const lastUsedB = questionLastUsed[b.id] ?? 0;
    return lastUsedA - lastUsedB;
  });

  return sorted[0] ?? null;
}

/**
 * Selects 3 daily questions according to the selection policy:
 * - Exactly 3 questions per day
 * - One from each of the 3 least-exposed axis pairs
 * - Ties broken by recency, then fixed axis order (E/I, S/N, T/F, J/P)
 * - Within each axis, prefers least-recently-used question
 * - Avoids yesterday's question when valid alternatives exist
 */
export function selectDailyQuestions(
  input: DailySelectionInput
): DailySelectionResult {
  const { axisExposure, questionLastUsed, yesterdaySession } = input;
  const activeDailyQuestions = getActiveDailyQuestions();
  const yesterdayQuestionIds = yesterdaySession?.questionIds ?? [];

  // Get all axis IDs that have active daily questions
  const axisIdsWithQuestions = new Set(
    activeDailyQuestions.map((q) => q.axisId)
  );
  const allAxes = Array.from(axisIdsWithQuestions);

  // Sort axes by selection priority
  const sortedAxes = sortAxesBySelectionPriority(
    allAxes,
    axisExposure,
    questionLastUsed,
    activeDailyQuestions
  );

  // Select top 3 axes
  const selectedAxisIds = sortedAxes.slice(0, DAILY_QUESTION_COUNT);
  const tieBreakersUsed: string[] = [];

  // Track if we used tie-breakers
  if (selectedAxisIds.length >= 2) {
    const firstExposure = axisExposure[selectedAxisIds[0]] ?? 0;
    for (let i = 1; i < selectedAxisIds.length; i++) {
      if ((axisExposure[selectedAxisIds[i]] ?? 0) === firstExposure) {
        tieBreakersUsed.push(selectedAxisIds[i]);
      }
    }
  }

  // Select questions for each chosen axis
  const questions: Question[] = [];
  for (const axisId of selectedAxisIds) {
    const question = selectQuestionForAxis(
      axisId,
      questionLastUsed,
      yesterdayQuestionIds
    );
    if (question) {
      questions.push(question);
    }
  }

  return {
    questions,
    selectedAxisIds,
    metadata: {
      axisExposureAtSelection: { ...axisExposure },
      tieBreakersUsed,
    },
  };
}

/**
 * Creates an empty axis exposure map with all axes initialized to 0.
 */
export function createEmptyAxisExposure(): AxisExposureMap {
  return {
    'e-i': 0,
    's-n': 0,
    't-f': 0,
    'j-p': 0,
  };
}

/**
 * Updates axis exposure counts after a daily session is completed.
 */
export function updateAxisExposure(
  currentExposure: AxisExposureMap,
  completedQuestionIds: string[]
): AxisExposureMap {
  const newExposure = { ...currentExposure };

  for (const questionId of completedQuestionIds) {
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (question && question.axisId) {
      newExposure[question.axisId] = (newExposure[question.axisId] ?? 0) + 1;
    }
  }

  return newExposure;
}

/**
 * Updates question last-used timestamps after a daily session.
 */
export function updateQuestionLastUsed(
  currentLastUsed: QuestionLastUsedMap,
  completedQuestionIds: string[],
  timestamp: number
): QuestionLastUsedMap {
  const newLastUsed = { ...currentLastUsed };

  for (const questionId of completedQuestionIds) {
    newLastUsed[questionId] = timestamp;
  }

  return newLastUsed;
}
