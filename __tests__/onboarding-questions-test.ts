import { QUESTIONS, getQuestionsByPool } from '@/constants/questions';

describe('onboarding question set', () => {
  const onboardingQuestions = getQuestionsByPool('onboarding');
  const dailyQuestions = getQuestionsByPool('daily');

  it('contains exactly 12 active onboarding questions', () => {
    expect(onboardingQuestions).toHaveLength(12);
  });

  it('contains exactly 3 active onboarding questions for each axis', () => {
    const axisCounts = onboardingQuestions.reduce<Record<string, number>>((counts, question) => {
      counts[question.axisId] = (counts[question.axisId] ?? 0) + 1;
      return counts;
    }, {});

    expect(axisCounts).toEqual({
      'e-i': 3,
      's-n': 3,
      't-f': 3,
      'j-p': 3,
    });
  });

  it('is fixed and deterministic by stable question IDs', () => {
    expect(onboardingQuestions.map((question) => question.id)).toEqual([
      'q-001',
      'q-002',
      'q-003',
      'q-004',
      'q-005',
      'q-006',
      'q-007',
      'q-008',
      'q-009',
      'q-010',
      'q-011',
      'q-012',
    ]);
  });

  it('is fully distinct from the daily pool', () => {
    const dailyIds = new Set(dailyQuestions.map((question) => question.id));
    const dailyPrompts = new Set(dailyQuestions.map((question) => question.prompt));

    expect(onboardingQuestions.every((question) => !dailyIds.has(question.id))).toBe(true);
    expect(onboardingQuestions.every((question) => !dailyPrompts.has(question.prompt))).toBe(true);
  });

  it('keeps all onboarding prompts binary and easy to answer', () => {
    expect(onboardingQuestions.every((question) => question.prompt.endsWith('.'))).toBe(true);
    expect(onboardingQuestions.every((question) => question.prompt.length <= 90)).toBe(true);
  });

  it('contains no duplicate question prompts in the full active set', () => {
    const activeQuestions = QUESTIONS.filter((question) => question.isActive);
    const uniquePrompts = new Set(activeQuestions.map((question) => question.prompt));

    expect(uniquePrompts.size).toBe(activeQuestions.length);
  });
});
