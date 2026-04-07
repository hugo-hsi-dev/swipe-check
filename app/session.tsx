import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { ProgressBar } from '@/components/session/progress-bar';
import { SwipeableQuestionCard } from '@/components/session/swipeable-question-card';
import { Badge, BadgeLabel } from '@/components/ui/badge';
import { Button, ButtonLabel } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';
import { AXES } from '@/constants/questions';
import { useDailySessionFlow } from '@/hooks/use-daily-session-flow';

export default function SessionScreen() {
  const {
    answeredCount,
    currentQuestionIndex,
    error,
    isSubmitting,
    phase,
    progressPercentage,
    questions,
    submitAnswer,
    totalCount,
  } = useDailySessionFlow();

  const accent = COLORS.terracotta;

  function handleGoBack() {
    router.back();
  }

  function handleGoToToday() {
    router.replace('/today');
  }

  const currentQuestion =
    currentQuestionIndex >= 0 && currentQuestionIndex < questions.length
      ? questions[currentQuestionIndex]
      : null;
  const currentAxis = currentQuestion
    ? AXES.find((axis) => axis.id === currentQuestion.question.axisId) ?? null
    : null;

  // Loading state
  if (phase === 'loading') {
    return (
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.centeredContainer}
        overScrollMode="never"
        style={{ backgroundColor: COLORS.cream, flex: 1 }}>
        <View style={{ alignItems: 'center', gap: SPACING.xl }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: `${accent}15`,
              borderRadius: RADIUS.xl,
              height: 64,
              justifyContent: 'center',
              width: 64,
            }}>
            <Ionicons color={accent} name="hourglass-outline" size={32} />
          </View>
          <View style={{ alignItems: 'center', gap: SPACING.sm }}>
            <Text
              style={{
                color: COLORS.softBrown,
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
              }}>
              Loading...
            </Text>
            <Text
              style={{
                color: COLORS.warmGray,
                fontSize: FONT_SIZES.base,
                textAlign: 'center',
              }}>
              Preparing your daily check-in
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Error state
  if (phase === 'error') {
    return (
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.centeredContainer}
        overScrollMode="never"
        style={{ backgroundColor: COLORS.cream, flex: 1 }}>
        <DecorativeOrb color={COLORS.danger} left={-100} opacity={0.1} size={300} top={-100} />

        <Animated.View
          entering={FadeInUp.duration(400)}
          style={{ alignItems: 'center', gap: SPACING.xl, maxWidth: 340, width: '100%' }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: `${COLORS.danger}15`,
              borderRadius: 9999,
              height: 80,
              justifyContent: 'center',
              width: 80,
            }}>
            <Ionicons color={COLORS.danger} name="alert-circle" size={40} />
          </View>

          <View style={{ alignItems: 'center', gap: SPACING.md }}>
            <Text
              style={{
                color: COLORS.softBrown,
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
                textAlign: 'center',
              }}>
              Something went wrong
            </Text>
            <Text
              style={{
                color: COLORS.warmGray,
                fontSize: FONT_SIZES.base,
                lineHeight: FONT_SIZES.base * 1.5,
                textAlign: 'center',
              }}>
              {error ?? 'Failed to load your session'}
            </Text>
          </View>

          <Button onPress={handleGoBack}>
            <Ionicons color="#FFFFFF" name="arrow-back" size={18} />
            <ButtonLabel>Go Back</ButtonLabel>
          </Button>
        </Animated.View>
      </ScrollView>
    );
  }

  // Completed state
  if (phase === 'completed') {
    return (
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.centeredContainer}
        overScrollMode="never"
        style={{ backgroundColor: COLORS.cream, flex: 1 }}>
        <DecorativeOrb color={COLORS.sage} left={-100} opacity={0.1} size={300} top={-100} />
        <DecorativeOrb color={accent} opacity={0.08} right={-80} size={200} top={150} />

        <Animated.View
          entering={FadeInUp.duration(400)}
          style={{ alignItems: 'center', gap: SPACING['3xl'], maxWidth: 340, width: '100%' }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: `${COLORS.sage}15`,
              borderRadius: 9999,
              height: 96,
              justifyContent: 'center',
              width: 96,
            }}>
            <Ionicons color={COLORS.sage} name="checkmark-circle" size={48} />
          </View>

          <View style={{ alignItems: 'center', gap: SPACING.md }}>
            <Text
              style={{
                color: COLORS.softBrown,
                fontSize: FONT_SIZES['3xl'],
                fontWeight: FONT_WEIGHTS.bold,
                textAlign: 'center',
              }}>
              All done
            </Text>
            <Text
              style={{
                color: COLORS.warmGray,
                fontSize: FONT_SIZES.base,
                lineHeight: FONT_SIZES.base * 1.5,
                textAlign: 'center',
              }}>
              You have completed today&apos;s check-in. Come back tomorrow for more insights.
            </Text>
          </View>

          <Button onPress={handleGoToToday}>
            <ButtonLabel>Back to Today</ButtonLabel>
            <Ionicons color="#FFFFFF" name="arrow-forward" size={18} />
          </Button>
        </Animated.View>
      </ScrollView>
    );
  }

  // Active session state
  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.questionContainer}
        overScrollMode="never"
        style={{ backgroundColor: COLORS.cream, flex: 1 }}>
        <DecorativeOrb color={accent} left={-80} opacity={0.1} size={250} top={-80} />

        <Animated.View entering={FadeInUp.duration(350)} style={{ gap: SPACING.xl, width: '100%' }}>
          {/* Header with back button */}
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Pressable onPress={handleGoBack} style={{ marginLeft: -SPACING.sm, padding: SPACING.sm }}>
              <Ionicons color={COLORS.softBrown} name="arrow-back" size={24} />
            </Pressable>
            <Text
              style={{
                color: COLORS.softBrown,
                fontSize: FONT_SIZES.lg,
                fontWeight: FONT_WEIGHTS.semibold,
              }}>
              Daily Check-in
            </Text>
            {/* Spacer for alignment */}
            <View style={{ width: 40 }} />
          </View>

          {/* Progress header */}
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.sm }}>
              <Ionicons color={accent} name="help-circle-outline" size={20} />
              <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.medium }}>
                {answeredCount + 1} / {totalCount}
              </Text>
            </View>
            {currentAxis && (
              <Badge size="sm" variant="terracotta">
                <BadgeLabel>{currentAxis.name}</BadgeLabel>
              </Badge>
            )}
          </View>

          {/* Progress bar */}
          <ProgressBar
            accentColor={accent}
            currentStep={answeredCount + 1}
            progressPercentage={progressPercentage}
            totalSteps={totalCount}
          />

          {/* Question card with swipe */}
          {currentQuestion ? (
            <SwipeableQuestionCard
              accentColor={accent}
              categoryLabel={currentAxis?.name}
              isDisabled={isSubmitting}
              key={currentQuestion.question.id}
              onAnswer={(response) => void submitAnswer(response)}
              prompt={currentQuestion.question.prompt}
            />
          ) : (
            <Card variant="default">
              <CardBody style={{ alignItems: 'center', padding: SPACING['3xl'] }}>
                <Text style={{ color: COLORS.warmGray }}>No more questions</Text>
              </CardBody>
            </Card>
          )}

          {isSubmitting && (
            <Animated.View entering={FadeIn.duration(150)}>
              <Card variant="default">
                <CardBody
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: SPACING.md,
                    justifyContent: 'center',
                  }}>
                  <Ionicons color={accent} name="time-outline" size={20} />
                  <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>
                    Saving your answer...
                  </Text>
                </CardBody>
              </Card>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

function DecorativeOrb({
  bottom,
  color,
  left,
  opacity = 0.15,
  right,
  size,
  top,
}: {
  bottom?: number;
  color: string;
  left?: number;
  opacity?: number;
  right?: number;
  size: number;
  top?: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        backgroundColor: color,
        borderRadius: size / 2,
        bottom,
        height: size,
        left,
        opacity,
        position: 'absolute',
        right,
        top,
        width: size,
      }}
    />
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
    paddingBottom: 32,
    paddingTop: 48,
  },
  container: {
    flex: 1,
  },
  questionContainer: {
    flexGrow: 1,
    padding: SPACING.xl,
    paddingBottom: 32,
    paddingTop: 48,
  },
});
