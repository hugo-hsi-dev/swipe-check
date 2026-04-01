import type { QuestionResponse } from '@/constants/question-contract';
import {
  completeOnboardingSession,
  completeSession,
  getOrCreateDailySessionForLocalDay,
  hasCompletedOnboardingSession,
  OnboardingCompletionError,
  readActiveOrLatestDailySession,
  readAllTypeSnapshots,
  readCompletedSessionDetail,
  readCompletedSessionHistory,
  readLatestTypeSnapshot,
  readSessionAnswers,
  readSessionTypeSnapshot,
  startOrResumeOnboardingSession,
  toLocalDayKey,
  upsertSessionAnswer,
  upsertTypeSnapshot,
} from '@/lib/local-data/session-lifecycle';
import type { LocalDatabaseAdapter } from '@/lib/local-data/bootstrap';
import type { TypeSnapshot } from '@/constants/scoring-contract';

type SessionRecord = {
  id: string;
  type: 'onboarding' | 'daily';
  status: 'in_progress' | 'completed';
  localDayKey: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type SessionAnswerRecord = {
  sessionId: string;
  questionId: string;
  answer: QuestionResponse;
  answeredAt: string;
  createdAt: string;
  updatedAt: string;
};

class FakeSessionAdapter implements LocalDatabaseAdapter {
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly answers = new Map<string, SessionAnswerRecord>();
  private readonly snapshots = new Map<string, TypeSnapshot>();

  async execAsync(_sql: string): Promise<void> {
    // no-op for tests
  }

  async runAsync(sql: string, ...params: (string | number | null)[]): Promise<unknown> {
    if (sql.includes("INSERT INTO sessions") && sql.includes("'onboarding'")) {
      const [id, startedAt, createdAt, updatedAt] = params as [string, string, string, string];
      this.sessions.set(id, {
        id,
        type: 'onboarding',
        status: 'in_progress',
        localDayKey: null,
        startedAt,
        completedAt: null,
        createdAt,
        updatedAt,
      });
      return;
    }

    if (sql.includes("INSERT INTO sessions") && sql.includes("'daily'")) {
      const [id, localDayKey, startedAt, createdAt, updatedAt] = params as [
        string,
        string,
        string,
        string,
        string,
      ];

      for (const session of this.sessions.values()) {
        if (session.type === 'daily' && session.localDayKey === localDayKey) {
          throw new Error('UNIQUE constraint failed: sessions.session_type, sessions.local_day_key');
        }
      }

      this.sessions.set(id, {
        id,
        type: 'daily',
        status: 'in_progress',
        localDayKey,
        startedAt,
        completedAt: null,
        createdAt,
        updatedAt,
      });
      return;
    }

    if (sql.includes('INSERT INTO session_answers')) {
      const [sessionId, questionId, answer, answeredAt, createdAt, updatedAt] = params as [
        string,
        string,
        QuestionResponse,
        string,
        string,
        string,
      ];

      this.answers.set(`${sessionId}::${questionId}`, {
        sessionId,
        questionId,
        answer,
        answeredAt,
        createdAt,
        updatedAt,
      });
      return;
    }

    if (sql.includes('UPDATE sessions')) {
      const [completedAt, updatedAt, sessionId] = params as [string, string, string];
      const session = this.sessions.get(sessionId);
      if (!session) {
        return;
      }

      this.sessions.set(sessionId, {
        ...session,
        status: 'completed',
        completedAt,
        updatedAt,
      });
      return;
    }

    if (sql.includes('INSERT INTO type_snapshots')) {
      const [
        id,
        sessionId,
        currentType,
        axisScoresJson,
        axisStrengthsJson,
        sourceType,
        sourceSessionId,
        questionCount,
        createdAt,
      ] = params as [string, string | null, string, string, string, 'onboarding' | 'daily' | 'manual', string | null, number, string];

      this.snapshots.set(id, {
        id,
        currentType,
        axisScores: JSON.parse(axisScoresJson),
        axisStrengths: JSON.parse(axisStrengthsJson),
        createdAt: new Date(createdAt),
        source: {
          type: sourceType,
          sessionId: sourceSessionId ?? undefined,
        },
        questionCount,
      });
    }
  }

  async getFirstAsync<T>(sql: string, ...params: (string | number | null)[]): Promise<T | null> {
    // Handle COUNT queries for answers
    if (sql.includes('SELECT COUNT(*) as count') && sql.includes('FROM session_answers')) {
      const [sessionId] = params as [string];
      const count = [...this.answers.values()].filter((a) => a.sessionId === sessionId).length;
      return { count } as T;
    }

    if (sql.includes("session_type = 'onboarding'") && sql.includes("status = 'in_progress'")) {
      const onboardingSession = [...this.sessions.values()]
        .filter((session) => session.type === 'onboarding' && session.status === 'in_progress')
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

      if (!onboardingSession) {
        return null;
      }

      return {
        id: onboardingSession.id,
        session_type: onboardingSession.type,
        status: onboardingSession.status,
        local_day_key: onboardingSession.localDayKey,
        started_at: onboardingSession.startedAt,
        completed_at: onboardingSession.completedAt,
        created_at: onboardingSession.createdAt,
        updated_at: onboardingSession.updatedAt,
      } as T;
    }

    if (sql.includes("WHERE session_type = 'daily'") && sql.includes("CASE WHEN status = 'in_progress'")) {
      const dailySession = [...this.sessions.values()]
        .filter((session) => session.type === 'daily')
        .sort((a, b) => {
          const aRank = a.status === 'in_progress' ? 0 : 1;
          const bRank = b.status === 'in_progress' ? 0 : 1;
          if (aRank !== bRank) {
            return aRank - bRank;
          }

          return b.startedAt.localeCompare(a.startedAt) || b.id.localeCompare(a.id);
        })[0];

      if (!dailySession) {
        return null;
      }

      return {
        id: dailySession.id,
        session_type: dailySession.type,
        status: dailySession.status,
        local_day_key: dailySession.localDayKey,
        started_at: dailySession.startedAt,
        completed_at: dailySession.completedAt,
        created_at: dailySession.createdAt,
        updated_at: dailySession.updatedAt,
      } as T;
    }

    if (sql.includes("session_type = 'daily'")) {
      const [localDayKey] = params as [string];
      const dailySession = [...this.sessions.values()]
        .filter((session) => session.type === 'daily' && session.localDayKey === localDayKey)
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

      if (!dailySession) {
        return null;
      }

      return {
        id: dailySession.id,
        session_type: dailySession.type,
        status: dailySession.status,
        local_day_key: dailySession.localDayKey,
        started_at: dailySession.startedAt,
        completed_at: dailySession.completedAt,
        created_at: dailySession.createdAt,
        updated_at: dailySession.updatedAt,
      } as T;
    }

    if (sql.includes("WHERE session_type = 'onboarding' AND status = 'completed'") && !sql.includes('SELECT id, session_type, status')) {
      const completedOnboardingSession = [...this.sessions.values()].find(
        (session) => session.type === 'onboarding' && session.status === 'completed'
      );
      return completedOnboardingSession ? ({ id: completedOnboardingSession.id } as T) : null;
    }

    // Handle session validation for completeOnboardingSession
    if (sql.includes("WHERE id = ? AND session_type = 'onboarding' AND status = 'in_progress'")) {
      const [sessionId] = params as [string];
      const session = this.sessions.get(sessionId);

      if (!session || session.type !== 'onboarding' || session.status !== 'in_progress') {
        return null;
      }

      return {
        id: session.id,
        session_type: session.type,
        status: session.status,
      } as T;
    }

    if (sql.includes('WHERE id = ? AND status = \'completed\'')) {
      const [sessionId] = params as [string];
      const session = this.sessions.get(sessionId);

      if (!session || session.status !== 'completed') {
        return null;
      }

      return {
        id: session.id,
        session_type: session.type,
        status: session.status,
        local_day_key: session.localDayKey,
        started_at: session.startedAt,
        completed_at: session.completedAt,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
      } as T;
    }

    if (sql.includes('FROM type_snapshots') && sql.includes('WHERE session_id = ?')) {
      const [sessionId] = params as [string];
      const snapshot = [...this.snapshots.values()]
        .filter((entry) => entry.source.sessionId === sessionId)
        .sort((a, b) => b.createdAt.toISOString().localeCompare(a.createdAt.toISOString()))[0];

      if (!snapshot) {
        return null;
      }

      return {
        id: snapshot.id,
        session_id: snapshot.source.sessionId ?? null,
        current_type: snapshot.currentType,
        axis_scores_json: JSON.stringify(snapshot.axisScores),
        axis_strengths_json: JSON.stringify(snapshot.axisStrengths),
        source_type: snapshot.source.type,
        source_session_id: snapshot.source.sessionId ?? null,
        question_count: snapshot.questionCount,
        created_at: snapshot.createdAt.toISOString(),
      } as T;
    }

    if (sql.includes('FROM type_snapshots') && sql.includes('ORDER BY created_at DESC, id DESC')) {
      const snapshot = [...this.snapshots.values()].sort(
        (a, b) => b.createdAt.toISOString().localeCompare(a.createdAt.toISOString()) || b.id.localeCompare(a.id)
      )[0];

      if (!snapshot) {
        return null;
      }

      return {
        id: snapshot.id,
        session_id: snapshot.source.sessionId ?? null,
        current_type: snapshot.currentType,
        axis_scores_json: JSON.stringify(snapshot.axisScores),
        axis_strengths_json: JSON.stringify(snapshot.axisStrengths),
        source_type: snapshot.source.type,
        source_session_id: snapshot.source.sessionId ?? null,
        question_count: snapshot.questionCount,
        created_at: snapshot.createdAt.toISOString(),
      } as T;
    }

    return null;
  }

  async getAllAsync<T>(sql: string, ...params: (string | number | null)[]): Promise<T[]> {
    if (sql.includes('FROM session_answers')) {
      const [sessionId] = params as [string];

      return [...this.answers.values()]
        .filter((answer) => answer.sessionId === sessionId)
        .sort((a, b) => a.answeredAt.localeCompare(b.answeredAt) || a.questionId.localeCompare(b.questionId))
        .map((answer) => ({
          session_id: answer.sessionId,
          question_id: answer.questionId,
          answer: answer.answer,
          answered_at: answer.answeredAt,
        })) as T[];
    }

    if (sql.includes('FROM sessions s') && sql.includes("WHERE s.status = 'completed'")) {
      const [limit] = params as [number | undefined];
      const normalizedLimit =
        typeof limit === 'number' && Number.isFinite(limit) && limit >= 0 ? Math.trunc(limit) : null;

      const rows = [...this.sessions.values()]
        .filter((session) => session.status === 'completed')
        .sort(
          (a, b) =>
            (b.completedAt ?? '').localeCompare(a.completedAt ?? '') ||
            b.startedAt.localeCompare(a.startedAt) ||
            b.id.localeCompare(a.id)
        )
        .map((session) => {
          const snapshot = [...this.snapshots.values()]
            .filter((entry) => entry.source.sessionId === session.id)
            .sort(
              (a, b) =>
                b.createdAt.toISOString().localeCompare(a.createdAt.toISOString()) || b.id.localeCompare(a.id)
            )[0];

          return {
            id: session.id,
            session_type: session.type,
            status: session.status,
            local_day_key: session.localDayKey,
            started_at: session.startedAt,
            completed_at: session.completedAt,
            created_at: session.createdAt,
            updated_at: session.updatedAt,
            snapshot_id: snapshot?.id ?? null,
            snapshot_session_id: snapshot?.source.sessionId ?? null,
            current_type: snapshot?.currentType ?? null,
            axis_scores_json: snapshot ? JSON.stringify(snapshot.axisScores) : null,
            axis_strengths_json: snapshot ? JSON.stringify(snapshot.axisStrengths) : null,
            source_type: snapshot?.source.type ?? null,
            source_session_id: snapshot?.source.sessionId ?? null,
            question_count: snapshot?.questionCount ?? null,
            snapshot_created_at: snapshot?.createdAt.toISOString() ?? null,
          };
        });

      return (normalizedLimit === null ? rows : rows.slice(0, normalizedLimit)) as T[];
    }

    if (sql.includes('FROM type_snapshots')) {
      return [...this.snapshots.values()]
        .sort((a, b) => a.createdAt.toISOString().localeCompare(b.createdAt.toISOString()) || a.id.localeCompare(b.id))
        .map((snapshot) => ({
          id: snapshot.id,
          session_id: snapshot.source.sessionId ?? null,
          current_type: snapshot.currentType,
          axis_scores_json: JSON.stringify(snapshot.axisScores),
          axis_strengths_json: JSON.stringify(snapshot.axisStrengths),
          source_type: snapshot.source.type,
          source_session_id: snapshot.source.sessionId ?? null,
          question_count: snapshot.questionCount,
          created_at: snapshot.createdAt.toISOString(),
        })) as T[];
    }

    return [];
  }
}

describe('session lifecycle persistence helpers', () => {
  it('starts onboarding once and resumes same in-progress session across restarts', async () => {
    const adapter = new FakeSessionAdapter();

    const first = await startOrResumeOnboardingSession(adapter, new Date('2026-01-01T08:00:00.000Z'));
    const second = await startOrResumeOnboardingSession(adapter, new Date('2026-01-01T09:00:00.000Z'));

    expect(second.id).toBe(first.id);
    expect(second.status).toBe('in_progress');
  });

  it('persists and updates answers for a session without duplicating question entries', async () => {
    const adapter = new FakeSessionAdapter();
    const session = await startOrResumeOnboardingSession(adapter, new Date('2026-01-01T08:00:00.000Z'));

    await upsertSessionAnswer(adapter, session.id, 'q-001', 'agree', new Date('2026-01-01T08:01:00.000Z'));
    await upsertSessionAnswer(adapter, session.id, 'q-001', 'disagree', new Date('2026-01-01T08:02:00.000Z'));
    await upsertSessionAnswer(adapter, session.id, 'q-002', 'agree', new Date('2026-01-01T08:03:00.000Z'));

    const answers = await readSessionAnswers(adapter, session.id);

    expect(answers).toEqual([
      {
        sessionId: session.id,
        questionId: 'q-001',
        answer: 'disagree',
        answeredAt: '2026-01-01T08:02:00.000Z',
      },
      {
        sessionId: session.id,
        questionId: 'q-002',
        answer: 'agree',
        answeredAt: '2026-01-01T08:03:00.000Z',
      },
    ]);
  });

  it('enforces one daily session per local calendar day and reuses completed session', async () => {
    const adapter = new FakeSessionAdapter();
    const localDayKey = '2026-01-01';

    const first = await getOrCreateDailySessionForLocalDay(
      adapter,
      localDayKey,
      new Date('2026-01-01T08:00:00.000Z')
    );

    await completeSession(adapter, first.id, new Date('2026-01-01T08:10:00.000Z'));

    const reopened = await getOrCreateDailySessionForLocalDay(
      adapter,
      localDayKey,
      new Date('2026-01-01T11:00:00.000Z')
    );

    expect(reopened.id).toBe(first.id);
    expect(reopened.status).toBe('completed');
  });

  it('resumes same in-progress daily session across restarts with partial answers', async () => {
    const adapter = new FakeSessionAdapter();
    const localDayKey = '2026-01-01';

    // First launch - create daily session and add partial answers
    const firstSession = await getOrCreateDailySessionForLocalDay(
      adapter,
      localDayKey,
      new Date('2026-01-01T08:00:00.000Z')
    );

    await upsertSessionAnswer(adapter, firstSession.id, 'q-013', 'agree', new Date('2026-01-01T08:01:00.000Z'));
    await upsertSessionAnswer(adapter, firstSession.id, 'q-014', 'disagree', new Date('2026-01-01T08:02:00.000Z'));

    // Simulate app restart - same day, later time
    const resumedSession = await getOrCreateDailySessionForLocalDay(
      adapter,
      localDayKey,
      new Date('2026-01-01T12:00:00.000Z')
    );

    // Should be the same session
    expect(resumedSession.id).toBe(firstSession.id);
    expect(resumedSession.status).toBe('in_progress');

    // Answers should persist
    const answers = await readSessionAnswers(adapter, resumedSession.id);
    expect(answers).toHaveLength(2);
    expect(answers.map((a) => a.questionId)).toContain('q-013');
    expect(answers.map((a) => a.questionId)).toContain('q-014');

    // Can continue adding answers
    await upsertSessionAnswer(adapter, resumedSession.id, 'q-023', 'agree', new Date('2026-01-01T12:05:00.000Z'));
    const updatedAnswers = await readSessionAnswers(adapter, resumedSession.id);
    expect(updatedAnswers).toHaveLength(3);
  });

  it('generates local day keys using device-local calendar boundaries', () => {
    expect(toLocalDayKey(new Date('2026-01-01T23:59:59.999Z'))).toMatch(/^2026-\d{2}-\d{2}$/);
  });

  it('persists and reloads type snapshots for completed sessions', async () => {
    const adapter = new FakeSessionAdapter();
    const session = await startOrResumeOnboardingSession(adapter, new Date('2026-01-01T08:00:00.000Z'));

    const snapshot: TypeSnapshot = {
      id: 'snap-001',
      currentType: 'INTJ',
      axisScores: [],
      axisStrengths: [],
      createdAt: new Date('2026-01-01T08:04:00.000Z'),
      source: { type: 'onboarding', sessionId: session.id },
      questionCount: 12,
    };

    await upsertTypeSnapshot(adapter, snapshot);

    const storedForSession = await readSessionTypeSnapshot(adapter, session.id);
    const history = await readAllTypeSnapshots(adapter);

    expect(storedForSession).toEqual(snapshot);
    expect(history).toEqual([snapshot]);
  });

  it('reads onboarding completion state for settings', async () => {
    const adapter = new FakeSessionAdapter();
    const session = await startOrResumeOnboardingSession(adapter, new Date('2026-01-01T08:00:00.000Z'));

    expect(await hasCompletedOnboardingSession(adapter)).toBe(false);

    await completeSession(adapter, session.id, new Date('2026-01-01T08:10:00.000Z'));

    expect(await hasCompletedOnboardingSession(adapter)).toBe(true);
  });

  it('reads active daily session before falling back to the latest completed one', async () => {
    const adapter = new FakeSessionAdapter();
    const first = await getOrCreateDailySessionForLocalDay(adapter, '2026-01-01', new Date('2026-01-01T08:00:00.000Z'));
    await completeSession(adapter, first.id, new Date('2026-01-01T08:05:00.000Z'));

    const second = await getOrCreateDailySessionForLocalDay(adapter, '2026-01-02', new Date('2026-01-02T08:00:00.000Z'));
    await completeSession(adapter, second.id, new Date('2026-01-02T08:05:00.000Z'));

    const third = await getOrCreateDailySessionForLocalDay(adapter, '2026-01-03', new Date('2026-01-03T08:00:00.000Z'));

    const active = await readActiveOrLatestDailySession(adapter);
    expect(active?.id).toBe(third.id);

    await completeSession(adapter, third.id, new Date('2026-01-03T08:05:00.000Z'));
    const fallback = await readActiveOrLatestDailySession(adapter);
    expect(fallback?.id).toBe(third.id);
  });

  it('reads completed history list and entry detail for journal', async () => {
    const adapter = new FakeSessionAdapter();
    const onboarding = await startOrResumeOnboardingSession(adapter, new Date('2026-01-01T08:00:00.000Z'));
    await upsertSessionAnswer(adapter, onboarding.id, 'q-001', 'agree', new Date('2026-01-01T08:01:00.000Z'));
    await completeSession(adapter, onboarding.id, new Date('2026-01-01T08:02:00.000Z'));

    const daily = await getOrCreateDailySessionForLocalDay(adapter, '2026-01-02', new Date('2026-01-02T08:00:00.000Z'));
    await upsertSessionAnswer(adapter, daily.id, 'q-002', 'disagree', new Date('2026-01-02T08:01:00.000Z'));
    await completeSession(adapter, daily.id, new Date('2026-01-02T08:02:00.000Z'));

    const snapshot: TypeSnapshot = {
      id: 'snap-002',
      currentType: 'ENTP',
      axisScores: [],
      axisStrengths: [],
      createdAt: new Date('2026-01-02T08:03:00.000Z'),
      source: { type: 'daily', sessionId: daily.id },
      questionCount: 1,
    };
    await upsertTypeSnapshot(adapter, snapshot);

    const history = await readCompletedSessionHistory(adapter);
    const detail = await readCompletedSessionDetail(adapter, daily.id);
    const truncated = await readCompletedSessionHistory(adapter, 1);

    expect(history.map((entry) => entry.session.id)).toEqual([daily.id, onboarding.id]);
    expect(history[0]?.snapshot).toEqual(snapshot);
    expect(detail?.answers).toHaveLength(1);
    expect(detail?.snapshot).toEqual(snapshot);
    expect(truncated).toHaveLength(1);
  });

  it('reads current type snapshot for insights', async () => {
    const adapter = new FakeSessionAdapter();
    const onboarding = await startOrResumeOnboardingSession(adapter, new Date('2026-01-01T08:00:00.000Z'));
    await completeSession(adapter, onboarding.id, new Date('2026-01-01T08:10:00.000Z'));

    const firstSnapshot: TypeSnapshot = {
      id: 'snap-003',
      currentType: 'INTJ',
      axisScores: [],
      axisStrengths: [],
      createdAt: new Date('2026-01-01T08:11:00.000Z'),
      source: { type: 'onboarding', sessionId: onboarding.id },
      questionCount: 12,
    };

    const secondSnapshot: TypeSnapshot = {
      ...firstSnapshot,
      id: 'snap-004',
      currentType: 'INFJ',
      createdAt: new Date('2026-01-02T08:11:00.000Z'),
    };

    await upsertTypeSnapshot(adapter, firstSnapshot);
    await upsertTypeSnapshot(adapter, secondSnapshot);

    const latest = await readLatestTypeSnapshot(adapter);
    expect(latest).toEqual(secondSnapshot);
  });
});

describe('onboarding assessment controller', () => {
  it('refuses to complete onboarding with fewer than 12 answers', async () => {
    const adapter = new FakeSessionAdapter();
    const session = await startOrResumeOnboardingSession(adapter, new Date('2026-01-01T08:00:00.000Z'));

    // Add only 11 answers
    for (let i = 1; i <= 11; i++) {
      await upsertSessionAnswer(
        adapter,
        session.id,
        `q-${String(i).padStart(3, '0')}`,
        'agree',
        new Date(`2026-01-01T08:${String(i).padStart(2, '0')}:00.000Z`)
      );
    }

    const snapshot: TypeSnapshot = {
      id: 'snap-onboarding-001',
      currentType: 'ESTJ',
      axisScores: [],
      axisStrengths: [],
      createdAt: new Date('2026-01-01T08:15:00.000Z'),
      source: { type: 'onboarding', sessionId: session.id },
      questionCount: 11,
    };

    await expect(
      completeOnboardingSession(adapter, session.id, snapshot)
    ).rejects.toThrow(OnboardingCompletionError);

    await expect(
      completeOnboardingSession(adapter, session.id, snapshot)
    ).rejects.toThrow('Onboarding requires 12 answers, but only 11 provided');

    // Verify session is still in progress
    const answers = await readSessionAnswers(adapter, session.id);
    expect(answers).toHaveLength(11);
  });

  it('completes onboarding successfully with exactly 12 answers and stores snapshot', async () => {
    const adapter = new FakeSessionAdapter();
    const session = await startOrResumeOnboardingSession(adapter, new Date('2026-01-01T08:00:00.000Z'));

    // Add exactly 12 answers
    for (let i = 1; i <= 12; i++) {
      await upsertSessionAnswer(
        adapter,
        session.id,
        `q-${String(i).padStart(3, '0')}`,
        i % 2 === 0 ? 'agree' : 'disagree',
        new Date(`2026-01-01T08:${String(i).padStart(2, '0')}:00.000Z`)
      );
    }

    const snapshot: TypeSnapshot = {
      id: 'snap-onboarding-002',
      currentType: 'INTJ',
      axisScores: [],
      axisStrengths: [],
      createdAt: new Date('2026-01-01T08:15:00.000Z'),
      source: { type: 'onboarding', sessionId: session.id },
      questionCount: 12,
    };

    await completeOnboardingSession(adapter, session.id, snapshot, new Date('2026-01-01T08:20:00.000Z'));

    // Verify session is completed
    expect(await hasCompletedOnboardingSession(adapter)).toBe(true);

    // Verify snapshot was stored
    const storedSnapshot = await readSessionTypeSnapshot(adapter, session.id);
    expect(storedSnapshot).toEqual(snapshot);
  });

  it('resumes onboarding session with existing answers after app restart', async () => {
    const adapter = new FakeSessionAdapter();
    const now = new Date('2026-01-01T08:00:00.000Z');

    // First "app launch" - start session and answer 5 questions
    const firstSession = await startOrResumeOnboardingSession(adapter, now);
    for (let i = 1; i <= 5; i++) {
      await upsertSessionAnswer(
        adapter,
        firstSession.id,
        `q-${String(i).padStart(3, '0')}`,
        'agree',
        new Date(`2026-01-01T08:${String(i).padStart(2, '0')}:00.000Z`)
      );
    }

    // Simulate app restart - resume the same session
    const resumedSession = await startOrResumeOnboardingSession(
      adapter,
      new Date('2026-01-01T09:00:00.000Z')
    );

    // Should be the same session
    expect(resumedSession.id).toBe(firstSession.id);
    expect(resumedSession.status).toBe('in_progress');

    // Verify existing answers are preserved
    const answers = await readSessionAnswers(adapter, resumedSession.id);
    expect(answers).toHaveLength(5);
    expect(answers.map((a) => a.questionId)).toContain('q-001');
    expect(answers.map((a) => a.questionId)).toContain('q-005');

    // Continue answering from where we left off
    for (let i = 6; i <= 12; i++) {
      await upsertSessionAnswer(
        adapter,
        resumedSession.id,
        `q-${String(i).padStart(3, '0')}`,
        'disagree',
        new Date(`2026-01-01T09:${String(i).padStart(2, '0')}:00.000Z`)
      );
    }

    // Complete onboarding
    const snapshot: TypeSnapshot = {
      id: 'snap-onboarding-003',
      currentType: 'ENFP',
      axisScores: [],
      axisStrengths: [],
      createdAt: new Date('2026-01-01T09:30:00.000Z'),
      source: { type: 'onboarding', sessionId: resumedSession.id },
      questionCount: 12,
    };

    await completeOnboardingSession(adapter, resumedSession.id, snapshot);
    expect(await hasCompletedOnboardingSession(adapter)).toBe(true);
  });

  it('prevents completing an already completed onboarding session', async () => {
    const adapter = new FakeSessionAdapter();
    const session = await startOrResumeOnboardingSession(adapter, new Date('2026-01-01T08:00:00.000Z'));

    // Add 12 answers and complete once
    for (let i = 1; i <= 12; i++) {
      await upsertSessionAnswer(
        adapter,
        session.id,
        `q-${String(i).padStart(3, '0')}`,
        'agree',
        new Date(`2026-01-01T08:${String(i).padStart(2, '0')}:00.000Z`)
      );
    }

    const firstSnapshot: TypeSnapshot = {
      id: 'snap-onboarding-004',
      currentType: 'ISTJ',
      axisScores: [],
      axisStrengths: [],
      createdAt: new Date('2026-01-01T08:15:00.000Z'),
      source: { type: 'onboarding', sessionId: session.id },
      questionCount: 12,
    };

    await completeOnboardingSession(adapter, session.id, firstSnapshot);

    // Try to complete again - should fail because session is no longer in_progress
    const secondSnapshot: TypeSnapshot = {
      ...firstSnapshot,
      id: 'snap-onboarding-005',
      currentType: 'ENFP',
    };

    await expect(
      completeOnboardingSession(adapter, session.id, secondSnapshot)
    ).rejects.toThrow(OnboardingCompletionError);
  });

  it('tracks onboarding progress correctly through partial completion', async () => {
    const adapter = new FakeSessionAdapter();
    const session = await startOrResumeOnboardingSession(adapter, new Date('2026-01-01T08:00:00.000Z'));

    // Answer 3 questions
    for (let i = 1; i <= 3; i++) {
      await upsertSessionAnswer(
        adapter,
        session.id,
        `q-${String(i).padStart(3, '0')}`,
        'agree',
        new Date(`2026-01-01T08:${String(i).padStart(2, '0')}:00.000Z`)
      );
    }

    let answers = await readSessionAnswers(adapter, session.id);
    expect(answers).toHaveLength(3);

    // Answer 7 more questions
    for (let i = 4; i <= 10; i++) {
      await upsertSessionAnswer(
        adapter,
        session.id,
        `q-${String(i).padStart(3, '0')}`,
        'disagree',
        new Date(`2026-01-01T08:${String(i).padStart(2, '0')}:00.000Z`)
      );
    }

    answers = await readSessionAnswers(adapter, session.id);
    expect(answers).toHaveLength(10);

    // Cannot complete yet
    const incompleteSnapshot: TypeSnapshot = {
      id: 'snap-onboarding-incomplete',
      currentType: 'ESTJ',
      axisScores: [],
      axisStrengths: [],
      createdAt: new Date('2026-01-01T08:30:00.000Z'),
      source: { type: 'onboarding', sessionId: session.id },
      questionCount: 10,
    };

    await expect(
      completeOnboardingSession(adapter, session.id, incompleteSnapshot)
    ).rejects.toThrow('Onboarding requires 12 answers, but only 10 provided');

    // Answer remaining 2 questions
    await upsertSessionAnswer(
      adapter,
      session.id,
      'q-011',
      'agree',
      new Date('2026-01-01T08:11:00.000Z')
    );
    await upsertSessionAnswer(
      adapter,
      session.id,
      'q-012',
      'disagree',
      new Date('2026-01-01T08:12:00.000Z')
    );

    // Now completion should succeed
    const completeSnapshot: TypeSnapshot = {
      id: 'snap-onboarding-complete',
      currentType: 'INTP',
      axisScores: [],
      axisStrengths: [],
      createdAt: new Date('2026-01-01T08:35:00.000Z'),
      source: { type: 'onboarding', sessionId: session.id },
      questionCount: 12,
    };

    await completeOnboardingSession(adapter, session.id, completeSnapshot);
    expect(await hasCompletedOnboardingSession(adapter)).toBe(true);
  });
});
