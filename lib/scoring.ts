/**
 * Scoring utilities for personality type calculation.
 */

import type {
  AnsweredQuestion,
  Axis,
} from '@/constants/question-contract';
import type {
  AxisScores,
  AxisStrength,
  PersonalityType,
  TypeSnapshot,
  ScoreAccumulator,
} from '@/constants/scoring-contract';

/**
 * Calculate axis scores from a set of answered questions.
 * Each answer contributes to exactly one side of exactly one axis.
 */
export function calculateAxisScores(
  answers: AnsweredQuestion[],
  axes: Axis[]
): AxisScores[] {
  // Initialize scores for all axes
  const scoresMap = new Map<string, AxisScores>();
  
  for (const axis of axes) {
    scoresMap.set(axis.id, {
      axisId: axis.id,
      poleA: { poleId: axis.poleA.id, count: 0 },
      poleB: { poleId: axis.poleB.id, count: 0 },
      totalResponses: 0,
    });
  }
  
  // Accumulate responses
  for (const answer of answers) {
    const axisScore = scoresMap.get(answer.question.axisId);
    if (!axisScore) continue;
    
    // Determine which pole is supported by this answer
    if (answer.supportedPoleId === axisScore.poleA.poleId) {
      axisScore.poleA.count++;
    } else if (answer.supportedPoleId === axisScore.poleB.poleId) {
      axisScore.poleB.count++;
    }
    
    axisScore.totalResponses++;
  }
  
  return Array.from(scoresMap.values());
}

/**
 * Calculate axis strength from the gap between the two poles.
 * Strength ranges from -1.0 (fully pole A) to +1.0 (fully pole B).
 */
export function calculateAxisStrength(axisScores: AxisScores): AxisStrength {
  const total = axisScores.poleA.count + axisScores.poleB.count;
  
  if (total === 0) {
    return {
      axisId: axisScores.axisId,
      strength: 0,
      dominantPoleId: null,
      rawDifference: 0,
    };
  }
  
  // Normalize to -1.0 to +1.0 range
  // poleA is negative, poleB is positive
  const poleAWeight = axisScores.poleA.count / total;
  const poleBWeight = axisScores.poleB.count / total;
  const strength = poleBWeight - poleAWeight;
  
  // Determine dominant pole
  let dominantPoleId: string | null = null;
  if (axisScores.poleA.count > axisScores.poleB.count) {
    dominantPoleId = axisScores.poleA.poleId;
  } else if (axisScores.poleB.count > axisScores.poleA.count) {
    dominantPoleId = axisScores.poleB.poleId;
  }
  
  return {
    axisId: axisScores.axisId,
    strength,
    dominantPoleId,
    rawDifference: axisScores.poleB.count - axisScores.poleA.count,
  };
}

/**
 * Calculate strengths for all axes.
 */
export function calculateAllAxisStrengths(axisScores: AxisScores[]): AxisStrength[] {
  return axisScores.map(calculateAxisStrength);
}

/**
 * Compute the four-letter personality type from axis strengths.
 * Uses the dominant pole for each axis to build the type string.
 * The same answer history always produces the same Current Type.
 */
export function computePersonalityType(
  axisStrengths: AxisStrength[],
  axes: Axis[]
): PersonalityType {
  // Sort axes by their order in the provided axes array to ensure consistent ordering
  const orderedStrengths = axes.map(axis => {
    const strength = axisStrengths.find(s => s.axisId === axis.id);
    return { axis, strength };
  });
  
  // Build type string from dominant poles
  let type = '';
  for (const { axis, strength } of orderedStrengths) {
    if (strength?.dominantPoleId) {
      type += strength.dominantPoleId;
    } else {
      // If perfectly balanced, default to poleA (or could use configurable default)
      type += axis.poleA.id;
    }
  }
  
  return type.toUpperCase();
}

/**
 * Create a complete type snapshot from answered questions.
 * A completed session can produce a type snapshot that can be stored or reconstructed later.
 */
export function createTypeSnapshot(
  id: string,
  answers: AnsweredQuestion[],
  axes: Axis[],
  source: TypeSnapshot['source']
): TypeSnapshot {
  const axisScores = calculateAxisScores(answers, axes);
  const axisStrengths = calculateAllAxisStrengths(axisScores);
  const currentType = computePersonalityType(axisStrengths, axes);
  
  return {
    id,
    currentType,
    axisScores,
    axisStrengths,
    createdAt: new Date(),
    source,
    questionCount: answers.length,
  };
}

/**
 * Reconstruct a type snapshot from stored data.
 * Used for restoring snapshots from persistent storage.
 */
export function reconstructTypeSnapshot(data: Omit<TypeSnapshot, 'createdAt'> & { createdAt: string | Date }): TypeSnapshot {
  return {
    ...data,
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
  };
}

/**
 * Create a score accumulator for incremental scoring.
 * Useful for real-time updates during an assessment session.
 */
export function createScoreAccumulator(axes: Axis[]): ScoreAccumulator {
  const scores = new Map<string, AxisScores>();
  let totalAnswered = 0;
  
  // Initialize scores for all axes
  for (const axis of axes) {
    scores.set(axis.id, {
      axisId: axis.id,
      poleA: { poleId: axis.poleA.id, count: 0 },
      poleB: { poleId: axis.poleB.id, count: 0 },
      totalResponses: 0,
    });
  }
  
  return {
    scores,
    totalAnswered,
    addResponse(axisId: string, supportedPoleId: string, oppositePoleId: string): void {
      const axisScore = scores.get(axisId);
      if (!axisScore) return;
      
      if (supportedPoleId === axisScore.poleA.poleId) {
        axisScore.poleA.count++;
      } else if (supportedPoleId === axisScore.poleB.poleId) {
        axisScore.poleB.count++;
      }
      
      axisScore.totalResponses++;
      totalAnswered++;
    },
    buildStrengths(): AxisStrength[] {
      return Array.from(scores.values()).map(calculateAxisStrength);
    },
    computeType(axesForType: Array<{ id: string; poleA: { id: string }; poleB: { id: string } }>): PersonalityType {
      const strengths = this.buildStrengths();
      return computePersonalityType(strengths, axesForType as Axis[]);
    },
    createSnapshot(id: string, source: TypeSnapshot['source']): TypeSnapshot {
      const axisScores = Array.from(scores.values());
      const axisStrengths = this.buildStrengths();
      const currentType = this.computeType(axes);
      
      return {
        id,
        currentType,
        axisScores,
        axisStrengths,
        createdAt: new Date(),
        source,
        questionCount: totalAnswered,
      };
    },
  };
}

/**
 * Check if a snapshot is valid and complete.
 */
export function isValidSnapshot(snapshot: TypeSnapshot): boolean {
  // Must have exactly 4 axes for a complete MBTI-style type
  if (snapshot.axisScores.length !== 4) return false;
  if (snapshot.axisStrengths.length !== 4) return false;
  
  // Type must be exactly 4 characters
  if (snapshot.currentType.length !== 4) return false;
  
  // All axis IDs must be present
  const expectedAxisIds = ['e-i', 's-n', 't-f', 'j-p'];
  const actualAxisIds = snapshot.axisScores.map((s: AxisScores) => s.axisId).sort();
  return JSON.stringify(actualAxisIds) === JSON.stringify(expectedAxisIds.sort());
}

/**
 * Compare two snapshots to see if they represent the same type.
 * Useful for tracking type stability over time.
 */
export function haveSameType(a: TypeSnapshot, b: TypeSnapshot): boolean {
  return a.currentType === b.currentType;
}

/**
 * Calculate how much a specific axis has shifted between two snapshots.
 * Returns the difference in strength values.
 */
export function calculateAxisShift(
  axisId: string,
  before: TypeSnapshot,
  after: TypeSnapshot
): number | null {
  const beforeStrength = before.axisStrengths.find((s: AxisStrength) => s.axisId === axisId);
  const afterStrength = after.axisStrengths.find((s: AxisStrength) => s.axisId === axisId);
  
  if (!beforeStrength || !afterStrength) return null;
  
  return afterStrength.strength - beforeStrength.strength;
}
