/**
 * Scoring types and logic for personality type calculation.
 *
 * Implements Epic 01.5: Tie and Low-Data Behavior
 *
 * ## Tie Handling
 * When an axis has equal counts for both poles (a tie), the system retains
 * the previously established letter rather than flipping or becoming unknown.
 * This is a retention-based tiebreaker that ensures stability over time.
 *
 * Example:
 * - Baseline: 3E, 1I → Result: E
 * - Later tie: 3E, 3I → Result: E (retained from baseline)
 * - Clear win: 3E, 4I → Result: I (updates when tie is broken)
 *
 * ## Low-Data Behavior
 * The system honestly reports evidence availability:
 * - No answers → Display: 'X', winningPoleId: null
 * - < 3 answers → hasMinimumData: false
 * - >= 3 answers → hasMinimumData: true
 *
 * ## Consistency
 * The same answer history always produces the same result.
 * All screens use the same tie-breaking rules via calculateType().
 */

import type { AnsweredQuestion, Axis } from './question-contract';
import { AXES } from './questions';

/**
 * Represents the state of a single axis with full transparency about data availability.
 */
export type AxisResult = {
  /** The axis identifier (e.g., 'e-i') */
  axisId: string;
  /** The winning pole ID, or null if no data exists */
  winningPoleId: string | null;
  /** The letter to display (e.g., 'E', 'I', 'X' for unknown) */
  displayLetter: string;
  /** Number of answers supporting poleA */
  poleACount: number;
  /** Number of answers supporting poleB */
  poleBCount: number;
  /** Total number of answers for this axis */
  totalAnswers: number;
  /** The difference between counts (absolute value). 0 = tie */
  strength: number;
  /** Whether this axis has enough data to be confident (>= 3 answers) */
  hasMinimumData: boolean;
  /** Whether this result was decided by tie-breaker (retention) */
  wasTieBroken: boolean;
};

/**
 * Complete personality type result with metadata about data quality.
 */
export type TypeResult = {
  /** The four-letter type code (e.g., 'ENFJ', 'INTX') */
  typeCode: string;
  /** Results for each of the four axes, in order: E/I, S/N, T/F, J/P */
  axes: AxisResult[];
  /** Total number of answers across all axes */
  totalAnswers: number;
  /** Number of axes with minimum data (>= 3 answers) */
  axesWithMinimumData: number;
  /** Whether all axes have enough data for a confident reading */
  isComplete: boolean;
  /** When this result was computed */
  computedAt: Date;
};

/**
 * Type snapshot stored after each completed session.
 */
export type TypeSnapshot = TypeResult & {
  /** Unique identifier for this snapshot */
  id: string;
  /** The session that produced this snapshot */
  sessionId: string;
};

/**
 * Options for calculating type.
 */
export type CalculateTypeOptions = {
  /** Previous type result to use for tie-breaking (if available) */
  previousResult?: TypeResult;
  /** Timestamp for the computation */
  computedAt?: Date;
};

/**
 * Counts responses for a single axis from answer history.
 */
function countAxisResponses(
  answers: AnsweredQuestion[],
  axis: Axis
): { poleACount: number; poleBCount: number; total: number } {
  const axisAnswers = answers.filter((a) => a.question.axisId === axis.id);

  let poleACount = 0;
  let poleBCount = 0;

  for (const answer of axisAnswers) {
    if (answer.supportedPoleId === axis.poleA.id) {
      poleACount++;
    } else if (answer.supportedPoleId === axis.poleB.id) {
      poleBCount++;
    }
  }

  return { poleACount, poleBCount, total: axisAnswers.length };
}

/**
 * Determines the winning pole for an axis with tie-breaking logic.
 *
 * Tie-breaking rule: If counts are equal, retain the previously established letter.
 * If no previous result exists and it's a tie, prefer poleA (arbitrary but deterministic).
 *
 * @param poleACount - Count for pole A
 * @param poleBCount - Count for pole B
 * @param axis - The axis definition
 * @param previousWinningPoleId - The previous winning pole ID for retention (optional)
 * @returns Object with winning pole ID and tie-breaker metadata
 */
function determineWinningPole(
  poleACount: number,
  poleBCount: number,
  axis: Axis,
  previousWinningPoleId?: string | null
): { winningPoleId: string | null; wasTieBroken: boolean } {
  // No data case
  if (poleACount === 0 && poleBCount === 0) {
    return { winningPoleId: null, wasTieBroken: false };
  }

  // Clear winner: poleA
  if (poleACount > poleBCount) {
    return { winningPoleId: axis.poleA.id, wasTieBroken: false };
  }

  // Clear winner: poleB
  if (poleBCount > poleACount) {
    return { winningPoleId: axis.poleB.id, wasTieBroken: false };
  }

  // Tie case: use retention-based tiebreaker
  if (previousWinningPoleId) {
    // Verify the previous winning pole is actually one of this axis's poles
    const isValidPreviousPole =
      previousWinningPoleId === axis.poleA.id || previousWinningPoleId === axis.poleB.id;

    if (isValidPreviousPole) {
      return { winningPoleId: previousWinningPoleId, wasTieBroken: true };
    }
  }

  // No previous result or invalid previous pole: use deterministic fallback
  // Prefer poleA as the default to maintain consistency
  return { winningPoleId: axis.poleA.id, wasTieBroken: true };
}

/**
 * Gets the display letter for a pole ID.
 */
function getDisplayLetter(poleId: string | null, axis: Axis): string {
  if (!poleId) {
    // No data: use 'X' to indicate unknown
    return 'X';
  }

  if (poleId === axis.poleA.id) {
    return axis.poleA.label.charAt(0).toUpperCase();
  }

  if (poleId === axis.poleB.id) {
    return axis.poleB.label.charAt(0).toUpperCase();
  }

  // Fallback for unexpected pole IDs
  return 'X';
}

/**
 * Gets the previous winning pole ID for a specific axis from a previous result.
 */
function getPreviousWinningPoleId(
  previousResult: TypeResult | undefined,
  axisId: string
): string | null | undefined {
  if (!previousResult) {
    return undefined;
  }

  const previousAxis = previousResult.axes.find((a) => a.axisId === axisId);
  return previousAxis?.winningPoleId;
}

/**
 * Calculates a single axis result from answer history.
 */
function calculateAxisResult(
  answers: AnsweredQuestion[],
  axis: Axis,
  previousResult?: TypeResult
): AxisResult {
  const { poleACount, poleBCount, total } = countAxisResponses(answers, axis);

  const previousWinningPoleId = getPreviousWinningPoleId(previousResult, axis.id);
  const { winningPoleId, wasTieBroken } = determineWinningPole(
    poleACount,
    poleBCount,
    axis,
    previousWinningPoleId
  );

  const strength = Math.abs(poleACount - poleBCount);
  const hasMinimumData = total >= 3;

  return {
    axisId: axis.id,
    winningPoleId,
    displayLetter: getDisplayLetter(winningPoleId, axis),
    poleACount,
    poleBCount,
    totalAnswers: total,
    strength,
    hasMinimumData,
    wasTieBroken,
  };
}

/**
 * Calculates the complete personality type from answer history.
 *
 * Implements tie-handling behavior:
 * - A tied axis retains its previously established letter
 * - Low-data cases honestly report their evidence level
 * - The model does not invent certainty beyond available history
 *
 * @param answers - Array of answered questions (can be empty)
 * @param options - Optional configuration including previous result for tie-breaking
 * @returns TypeResult with full metadata about data quality and axis states
 */
export function calculateType(
  answers: AnsweredQuestion[],
  options: CalculateTypeOptions = {}
): TypeResult {
  const { previousResult, computedAt = new Date() } = options;

  // Calculate each axis in canonical order
  const axes = AXES.map((axis) => calculateAxisResult(answers, axis, previousResult));

  // Build type code from display letters
  const typeCode = axes.map((axis) => axis.displayLetter).join('');

  const totalAnswers = answers.length;
  const axesWithMinimumData = axes.filter((a) => a.hasMinimumData).length;
  const isComplete = axesWithMinimumData === 4;

  return {
    typeCode,
    axes,
    totalAnswers,
    axesWithMinimumData,
    isComplete,
    computedAt,
  };
}

/**
 * Creates a type snapshot after a completed session.
 *
 * @param typeResult - The computed type result
 * @param sessionId - The session that produced this snapshot
 * @returns TypeSnapshot ready for storage
 */
export function createTypeSnapshot(
  typeResult: TypeResult,
  sessionId: string
): TypeSnapshot {
  return {
    ...typeResult,
    id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
  };
}

/**
 * Re-calculates type from a series of historical snapshots.
 * Useful for reconstructing type history or verifying consistency.
 *
 * @param snapshots - Array of type snapshots in chronological order
 * @returns Array of type results (one per snapshot, recalculated)
 */
export function recalculateTypeHistory(
  snapshots: TypeSnapshot[],
  allAnswers: AnsweredQuestion[][]
): TypeResult[] {
  const results: TypeResult[] = [];
  let previousResult: TypeResult | undefined;

  for (let i = 0; i < allAnswers.length; i++) {
    const answers = allAnswers[i];
    const result = calculateType(answers, { previousResult });
    results.push(result);
    previousResult = result;
  }

  return results;
}

/**
 * Utility to check if two type results would display the same type code.
 */
export function typeCodesMatch(result1: TypeResult, result2: TypeResult): boolean {
  return result1.typeCode === result2.typeCode;
}

/**
 * Utility to get axes that changed between two results.
 */
export function getChangedAxes(
  previousResult: TypeResult | undefined,
  currentResult: TypeResult
): AxisResult[] {
  if (!previousResult) {
    return currentResult.axes.filter((a) => a.winningPoleId !== null);
  }

  return currentResult.axes.filter((currentAxis) => {
    const previousAxis = previousResult.axes.find((a) => a.axisId === currentAxis.axisId);
    if (!previousAxis) {
      return currentAxis.winningPoleId !== null;
    }
    return currentAxis.winningPoleId !== previousAxis.winningPoleId;
  });
}
