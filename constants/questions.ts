import type { Axis, Question } from './question-contract';

/**
 * Core MBTI-style axes for personality assessment.
 */
export const AXES: Axis[] = [
  {
    id: 'e-i',
    name: 'Extraversion vs. Introversion',
    poleA: {
      id: 'e',
      label: 'Extraversion',
      description: 'Energy from external interaction and active engagement',
    },
    poleB: {
      id: 'i',
      label: 'Introversion',
      description: 'Energy from internal reflection and lower-stimulation settings',
    },
  },
  {
    id: 's-n',
    name: 'Sensing vs. Intuition',
    poleA: {
      id: 's',
      label: 'Sensing',
      description: 'Preference for concrete details, facts, and present realities',
    },
    poleB: {
      id: 'n',
      label: 'Intuition',
      description: 'Preference for patterns, possibilities, and future implications',
    },
  },
  {
    id: 't-f',
    name: 'Thinking vs. Feeling',
    poleA: {
      id: 't',
      label: 'Thinking',
      description: 'Preference for objective analysis and consistent principles',
    },
    poleB: {
      id: 'f',
      label: 'Feeling',
      description: 'Preference for values, empathy, and interpersonal impact',
    },
  },
  {
    id: 'j-p',
    name: 'Judging vs. Perceiving',
    poleA: {
      id: 'j',
      label: 'Judging',
      description: 'Preference for structure, plans, and clear closure',
    },
    poleB: {
      id: 'p',
      label: 'Perceiving',
      description: 'Preference for flexibility, openness, and adaptive choices',
    },
  },
] as const;

/**
 * Active questions for the assessment system.
 */
export const QUESTIONS: Question[] = [
  // Onboarding questions: 12 total (3 per axis)
  {
    id: 'q-001',
    prompt: 'Group conversations usually leave me energized rather than drained.',
    axisId: 'e-i',
    agreePoleId: 'e',
    pool: 'onboarding',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-002',
    prompt: 'I prefer one-on-one or solo time over frequent social activity.',
    axisId: 'e-i',
    agreePoleId: 'i',
    pool: 'onboarding',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-003',
    prompt: 'I think best by talking ideas out loud with other people.',
    axisId: 'e-i',
    agreePoleId: 'e',
    pool: 'onboarding',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-004',
    prompt: 'I trust practical evidence more than abstract possibilities.',
    axisId: 's-n',
    agreePoleId: 's',
    pool: 'onboarding',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-005',
    prompt: 'I am drawn to ideas about what could be, even without full details.',
    axisId: 's-n',
    agreePoleId: 'n',
    pool: 'onboarding',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-006',
    prompt: 'I notice concrete facts before I notice broad themes.',
    axisId: 's-n',
    agreePoleId: 's',
    pool: 'onboarding',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-007',
    prompt: 'I prioritize fairness and consistency when making hard decisions.',
    axisId: 't-f',
    agreePoleId: 't',
    pool: 'onboarding',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-008',
    prompt: 'I weigh people’s feelings heavily when choosing what to do.',
    axisId: 't-f',
    agreePoleId: 'f',
    pool: 'onboarding',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-009',
    prompt: 'Clear logic is more convincing to me than emotional appeal.',
    axisId: 't-f',
    agreePoleId: 't',
    pool: 'onboarding',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-010',
    prompt: 'I like having a clear plan before I begin important work.',
    axisId: 'j-p',
    agreePoleId: 'j',
    pool: 'onboarding',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-011',
    prompt: 'I prefer to keep options open until the last responsible moment.',
    axisId: 'j-p',
    agreePoleId: 'p',
    pool: 'onboarding',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-012',
    prompt: 'Checking tasks off a schedule feels more satisfying than improvising.',
    axisId: 'j-p',
    agreePoleId: 'j',
    pool: 'onboarding',
    isActive: true,
    metadata: { version: 1 },
  },

  // Daily pool questions (fully distinct from onboarding)
  // E/I axis - Extraversion vs Introversion
  {
    id: 'q-013',
    prompt: 'I looked for chances to connect with new people today.',
    axisId: 'e-i',
    agreePoleId: 'e',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-017',
    prompt: 'I felt drained after extended social interaction today.',
    axisId: 'e-i',
    agreePoleId: 'i',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-018',
    prompt: 'I spent time today reflecting on my own thoughts rather than engaging outwardly.',
    axisId: 'e-i',
    agreePoleId: 'i',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-019',
    prompt: 'I initiated conversations with people I encountered today.',
    axisId: 'e-i',
    agreePoleId: 'e',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },

  // S/N axis - Sensing vs Intuition
  {
    id: 'q-014',
    prompt: 'Today I relied on prior evidence before trying a new approach.',
    axisId: 's-n',
    agreePoleId: 's',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-020',
    prompt: 'I noticed several small details that others seemed to miss today.',
    axisId: 's-n',
    agreePoleId: 's',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-021',
    prompt: 'I found myself imagining future possibilities rather than focusing on present facts.',
    axisId: 's-n',
    agreePoleId: 'n',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-022',
    prompt: 'I connected unrelated ideas to form new insights today.',
    axisId: 's-n',
    agreePoleId: 'n',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },

  // T/F axis - Thinking vs Feeling
  {
    id: 'q-015',
    prompt: 'When a tradeoff came up today, I prioritized harmony over strict consistency.',
    axisId: 't-f',
    agreePoleId: 'f',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-023',
    prompt: 'I made a decision today by weighing objective pros and cons first.',
    axisId: 't-f',
    agreePoleId: 't',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-024',
    prompt: 'I considered how my actions would affect others emotionally before proceeding.',
    axisId: 't-f',
    agreePoleId: 'f',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-025',
    prompt: 'I valued logical consistency over personal circumstances in a judgment today.',
    axisId: 't-f',
    agreePoleId: 't',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },

  // J/P axis - Judging vs Perceiving
  {
    id: 'q-016',
    prompt: 'I felt better with a structured plan than with a flexible outline today.',
    axisId: 'j-p',
    agreePoleId: 'j',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-026',
    prompt: 'I adapted my schedule spontaneously when something interesting came up.',
    axisId: 'j-p',
    agreePoleId: 'p',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-027',
    prompt: 'I completed tasks ahead of deadline to avoid last-minute pressure.',
    axisId: 'j-p',
    agreePoleId: 'j',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },
  {
    id: 'q-028',
    prompt: 'I preferred to explore multiple options rather than commit to one path today.',
    axisId: 'j-p',
    agreePoleId: 'p',
    pool: 'daily',
    isActive: true,
    metadata: { version: 1 },
  },

  // Inactive question example (for documentation purposes)
  {
    id: 'q-099',
    prompt: '[DEPRECATED] I prefer email over instant messaging.',
    axisId: 'e-i',
    agreePoleId: 'e',
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
