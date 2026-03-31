import {
  createEmptyAxisExposure,
  createEmptyAxisPoleExposure,
  selectDailyQuestions,
  updateAxisExposure,
  updateQuestionLastUsed,
  type QuestionLastUsedMap,
} from '@/constants/daily-selection';

describe('daily question selection policy', () => {
  it('selects one question from each of the 3 least-exposed axes using fixed axis order when tied', () => {
    const selection = selectDailyQuestions({
      today: '2026-03-31',
      axisExposure: {
        'e-i': 0,
        's-n': 0,
        't-f': 0,
        'j-p': 0,
      },
      axisPoleExposure: createEmptyAxisPoleExposure(),
      questionLastUsed: {},
    });

    expect(selection.questions).toHaveLength(3);
    expect(selection.selectedAxisIds).toEqual(['e-i', 's-n', 't-f']);
    expect(new Set(selection.questions.map((q) => q.axisId))).toEqual(
      new Set(['e-i', 's-n', 't-f'])
    );
  });

  it('uses axis recency tie-breakers before falling back to fixed axis order', () => {
    const lastUsed: QuestionLastUsedMap = {
      // E/I most recently shown axis
      'q-013': 400,
      'q-017': 400,
      'q-018': 400,
      'q-019': 400,
      // S/N
      'q-014': 300,
      'q-020': 300,
      'q-021': 300,
      'q-022': 300,
      // T/F
      'q-015': 200,
      'q-023': 200,
      'q-024': 200,
      'q-025': 200,
      // J/P least recently shown axis
      'q-016': 100,
      'q-026': 100,
      'q-027': 100,
      'q-028': 100,
    };

    const selection = selectDailyQuestions({
      today: '2026-03-31',
      axisExposure: createEmptyAxisExposure(),
      axisPoleExposure: createEmptyAxisPoleExposure(),
      questionLastUsed: lastUsed,
    });

    expect(selection.selectedAxisIds).toEqual(['j-p', 't-f', 's-n']);
    expect(selection.metadata.tieBreakersUsed.length).toBeGreaterThan(0);
  });

  it('prefers the less-used coding direction before recency within an axis', () => {
    const selection = selectDailyQuestions({
      today: '2026-03-31',
      axisExposure: createEmptyAxisExposure(),
      axisPoleExposure: {
        'e-i': { e: 5, i: 1 },
        's-n': { s: 5, n: 1 },
        't-f': { t: 1, f: 5 },
        'j-p': { j: 0, p: 0 },
      },
      questionLastUsed: {
        'q-013': 10,
        'q-019': 20,
        'q-017': 100,
        'q-018': 90,
        'q-014': 10,
        'q-020': 20,
        'q-021': 100,
        'q-022': 90,
        'q-015': 10,
        'q-024': 20,
        'q-023': 100,
        'q-025': 110,
        'q-016': 300,
        'q-026': 300,
        'q-027': 300,
        'q-028': 300,
      },
    });

    expect(selection.selectedAxisIds).toEqual(['e-i', 's-n', 't-f']);
    expect(selection.questions.map((q) => q.id)).toEqual([
      'q-018',
      'q-022',
      'q-023',
    ]);
  });

  it('avoids repeating yesterday question IDs when another valid axis question exists', () => {
    const selection = selectDailyQuestions({
      today: '2026-03-31',
      axisExposure: {
        'e-i': 0,
        's-n': 0,
        't-f': 0,
        'j-p': 10,
      },
      axisPoleExposure: createEmptyAxisPoleExposure(),
      questionLastUsed: {
        'q-013': 1,
        'q-014': 1,
        'q-015': 1,
      },
      yesterdaySession: {
        date: '2026-03-30',
        questionIds: ['q-013', 'q-014', 'q-015'],
      },
    });

    expect(selection.selectedAxisIds).toEqual(['e-i', 's-n', 't-f']);
    expect(selection.questions.map((q) => q.id)).not.toContain('q-013');
    expect(selection.questions.map((q) => q.id)).not.toContain('q-014');
    expect(selection.questions.map((q) => q.id)).not.toContain('q-015');
  });
});

describe('daily selection tracking helpers', () => {
  it('updates per-axis exposure counts from completed question IDs', () => {
    const nextExposure = updateAxisExposure(createEmptyAxisExposure(), [
      'q-013', // e-i
      'q-014', // s-n
      'q-023', // t-f
      'q-016', // j-p
      'q-026', // j-p
    ]);

    expect(nextExposure).toEqual({
      'e-i': 1,
      's-n': 1,
      't-f': 1,
      'j-p': 2,
    });
  });

  it('records a last-used timestamp for each completed question', () => {
    const updated = updateQuestionLastUsed(
      { 'q-013': 10 },
      ['q-013', 'q-020', 'q-023'],
      123456,
    );

    expect(updated).toEqual({
      'q-013': 123456,
      'q-020': 123456,
      'q-023': 123456,
    });
  });
});
