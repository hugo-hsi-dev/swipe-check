/**
 * Scoring and type snapshot types for personality assessment.
 */

/**
 * Score contribution for a single pole of an axis.
 */
export type PoleScore = {
  /** Pole identifier */
  poleId: string;
  /** Number of responses supporting this pole */
  count: number;
};

/**
 * Scores for both poles of a single axis.
 */
export type AxisScores = {
  /** Axis identifier */
  axisId: string;
  /** Score for pole A (left/negative) */
  poleA: PoleScore;
  /** Score for pole B (right/positive) */
  poleB: PoleScore;
  /** Total responses for this axis */
  totalResponses: number;
};

/**
 * Strength of a pole relative to its opposite.
 * Ranges from -1.0 (fully pole A) to +1.0 (fully pole B).
 */
export type AxisStrength = {
  /** Axis identifier */
  axisId: string;
  /**
   * Normalized strength from -1.0 to +1.0.
   * -1.0 = 100% pole A, 0 = balanced, +1.0 = 100% pole B
   */
  strength: number;
  /** The dominant pole ID, or null if perfectly balanced */
  dominantPoleId: string | null;
  /** Raw difference (poleB.count - poleA.count) */
  rawDifference: number;
};

/**
 * The four-letter personality type (e.g., "INTJ", "ESFP").
 */
export type PersonalityType = string;

/**
 * Complete type snapshot that can be stored or reconstructed.
 * This is the canonical output of the scoring system.
 */
export type TypeSnapshot = {
  /** Unique identifier for this snapshot */
  id: string;
  /** The computed four-letter type (e.g., "INTJ") */
  currentType: PersonalityType;
  /** Per-axis scores */
  axisScores: AxisScores[];
  /** Per-axis strength calculations */
  axisStrengths: AxisStrength[];
  /** When this snapshot was created */
  createdAt: Date;
  /** Session or context that generated this snapshot */
  source: {
    /** Type of session that generated this snapshot */
    type: 'onboarding' | 'daily' | 'manual';
    /** Optional session identifier */
    sessionId?: string;
  };
  /** Number of questions answered in this snapshot */
  questionCount: number;
};

/**
 * A lightweight summary for display purposes.
 * Used in journal and insights views.
 */
export type TypeSummary = {
  /** The four-letter type */
  type: PersonalityType;
  /** When this summary was generated */
  timestamp: Date;
  /** Per-axis breakdown with strengths */
  axes: Array<{
    axisId: string;
    axisName: string;
    dominantPole: string;
    strength: number;
  }>;
};

/**
 * Accumulator for building scores incrementally.
 * Useful for real-time updates during a session.
 */
export type ScoreAccumulator = {
  /** Map of axisId to accumulated scores */
  scores: Map<string, AxisScores>;
  /** Total questions answered */
  totalAnswered: number;
  /** Add a single response to the accumulator */
  addResponse(axisId: string, supportedPoleId: string, oppositePoleId: string): void;
  /** Build axis strengths from current scores */
  buildStrengths(): AxisStrength[];
  /** Compute the current type from accumulated scores */
  computeType(axes: Array<{ id: string; poleA: { id: string }; poleB: { id: string } }>): PersonalityType;
  /** Create a full snapshot */
  createSnapshot(
    id: string,
    source: TypeSnapshot['source']
  ): TypeSnapshot;
};
