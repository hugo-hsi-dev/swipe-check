import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { Card, CardBody } from '@/components/ui/card';
import { Button, ButtonLabel } from '@/components/ui/button';
import { Badge, BadgeLabel } from '@/components/ui/badge';
import { ProgressBar } from '@/components/session/progress-bar';
import { QuestionCard } from '@/components/session/question-card';
import { AnswerButtonGroup } from '@/components/session/answer-button';
import type { QuestionResponse } from '@/constants/question-contract';
import { AXES } from '@/constants/questions';
import { useDailySessionFlow } from '@/hooks/use-daily-session-flow';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

function SwipeIndicator({
  direction,
  opacity,
  scale,
  accent,
}: {
  direction: 'left' | 'right';
  opacity: SharedValue<number>;
  scale: SharedValue<number>;
  accent: string;
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
          [isRight ? 'right' : 'left']: 20,
          backgroundColor: isRight ? accent : COLORS.danger,
        },
        animatedStyle,
      ]}>
      <Ionicons name={isRight ? 'checkmark' : 'close'} size={32} color="#FFFFFF" />
      <Text style={styles.swipeIndicatorText}>{isRight ? 'Agree' : 'Disagree'}</Text>
    </Animated.View>
  );
}

function SwipeableQuestionCard({
  prompt,
  accent,
  translateX,
  rotateZ,
  onSwipeComplete,
  isSubmitting,
  categoryLabel,
}: {
  prompt: string;
  accent: string;
  translateX: SharedValue<number>;
  rotateZ: SharedValue<number>;
  onSwipeComplete: (direction: 'left' | 'right') => void;
  isSubmitting: boolean;
  categoryLabel?: string;
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
        direction="left"
        opacity={leftOpacity}
        scale={leftScale}
        accent={accent}
      />
      <SwipeIndicator
        direction="right"
        opacity={rightOpacity}
        scale={rightScale}
        accent={accent}
      />

      {/* Swipeable card */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          <QuestionCard prompt={prompt} categoryLabel={categoryLabel} />
        </Animated.View>
      </GestureDetector>

      {/* Button controls for accessibility */}
      <Animated.View entering={FadeInDown.delay(100).duration(300)} style={{ gap: SPACING.md, marginTop: SPACING.xl }}>
        <AnswerButtonGroup
          onAgree={handleAgreePress}
          onDisagree={handleDisagreePress}
          isDisabled={isSubmitting}
        />
      </Animated.View>

      {/* Hint text */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: SPACING.sm,
          marginTop: SPACING.lg,
          opacity: 0.6,
        }}>
        <Ionicons name="swap-horizontal-outline" size={16} color={COLORS.warmGray} />
        <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>
          Swipe or tap to answer
        </Text>
      </View>
    </View>
  );
}

function DecorativeOrb({
  color,
  size,
  top,
  left,
  right,
  bottom,
  opacity = 0.15,
}: {
  color: string;
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
      }}
    />
  );
}

export default function SessionScreen() {
  const {
    phase,
    questions,
    currentQuestionIndex,
    answeredCount,
    totalCount,
    progressPercentage,
    isSubmitting,
    error,
    submitAnswer,
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
    } catch {
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
        style={{ flex: 1, backgroundColor: COLORS.cream }}
        contentContainerStyle={styles.centeredContainer}
        bounces={false}
        overScrollMode="never">
        <View style={{ alignItems: 'center', gap: SPACING.xl }}>
          <View
            style={{
              width: 64,
              height: 64,
              backgroundColor: `${accent}15`,
              borderRadius: RADIUS.xl,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="hourglass-outline" size={32} color={accent} />
          </View>
          <View style={{ gap: SPACING.sm, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
                color: COLORS.softBrown,
              }}>
              Loading...
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES.base,
                color: COLORS.warmGray,
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
        style={{ flex: 1, backgroundColor: COLORS.cream }}
        contentContainerStyle={styles.centeredContainer}
        bounces={false}
        overScrollMode="never">
        <DecorativeOrb color={COLORS.danger} size={300} top={-100} left={-100} opacity={0.1} />

        <Animated.View
          entering={FadeInUp.duration(400)}
          style={{ alignItems: 'center', gap: SPACING.xl, width: '100%', maxWidth: 340 }}>
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: `${COLORS.danger}15`,
              borderRadius: 9999,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="alert-circle" size={40} color={COLORS.danger} />
          </View>

          <View style={{ gap: SPACING.md, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
                color: COLORS.softBrown,
                textAlign: 'center',
              }}>
              Something went wrong
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontSize: FONT_SIZES.base,
                lineHeight: FONT_SIZES.base * 1.5,
                color: COLORS.warmGray,
              }}>
              {error ?? 'Failed to load your session'}
            </Text>
          </View>

          <Button onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
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
        style={{ flex: 1, backgroundColor: COLORS.cream }}
        contentContainerStyle={styles.centeredContainer}
        bounces={false}
        overScrollMode="never">
        <DecorativeOrb color={COLORS.sage} size={300} top={-100} left={-100} opacity={0.1} />
        <DecorativeOrb color={accent} size={200} top={150} right={-80} opacity={0.08} />

        <Animated.View
          entering={FadeInUp.duration(400)}
          style={{ alignItems: 'center', gap: SPACING['3xl'], width: '100%', maxWidth: 340 }}>
          <View
            style={{
              width: 96,
              height: 96,
              backgroundColor: `${COLORS.sage}15`,
              borderRadius: 9999,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.sage} />
          </View>

          <View style={{ gap: SPACING.md, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: FONT_SIZES['3xl'],
                fontWeight: FONT_WEIGHTS.bold,
                color: COLORS.softBrown,
                textAlign: 'center',
              }}>
              All done
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontSize: FONT_SIZES.base,
                lineHeight: FONT_SIZES.base * 1.5,
                color: COLORS.warmGray,
              }}>
              You have completed today&apos;s check-in. Come back tomorrow for more insights.
            </Text>
          </View>

          <Button onPress={handleGoToToday}>
            <ButtonLabel>Back to Today</ButtonLabel>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Button>
        </Animated.View>
      </ScrollView>
    );
  }

  // Active session state
  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.cream }}
        contentContainerStyle={styles.questionContainer}
        bounces={false}
        overScrollMode="never">
        <DecorativeOrb color={accent} size={250} top={-80} left={-80} opacity={0.1} />

        <Animated.View entering={FadeInUp.duration(350)} style={{ gap: SPACING.xl, width: '100%' }}>
          {/* Header with back button */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Pressable onPress={handleGoBack} style={{ padding: SPACING.sm, marginLeft: -SPACING.sm }}>
              <Ionicons name="arrow-back" size={24} color={COLORS.softBrown} />
            </Pressable>
            <Text
              style={{
                fontSize: FONT_SIZES.lg,
                fontWeight: FONT_WEIGHTS.semibold,
                color: COLORS.softBrown,
              }}>
              Daily Check-in
            </Text>
            {/* Spacer for alignment */}
            <View style={{ width: 40 }} />
          </View>

          {/* Progress header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <Ionicons name="help-circle-outline" size={20} color={accent} />
              <Text style={{ fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.medium, color: COLORS.warmGray }}>
                {answeredCount + 1} / {totalCount}
              </Text>
            </View>
            {currentAxis && (
              <Badge variant="terracotta" size="sm">
                <BadgeLabel>{currentAxis.name}</BadgeLabel>
              </Badge>
            )}
          </View>

          {/* Progress bar */}
          <ProgressBar
            progressPercentage={progressPercentage}
            currentStep={answeredCount + 1}
            totalSteps={totalCount}
            accentColor={accent}
          />

          {/* Question card with swipe */}
          {currentQuestion ? (
            <SwipeableQuestionCard
              prompt={currentQuestion.question.prompt}
              accent={accent}
              translateX={translateX}
              rotateZ={rotateZ}
              onSwipeComplete={handleSwipeComplete}
              isSubmitting={isSubmitting}
              categoryLabel={currentAxis?.name}
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
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.md,
                    justifyContent: 'center',
                  }}>
                  <Ionicons name="time-outline" size={20} color={accent} />
                  <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: 48,
    paddingBottom: 32,
  },
  questionContainer: {
    flexGrow: 1,
    padding: SPACING.xl,
    paddingTop: 48,
    paddingBottom: 32,
  },
  cardContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  card: {
    width: '100%',
    maxWidth: SCREEN_WIDTH - 48,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '30%',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    zIndex: 10,
  },
  swipeIndicatorText: {
    color: 'white',
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
