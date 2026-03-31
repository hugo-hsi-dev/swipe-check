import type { QuestionResponse } from '@/constants/question-contract';
import {
  completeSession,
  getOrCreateDailySessionForLocalDay,
  hasCompletedOnboardingSession,
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

    if (sql.includes("WHERE session_type = 'onboarding' AND status = 'completed'")) {
      const completedOnboardingSession = [...this.sessions.values()].find(
        (session) => session.type === 'onboarding' && session.status === 'completed'
      );
      return completedOnboardingSession ? ({ id: completedOnboardingSession.id } as T) : null;
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
      return [...this.sessions.values()]
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
        }) as T[];
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
