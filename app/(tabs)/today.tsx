import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, Chip, useThemeColor } from 'heroui-native';

import { useCurrentTypeSnapshot } from '@/hooks/use-current-type-snapshot';
import { useDailySession } from '@/hooks/use-daily-session';
import { useTodaysSessionDetail } from '@/hooks/use-todays-session-detail';
import { QUESTIONS } from '@/constants/questions';

/**
 * Get the question text for a given question ID
 */
function getQuestionText(questionId: string): string {
  const question = QUESTIONS.find((q) => q.id === questionId);
  return question?.prompt ?? questionId;
}

/**
 * Format an answer response for display
 */
function formatAnswer(answer: string): string {
  switch (answer) {
    case 'agree':
      return 'Agree';
    case 'disagree':
      return 'Disagree';
    default:
      return answer;
  }
}

export default function TodayScreen() {
  const { startTodaysSession } = useDailySession();
  const { currentType, isLoading: isTypeLoading } = useCurrentTypeSnapshot();
  const {
    detail,
    isLoading: isDetailLoading,
  } = useTodaysSessionDetail();
  const [success, muted] = useThemeColor(['success', 'muted']);

  const session = detail?.session ?? null;
  const isCompleted = session?.status === 'completed';
  const isInProgress = session?.status === 'in_progress';
  const isEmpty = session === null;
  const answers = detail?.answers ?? [];
  const snapshot = detail?.snapshot;

  const isLoading = isTypeLoading || isDetailLoading;

  function handleStartSession() {
    void (async () => {
      await startTodaysSession();
      router.push('/session');
    })();
  }

  function handleResumeSession() {
    router.push('/session');
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        padding: 16,
        paddingTop: 24,
        paddingBottom: 24,
        gap: 16,
      }}
      testID="today-scroll-view">
      {/* Header Card */}
      <Card>
        <Card.Header>
          <View className="flex-row items-center justify-between">
            <View>
              <Card.Title className="text-xl">Today</Card.Title>
              <Card.Description testID="today-date">
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Card.Description>
            </View>
            <View className="items-end gap-2">
              {currentType && (
                <Chip color="accent" variant="soft" size="lg" testID="current-type-chip">
                  <Chip.Label>{currentType}</Chip.Label>
                </Chip>
              )}
              <Button variant="secondary" onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={18} />
                <Button.Label>Settings</Button.Label>
              </Button>
            </View>
          </View>
        </Card.Header>
      </Card>

      {/* Main Action Card - Changes based on state */}
      <Card
        className={isCompleted ? 'bg-success-soft' : isInProgress ? 'bg-accent-soft' : 'bg-surface-secondary'}
        testID="session-action-card">
        <Card.Body className="gap-4">
          <View className="flex-row items-center gap-3">
            <View
              className={`size-12 items-center justify-center rounded-full ${
                isCompleted ? 'bg-success' : isInProgress ? 'bg-accent' : 'bg-surface-tertiary'
              }`}
              testID="session-status-icon">
              <Ionicons
                name={
                  isCompleted
                    ? 'checkmark-circle'
                    : isInProgress
                      ? 'play-circle'
                      : 'sunny-outline'
                }
                size={24}
                color={isCompleted || isInProgress ? 'white' : undefined}
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold" testID="session-status-title">
                {isCompleted
                  ? 'Daily Check-in Complete'
                  : isInProgress
                    ? 'Check-in In Progress'
                    : 'Start Your Day'}
              </Text>
              <Text className="text-text-secondary" testID="session-status-description">
                {isCompleted
                  ? 'Great job completing your daily reflection.'
                  : isInProgress
                    ? 'Continue where you left off.'
                    : 'Take a moment to check in with yourself.'}
              </Text>
            </View>
          </View>

          {/* Empty State */}
          {isEmpty && (
            <Button onPress={handleStartSession} testID="start-session-button">
              <Ionicons name="play-outline" size={18} />
              <Button.Label>Start Daily Check-in</Button.Label>
            </Button>
          )}

          {/* In-Progress State */}
          {isInProgress && (
            <View className="gap-2">
              <Button onPress={handleResumeSession} testID="resume-session-button">
                <Ionicons name="refresh-outline" size={18} />
                <Button.Label>Continue Check-in</Button.Label>
              </Button>
              <Text className="text-center text-xs text-text-tertiary">
                {answers.length > 0
                  ? `${answers.length} question${answers.length === 1 ? '' : 's'} answered`
                  : 'No questions answered yet'}
              </Text>
            </View>
          )}

          {/* Completed State */}
          {isCompleted && (
            <View className="gap-2">
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={success} />
                <Text className="text-sm text-success">Completed today</Text>
              </View>
              {snapshot && (
                <View className="items-center gap-1 pt-2">
                  <Text className="text-xs text-text-tertiary">Current Type</Text>
                  <Text className="text-lg font-bold text-success" testID="completed-type">
                    {snapshot.currentType}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Card.Body>
      </Card>

      {/* Today's Answers Section - Only shown when completed */}
      {isCompleted && answers.length > 0 && (
        <Card testID="today-answers-card">
          <Card.Header>
            <View className="flex-row items-center gap-2">
              <Ionicons name="document-text-outline" size={20} />
              <Card.Title>Today&apos;s Reflections</Card.Title>
            </View>
          </Card.Header>
          <Card.Body className="gap-3">
            {answers.map((answer, index) => (
              <View
                key={answer.questionId}
                className="gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0"
                testID={`answer-item-${index}`}>
                <Text className="text-sm text-text-secondary" testID={`answer-question-${index}`}>
                  {getQuestionText(answer.questionId)}
                </Text>
                <Text
                  className={`font-semibold ${
                    answer.answer === 'agree' ? 'text-success' : 'text-destructive'
                  }`}
                  testID={`answer-response-${index}`}>
                  {formatAnswer(answer.answer)}
                </Text>
              </View>
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Empty State Card - Only shown when no session */}
      {isEmpty && (
        <Card testID="daily-habit-card">
          <Card.Header>
            <View className="flex-row items-center gap-2">
              <Ionicons name="calendar-outline" size={20} />
              <Card.Title>Daily Habit</Card.Title>
            </View>
          </Card.Header>
          <Card.Body className="gap-3">
            <Text className="text-text-secondary">
              Build self-awareness through daily check-ins. Each session takes just a
              minute and helps you track your patterns over time.
            </Text>
            <View className="flex-row items-center gap-2">
              <Ionicons name="time-outline" size={16} color={muted} />
              <Text className="text-sm text-text-secondary">About 1 minute</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="list-outline" size={16} color={muted} />
              <Text className="text-sm text-text-secondary">3 quick questions</Text>
            </View>
          </Card.Body>
        </Card>
      )}

      {/* Recent Activity Card */}
      <Card testID="recent-activity-card">
        <Card.Header>
          <Card.Title>Recent Activity</Card.Title>
        </Card.Header>
        <Card.Body>
          {isCompleted ? (
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="checkmark-circle" size={16} color={success} />
                <Text className="text-sm text-text-secondary">
                  Daily check-in completed today
                </Text>
              </View>
              {snapshot && (
                <Text className="text-xs text-text-tertiary">
                  Type updated to {snapshot.currentType}
                </Text>
              )}
            </View>
          ) : (
            <Text className="text-text-secondary">
              Your journal entries and insights will appear here.
            </Text>
          )}
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
