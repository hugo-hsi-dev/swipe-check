import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { QuestionResponse } from '@/constants/question-contract';

import { AnswerButtonGroup } from '@/components/session/answer-button';
import { ProgressBar } from '@/components/session/progress-bar';
import { QuestionCard } from '@/components/session/question-card';
import { Badge, BadgeLabel } from '@/components/ui/badge';
import { Button, ButtonLabel } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';
import { AXES } from '@/constants/questions';
import { useDailySessionFlow } from '@/hooks/use-daily-session-flow';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

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

  // Animation values for card
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);

  // Reset animation when question changes
  useEffect(() => {
    translateX.value = 0;
    rotateZ.value = 0;
  }, [currentQuestionIndex, translateX, rotateZ]);

  async function handleSwipeComplete(direction: 'left' | 'right') {
    const response: QuestionResponse = direction === 'right' ? 'agree' : 'disagree';
    try {
      await submitAnswer(response);
    } catch (_error: unknown) {
      // Reset card on error
      translateX.value = withSpring(0);
      rotateZ.value = withSpring(0);
    }
  }

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
              accent={accent}
              categoryLabel={currentAxis?.name}
              isSubmitting={isSubmitting}
              key={currentQuestion.question.id}
              onSwipeComplete={handleSwipeComplete}
              prompt={currentQuestion.question.prompt}
              rotateZ={rotateZ}
              translateX={translateX}
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

function SwipeableQuestionCard({
  accent,
  categoryLabel,
  isSubmitting,
  onSwipeComplete,
  prompt,
  rotateZ,
  translateX,
}: {
  accent: string;
  categoryLabel?: string;
  isSubmitting: boolean;
  onSwipeComplete: (direction: 'left' | 'right') => void;
  prompt: string;
  rotateZ: SharedValue<number>;
  translateX: SharedValue<number>;
}) {
  const leftOpacity = useSharedValue(0);
  const leftScale = useSharedValue(0.5);
  const rightOpacity = useSharedValue(0);
  const rightScale = useSharedValue(0.5);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotateZ.value = event.translationX * 0.05;

      // Update indicator opacity based on swipe direction
      const progress = Math.abs(event.translationX) / SWIPE_THRESHOLD;
      const clampedProgress = Math.min(progress, 1);

      if (event.translationX > 0) {
        // Swiping right (agree)
        rightOpacity.value = clampedProgress;
        rightScale.value = 0.5 + clampedProgress * 0.5;
        leftOpacity.value = 0;
        leftScale.value = 0.5;
      } else {
        // Swiping left (disagree)
        leftOpacity.value = clampedProgress;
        leftScale.value = 0.5 + clampedProgress * 0.5;
        rightOpacity.value = 0;
        rightScale.value = 0.5;
      }
    })
    .onEnd((event) => {
      const isRightSwipe = event.translationX > SWIPE_THRESHOLD;
      const isLeftSwipe = event.translationX < -SWIPE_THRESHOLD;

      if (isRightSwipe) {
        translateX.value = withSpring(SCREEN_WIDTH, { velocity: event.velocityX });
        rotateZ.value = withTiming(15);
        runOnJS(onSwipeComplete)('right');
      } else if (isLeftSwipe) {
        translateX.value = withSpring(-SCREEN_WIDTH, { velocity: event.velocityX });
        rotateZ.value = withTiming(-15);
        runOnJS(onSwipeComplete)('left');
      } else {
        // Reset to center
        translateX.value = withSpring(0);
        rotateZ.value = withSpring(0);
        leftOpacity.value = withTiming(0);
        leftScale.value = withTiming(0.5);
        rightOpacity.value = withTiming(0);
        rightScale.value = withTiming(0.5);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
  }));

  // Button handlers for accessibility
  function handleAgreePress() {
    if (isSubmitting) return;
    translateX.value = withSpring(SCREEN_WIDTH);
    rotateZ.value = withTiming(15);
    onSwipeComplete('right');
  }

  function handleDisagreePress() {
    if (isSubmitting) return;
    translateX.value = withSpring(-SCREEN_WIDTH);
    rotateZ.value = withTiming(-15);
    onSwipeComplete('left');
  }

  return (
    <View style={styles.cardContainer}>
      {/* Swipe indicators */}
      <SwipeIndicator
        accent={accent}
        direction="left"
        opacity={leftOpacity}
        scale={leftScale}
      />
      <SwipeIndicator
        accent={accent}
        direction="right"
        opacity={rightOpacity}
        scale={rightScale}
      />

      {/* Swipeable card */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          <QuestionCard categoryLabel={categoryLabel} prompt={prompt} />
        </Animated.View>
      </GestureDetector>

      {/* Button controls for accessibility */}
      <Animated.View entering={FadeInDown.delay(100).duration(300)} style={{ gap: SPACING.md, marginTop: SPACING.xl }}>
        <AnswerButtonGroup
          isDisabled={isSubmitting}
          onAgree={handleAgreePress}
          onDisagree={handleDisagreePress}
        />
      </Animated.View>

      {/* Hint text */}
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: SPACING.sm,
          justifyContent: 'center',
          marginTop: SPACING.lg,
          opacity: 0.6,
        }}>
        <Ionicons color={COLORS.warmGray} name="swap-horizontal-outline" size={16} />
        <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>
          Swipe or tap to answer
        </Text>
      </View>
    </View>
  );
}

function SwipeIndicator({
  accent,
  direction,
  opacity,
  scale,
}: {
  accent: string;
  direction: 'left' | 'right';
  opacity: SharedValue<number>;
  scale: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const isRight = direction === 'right';

  return (
    <Animated.View
      style={[
        styles.swipeIndicator,
        {
          backgroundColor: isRight ? accent : COLORS.danger,
          [isRight ? 'right' : 'left']: 20,
        },
        animatedStyle,
      ]}>
      <Ionicons color="#FFFFFF" name={isRight ? 'checkmark' : 'close'} size={32} />
      <Text style={styles.swipeIndicatorText}>{isRight ? 'Agree' : 'Disagree'}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    maxWidth: SCREEN_WIDTH - 48,
    width: '100%',
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    position: 'relative',
  },
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
  swipeIndicator: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    position: 'absolute',
    top: '30%',
    zIndex: 10,
  },
  swipeIndicatorText: {
    color: 'white',
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
