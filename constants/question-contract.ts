/**
 * Axis dimension for personality assessment.
 * Each axis represents a spectrum between two opposing poles.
 */
export type Axis = {
  /** Unique identifier for the axis */
  id: string;
  /** Human-readable name of the axis */
  name: string;
  /** First pole (left/negative end) of the spectrum */
  poleA: AxisPole;
  /** Second pole (right/positive end) of the spectrum */
  poleB: AxisPole;
};

/**
 * A single pole/end of an axis spectrum.
 */
export type AxisPole = {
  /** Unique identifier for the pole */
  id: string;
  /** Display label for the pole */
  label: string;
  /** Optional description of what this pole represents */
  description?: string;
};

/**
 * Question pool type determines when/how the question is presented.
 */
export type QuestionPool = 'onboarding' | 'daily';

/**
 * Canonical question contract.
 *
 * Every question used in the assessment system must satisfy this contract.
 * No domain assumptions should be needed beyond reading these fields.
 *
 * @example
 * {
 *   id: 'q-001',
 *   prompt: 'I feel energized by group conversations.',
 *   axisId: 'e-i',
 *   agreePoleId: 'e',
 *   pool: 'onboarding',
 *   isActive: true
 * }
 */
export type Question = {
  /** Unique identifier for the question */
  id: string;
  /** The text prompt shown to the user */
  prompt: string;
  /** Reference to the axis this question measures */
  axisId: string;
  /**
   * Which pole the 'Agree' response supports.
   * Must reference either poleA.id or poleB.id of the referenced axis.
   */
  agreePoleId: string;
  /** Which pool this question belongs to */
  pool: QuestionPool;
  /** Whether this question is currently active and should be used in assessments */
  isActive: boolean;
  /** Optional metadata for analytics/debugging */
  metadata?: {
    /** When the question was created */
    createdAt?: Date;
    /** When the question was last updated */
    updatedAt?: Date;
    /** Version number for tracking question evolution */
    version?: number;
  };
};

/**
 * Helper type for question responses.
 */
export type QuestionResponse = 'agree' | 'disagree';

/**
 * Result of answering a question, with resolved axis information.
 */
export type AnsweredQuestion = {
  question: Question;
  response: QuestionResponse;
  /**
   * Which pole the user's response supports.
   * Derived from agreePoleId if response is 'agree', opposite pole if 'disagree'.
   */
  supportedPoleId: string;
  /** Timestamp of when the question was answered */
  answeredAt: Date;
};
