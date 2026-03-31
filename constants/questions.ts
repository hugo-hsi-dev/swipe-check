import type { Axis, Question } from './question-contract';

/**
 * Core axes for personality assessment.
 * Each axis defines a spectrum between two opposing poles.
 */
export const AXES: Axis[] = [
  {
    id: 'structure-spontaneity',
    name: 'Structure vs. Spontaneity',
    poleA: {
      id: 'structure',
      label: 'Structure',
      description: 'Preference for planning, organization, and predictability',
    },
    poleB: {
      id: 'spontaneity',
      label: 'Spontaneity',
      description: 'Preference for flexibility, improvisation, and going with the flow',
    },
  },
  {
    id: 'independence-collaboration',
    name: 'Independence vs. Collaboration',
    poleA: {
      id: 'independence',
      label: 'Independence',
      description: 'Preference for working alone and making decisions autonomously',
    },
    poleB: {
      id: 'collaboration',
      label: 'Collaboration',
      description: 'Preference for teamwork and collective decision-making',
    },
  },
  {
    id: 'analytical-intuitive',
    name: 'Analytical vs. Intuitive',
    poleA: {
      id: 'analytical',
      label: 'Analytical',
      description: 'Preference for data, logic, and systematic analysis',
    },
    poleB: {
      id: 'intuitive',
      label: 'Intuitive',
      description: 'Preference for gut feelings, patterns, and holistic thinking',
    },
  },
  {
    id: 'stability-growth',
    name: 'Stability vs. Growth',
    poleA: {
      id: 'stability',
      label: 'Stability',
      description: 'Preference for consistency, security, and maintaining status quo',
    },
    poleB: {
      id: 'growth',
      label: 'Growth',
      description: 'Preference for change, risk-taking, and continuous improvement',
    },
  },
  {
    id: 'detail-bigpicture',
    name: 'Detail vs. Big Picture',
    poleA: {
      id: 'detail',
      label: 'Detail',
      description: 'Focus on specifics, precision, and thoroughness',
    },
    poleB: {
      id: 'bigpicture',
      label: 'Big Picture',
      description: 'Focus on vision, patterns, and overarching themes',
    },
  },
] as const;

/**
 * Active questions for the assessment system.
 *
 * Each question clearly identifies:
 * - Its prompt text (what the user sees)
 * - Its axis pair (what dimension it measures)
 * - Which pole 'Agree' supports (for scoring)
 * - Whether it belongs to onboarding or daily pool
 * - Whether it is active
 *
 * This contract allows assessment logic to consume questions without
 * making assumptions about their meaning or scoring behavior.
 */
export const QUESTIONS: Question[] = [
  // Onboarding questions
  {
    id: 'q-001',
    prompt: 'I prefer to have a detailed plan before starting a project.',
    axisId: 'structure-spontaneity',
    agreePoleId: 'structure',
    pool: 'onboarding',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-002',
    prompt: 'I enjoy figuring things out as I go rather than following a set plan.',
    axisId: 'structure-spontaneity',
    agreePoleId: 'spontaneity',
    pool: 'onboarding',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-003',
    prompt: 'I produce my best work when I collaborate with others.',
    axisId: 'independence-collaboration',
    agreePoleId: 'collaboration',
    pool: 'onboarding',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-004',
    prompt: 'I prefer to work independently and make my own decisions.',
    axisId: 'independence-collaboration',
    agreePoleId: 'independence',
    pool: 'onboarding',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-005',
    prompt: 'I trust data and analysis more than gut feelings when making decisions.',
    axisId: 'analytical-intuitive',
    agreePoleId: 'analytical',
    pool: 'onboarding',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-006',
    prompt: 'I often make decisions based on intuition rather than careful analysis.',
    axisId: 'analytical-intuitive',
    agreePoleId: 'intuitive',
    pool: 'onboarding',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-007',
    prompt: 'I feel most comfortable when things stay consistent and predictable.',
    axisId: 'stability-growth',
    agreePoleId: 'stability',
    pool: 'onboarding',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-008',
    prompt: 'I actively seek out new challenges and opportunities to grow.',
    axisId: 'stability-growth',
    agreePoleId: 'growth',
    pool: 'onboarding',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-009',
    prompt: 'I pay close attention to details and notice small errors others miss.',
    axisId: 'detail-bigpicture',
    agreePoleId: 'detail',
    pool: 'onboarding',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-010',
    prompt: 'I naturally think about how individual tasks connect to larger goals.',
    axisId: 'detail-bigpicture',
    agreePoleId: 'bigpicture',
    pool: 'onboarding',
    isActive: true,
    metadata: {
      version: 1,
    },
  },

  // Daily pool questions (additional depth)
  {
    id: 'q-011',
    prompt: 'I get frustrated when meetings run over because they lack an agenda.',
    axisId: 'structure-spontaneity',
    agreePoleId: 'structure',
    pool: 'daily',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-012',
    prompt: 'Some of my best ideas come from impromptu conversations.',
    axisId: 'structure-spontaneity',
    agreePoleId: 'spontaneity',
    pool: 'daily',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-013',
    prompt: 'Brainstorming sessions energize me more than working solo.',
    axisId: 'independence-collaboration',
    agreePoleId: 'collaboration',
    pool: 'daily',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-014',
    prompt: 'I prefer to process information alone before discussing with others.',
    axisId: 'independence-collaboration',
    agreePoleId: 'independence',
    pool: 'daily',
    isActive: true,
    metadata: {
      version: 1,
    },
  },
  {
    id: 'q-015',
    prompt: 'I like to see evidence before accepting new ideas.',
    axisId: 'analytical-intuitive',
    agreePoleId: 'analytical',
    pool: 'daily',
    isActive: true,
    metadata: {
      version: 1,
    },
  },

  // Inactive question example (for documentation purposes)
  {
    id: 'q-099',
    prompt: '[DEPRECATED] I prefer email over instant messaging.',
    axisId: 'structure-spontaneity',
    agreePoleId: 'structure',
    pool: 'daily',
    isActive: false,
    metadata: {
      version: 1,
      createdAt: new Date('2025-01-01'),
    },
  },
] as const;

/**
 * Helper function to get all active questions.
 */
export function getActiveQuestions(): Question[] {
  return QUESTIONS.filter((q) => q.isActive);
}

/**
 * Helper function to get questions by pool.
 */
export function getQuestionsByPool(pool: Question['pool']): Question[] {
  return QUESTIONS.filter((q) => q.isActive && q.pool === pool);
}

/**
 * Helper function to get questions by axis.
 */
export function getQuestionsByAxis(axisId: string): Question[] {
  return QUESTIONS.filter((q) => q.isActive && q.axisId === axisId);
}

/**
 * Helper function to get an axis by ID.
 */
export function getAxisById(axisId: string): Axis | undefined {
  return AXES.find((a) => a.id === axisId);
}

/**
 * Helper function to get a question by ID.
 */
export function getQuestionById(questionId: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === questionId);
}
