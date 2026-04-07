import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { AnswerItem } from '@/components/today/answer-item';
import { StatusCard } from '@/components/today/status-card';
import { TypeCard } from '@/components/today/type-card';
import { AppIcon } from '@/components/ui/app-icon';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';
import { QUESTIONS } from '@/constants/questions';
import { useCurrentTypeSnapshot } from '@/hooks/use-current-type-snapshot';
import { useDailySession } from '@/hooks/use-daily-session';
import { useTodaysSessionDetail } from '@/hooks/use-todays-session-detail';

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
          alignItems: 'center',
          backgroundColor: COLORS.cream,
          flex: 1,
          justifyContent: 'center',
        }}>
        <Text style={{ color: COLORS.softBrown }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        gap: SPACING.lg,
        padding: SPACING.xl,
        paddingBottom: SPACING['2xl'],
        paddingTop: SPACING['3xl'],
      }}
      style={{ backgroundColor: COLORS.cream, flex: 1 }}
      testID="today-scroll-view">
      {/* Date - subtle, non-header placement */}
      <Text
        style={{
          color: COLORS.warmGray,
          fontSize: FONT_SIZES.base,
        }}
        testID="today-date">
        {new Date().toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'long',
          weekday: 'long',
          year: 'numeric',
        })}
      </Text>

      {/* Status Card - Summary comes first */}
      <StatusCard
        answersCount={answers.length}
        currentType={snapshot?.currentType}
        onResumeSession={handleResumeSession}
        onStartSession={handleStartSession}
        status={isCompleted ? 'completed' : isInProgress ? 'inProgress' : 'empty'}
      />

      {/* Type Card - Only show when we have a type */}
      {currentType && (
        <TypeCard currentType={currentType} />
      )}

      {/* Today's Answers Section - Only shown when completed */}
      {isCompleted && answers.length > 0 && (
        <Card testID="today-answers-card">
          <CardHeader>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.sm }}>
              <AppIcon color={COLORS.softBrown} name="document-text-outline" size={20} />
              <Text
                style={{
                  color: COLORS.softBrown,
                  fontSize: FONT_SIZES.xl,
                  fontWeight: FONT_WEIGHTS.semibold,
                }}>
                Today&apos;s Reflections
              </Text>
            </View>
          </CardHeader>
          <CardBody gap="md">
            {answers.map((answer, index) => (
              <AnswerItem
                answer={answer.answer}
                isLast={index === answers.length - 1}
                key={answer.questionId}
                questionText={getQuestionText(answer.questionId)}
              />
            ))}
          </CardBody>
        </Card>
      )}

      {/* Empty State Card - Only shown when no session */}
      {isEmpty && (
        <Card testID="daily-habit-card">
          <CardHeader>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.sm }}>
              <AppIcon color={COLORS.softBrown} name="calendar-outline" size={20} />
              <Text
                style={{
                  color: COLORS.softBrown,
                  fontSize: FONT_SIZES.xl,
                  fontWeight: FONT_WEIGHTS.semibold,
                }}>
                Daily Habit
              </Text>
            </View>
          </CardHeader>
          <CardBody gap="md">
            <Text
              style={{
                color: COLORS.warmGray,
                fontSize: FONT_SIZES.base,
                lineHeight: FONT_SIZES.base * 1.5,
              }}>
              Build self-awareness through daily check-ins. Each session takes just a
              minute and helps you track your patterns over time.
            </Text>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.sm }}>
              <AppIcon color={COLORS.warmGray} name="time-outline" size={16} />
              <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>
                About 1 minute
              </Text>
            </View>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.sm }}>
              <AppIcon color={COLORS.warmGray} name="list-outline" size={16} />
              <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>
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
              color: COLORS.softBrown,
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
            }}>
            Recent Activity
          </Text>
        </CardHeader>
        <CardBody>
          {isCompleted ? (
            <View style={{ gap: SPACING.sm }}>
              <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.sm }}>
                <AppIcon color={COLORS.sage} name="checkmark-circle" size={16} />
                <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>
                  Daily check-in completed today
                </Text>
              </View>
              {snapshot && (
                <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.xs }}>
                  Type updated to {snapshot.currentType}
                </Text>
              )}
            </View>
          ) : (
            <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.base }}>
              Your journal entries and insights will appear here.
            </Text>
          )}
        </CardBody>
      </Card>
    </ScrollView>
  );
}



/**
 * Get the question text for a given question ID
 */
function getQuestionText(questionId: string): string {
  const question = QUESTIONS.find((q) => q.id === questionId);
  return question?.prompt ?? questionId;
}
