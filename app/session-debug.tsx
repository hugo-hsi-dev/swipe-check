import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, Description } from 'heroui-native';

import { QUESTIONS } from '@/constants/questions';
import { useTodaysSessionDetail } from '@/hooks/use-todays-session-detail';
import { clearDailySessionForLocalDay, toLocalDayKey } from '@/lib/local-data/session-lifecycle';
import { getSQLiteDatabase } from '@/lib/local-data/sqlite-runtime';

function getQuestionPrompt(questionId: string): string {
  return QUESTIONS.find((question) => question.id === questionId)?.prompt ?? questionId;
}

function formatAnswer(answer: string): string {
  if (answer === 'agree') {
    return 'Agree';
  }

  if (answer === 'disagree') {
    return 'Disagree';
  }

  return answer;
}

export default function SessionDebugScreen() {
  const { detail, isLoading, error, refresh } = useTodaysSessionDetail();
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const session = detail?.session ?? null;
  const answers = detail?.answers ?? [];
  const snapshot = detail?.snapshot ?? null;
  const localDayKey = toLocalDayKey(new Date());

  async function handleRefresh() {
    await refresh();
  }

  async function handleResetToday() {
    setIsResetting(true);
    setResetError(null);

    try {
      const db = await getSQLiteDatabase();
      await clearDailySessionForLocalDay(db, localDayKey);
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset today\'s session';
      setResetError(message);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 24, gap: 16 }}>
      <Card>
        <Card.Body className="gap-3">
          <View className="flex-row items-center gap-3">
            <View className="size-12 items-center justify-center rounded-full bg-accent-soft">
              <Ionicons name="bug-outline" size={24} />
            </View>
            <View className="flex-1">
              <Card.Title>Daily Check-in Debug</Card.Title>
              <Description>Inspect today&apos;s session state and reset only today&apos;s check-in.</Description>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <Chip color="accent" variant="soft">
              <Chip.Label>{localDayKey}</Chip.Label>
            </Chip>
            <Chip color={session?.status === 'completed' ? 'success' : 'accent'} variant="soft">
              <Chip.Label>{session?.status ?? 'no session'}</Chip.Label>
            </Chip>
          </View>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="gap-3">
          <Card.Title>Current State</Card.Title>

          {isLoading ? (
            <Text>Loading...</Text>
          ) : error ? (
            <Text className="text-destructive">{error.message}</Text>
          ) : session ? (
            <View className="gap-2">
              <Text className="text-text-secondary">Session ID: {session.id}</Text>
              <Text className="text-text-secondary">Status: {session.status}</Text>
              <Text className="text-text-secondary">Answers: {answers.length}</Text>
              <Text className="text-text-secondary">
                Current Type: {snapshot?.currentType ?? 'not available yet'}
              </Text>
            </View>
          ) : (
            <Text className="text-text-secondary">No daily session exists for today.</Text>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="gap-3">
          <Card.Title>Answers</Card.Title>

          {answers.length > 0 ? (
            <View className="gap-3">
              {answers.map((answer, index) => (
                <View key={answer.questionId} className="gap-1 rounded-xl bg-surface-secondary p-3">
                  <Text className="text-xs text-text-tertiary">Answer {index + 1}</Text>
                  <Text className="text-sm text-foreground">{getQuestionPrompt(answer.questionId)}</Text>
                  <Text className="font-semibold text-success">{formatAnswer(answer.answer)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-text-secondary">No answers saved yet.</Text>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="gap-3">
          <Card.Title>Debug Actions</Card.Title>
          <Description>
            Resetting today only deletes the current daily session, its answers, and its snapshot.
          </Description>

          {resetError && <Text className="text-destructive">{resetError}</Text>}

          <Button onPress={handleRefresh} variant="secondary" isDisabled={isResetting}>
            <Ionicons name="refresh-outline" size={18} />
            <Button.Label>Refresh</Button.Label>
          </Button>

          <Button onPress={handleResetToday} variant="danger" isDisabled={isResetting}>
            <Ionicons name="trash-outline" size={18} />
            <Button.Label>{isResetting ? 'Resetting…' : 'Reset today'}</Button.Label>
          </Button>

          <Button onPress={() => router.push('/today')} variant="secondary">
            <Ionicons name="arrow-forward-outline" size={18} />
            <Button.Label>Open Today</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
