import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Button, ButtonLabel } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge, BadgeLabel } from '@/components/ui/badge';
import { AnswerItem } from '@/components/today/answer-item';
import { StatusCard } from '@/components/today/status-card';
import { TypeCard } from '@/components/today/type-card';
import { useCurrentTypeSnapshot } from '@/hooks/use-current-type-snapshot';
import { useDailySession } from '@/hooks/use-daily-session';
import { useTodaysSessionDetail } from '@/hooks/use-todays-session-detail';
import { QUESTIONS } from '@/constants/questions';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

/**
 * Get the question text for a given question ID
 */
function getQuestionText(questionId: string): string {
  const question = QUESTIONS.find((q) => q.id === questionId);
  return question?.prompt ?? questionId;
}



export default function TodayScreen() {
  const { startTodaysSession } = useDailySession();
  const { currentType, isLoading: isTypeLoading } = useCurrentTypeSnapshot();
  const {
    detail,
    isLoading: isDetailLoading,
  } = useTodaysSessionDetail();

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
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.cream,
        }}>
        <Text style={{ color: COLORS.softBrown }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.cream }}
      contentContainerStyle={{
        padding: SPACING.xl,
        paddingTop: SPACING['3xl'],
        paddingBottom: SPACING['2xl'],
        gap: SPACING.lg,
      }}
      testID="today-scroll-view">
      {/* Header Card */}
      <Card variant="header">
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View>
            <Text
              style={{
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
                color: COLORS.softBrown,
              }}>
              Today
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES.base,
                color: COLORS.warmGray,
              }}
              testID="today-date">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: SPACING.sm }}>
            {currentType && (
              <Badge variant="sage" size="md" testID="current-type-chip">
                <BadgeLabel>{currentType}</BadgeLabel>
              </Badge>
            )}
            <Button variant="secondary" onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={18} color={COLORS.terracotta} />
              <ButtonLabel variant="secondary">Settings</ButtonLabel>
            </Button>
          </View>
        </View>
      </Card>

      {/* Status Card */}
      <StatusCard
        status={isCompleted ? 'completed' : isInProgress ? 'inProgress' : 'empty'}
        answersCount={answers.length}
        currentType={snapshot?.currentType}
        onStartSession={handleStartSession}
        onResumeSession={handleResumeSession}
      />

      {/* Type Card - Only show when we have a type */}
      {currentType && (
        <TypeCard currentType={currentType} />
      )}

      {/* Today's Answers Section - Only shown when completed */}
      {isCompleted && answers.length > 0 && (
        <Card testID="today-answers-card">
          <CardHeader>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.softBrown} />
              <Text
                style={{
                  fontSize: FONT_SIZES.xl,
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: COLORS.softBrown,
                }}>
                Today&apos;s Reflections
              </Text>
            </View>
          </CardHeader>
          <CardBody gap="md">
            {answers.map((answer, index) => (
              <AnswerItem
                key={answer.questionId}
                questionText={getQuestionText(answer.questionId)}
                answer={answer.answer}
                isLast={index === answers.length - 1}
              />
            ))}
          </CardBody>
        </Card>
      )}

      {/* Empty State Card - Only shown when no session */}
      {isEmpty && (
        <Card testID="daily-habit-card">
          <CardHeader>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.softBrown} />
              <Text
                style={{
                  fontSize: FONT_SIZES.xl,
                  fontWeight: FONT_WEIGHTS.semibold,
                  color: COLORS.softBrown,
                }}>
                Daily Habit
              </Text>
            </View>
          </CardHeader>
          <CardBody gap="md">
            <Text
              style={{
                fontSize: FONT_SIZES.base,
                color: COLORS.warmGray,
                lineHeight: FONT_SIZES.base * 1.5,
              }}>
              Build self-awareness through daily check-ins. Each session takes just a
              minute and helps you track your patterns over time.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <Ionicons name="time-outline" size={16} color={COLORS.warmGray} />
              <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>
                About 1 minute
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <Ionicons name="list-outline" size={16} color={COLORS.warmGray} />
              <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>
                3 quick questions
              </Text>
            </View>
          </CardBody>
        </Card>
      )}

      {/* Recent Activity Card */}
      <Card testID="recent-activity-card">
        <CardHeader>
          <Text
            style={{
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.softBrown,
            }}>
            Recent Activity
          </Text>
        </CardHeader>
        <CardBody>
          {isCompleted ? (
            <View style={{ gap: SPACING.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.sage} />
                <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>
                  Daily check-in completed today
                </Text>
              </View>
              {snapshot && (
                <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.warmGray }}>
                  Type updated to {snapshot.currentType}
                </Text>
              )}
            </View>
          ) : (
            <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.warmGray }}>
              Your journal entries and insights will appear here.
            </Text>
          )}
        </CardBody>
      </Card>
    </ScrollView>
  );
}
