import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Card, Chip, useThemeColor } from 'heroui-native';
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

import type { QuestionResponse } from '@/constants/question-contract';
import { AXES } from '@/constants/questions';
import { useDailySessionFlow } from '@/hooks/use-daily-session-flow';

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
  const [accentForeground] = useThemeColor(['accent-foreground']);

  const isRight = direction === 'right';

  return (
    <Animated.View
      style={[
        styles.swipeIndicator,
        {
          [isRight ? 'right' : 'left']: 20,
          backgroundColor: isRight ? accent : 'rgba(239, 68, 68, 0.9)', // red for disagree
        },
        animatedStyle,
      ]}>
      <Ionicons
        name={isRight ? 'checkmark' : 'close'}
        size={32}
        color={accentForeground}
      />
      <Text style={styles.swipeIndicatorText}>
        {isRight ? 'Agree' : 'Disagree'}
      </Text>
    </Animated.View>
  );
}

function QuestionCard({
  prompt,
  accent,
  translateX,
  rotateZ,
  onSwipeComplete,
  isSubmitting,
}: {
  prompt: string;
  accent: string;
  translateX: SharedValue<number>;
  rotateZ: SharedValue<number>;
  onSwipeComplete: (direction: 'left' | 'right') => void;
  isSubmitting: boolean;
}) {
  const leftOpacity = useSharedValue(0);
  const leftScale = useSharedValue(0.5);
  const rightOpacity = useSharedValue(0);
  const rightScale = useSharedValue(0.5);
  const [accentForeground] = useThemeColor(['accent-foreground']);

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
          <Card variant="secondary" className="overflow-hidden w-full">
            <View
              className="h-1 w-full"
              style={{ backgroundColor: accent, opacity: 0.3 }}
            />
            <Card.Body className="p-8 min-h-[200px] justify-center">
              <Text className="text-2xl font-semibold leading-relaxed text-foreground text-center">
                {prompt}
              </Text>
            </Card.Body>
          </Card>
        </Animated.View>
      </GestureDetector>

      {/* Button controls for accessibility */}
      <Animated.View entering={FadeInDown.delay(100).duration(300)} className="gap-3 mt-6">
        <Button
          onPress={handleAgreePress}
          isDisabled={isSubmitting}
          size="lg"
          className="w-full">
          <Ionicons name="checkmark" size={22} color={accentForeground} />
          <Button.Label className="text-lg font-semibold">Agree</Button.Label>
        </Button>

        <Button
          variant="outline"
          onPress={handleDisagreePress}
          isDisabled={isSubmitting}
          size="lg"
          className="w-full">
          <Ionicons name="close" size={22} />
          <Button.Label className="text-lg font-semibold">Disagree</Button.Label>
        </Button>
      </Animated.View>

      {/* Hint text */}
      <View className="flex-row items-center justify-center gap-2 mt-4 opacity-60">
        <Ionicons name="swap-horizontal-outline" size={16} />
        <Text className="text-sm text-muted">Swipe or tap to answer</Text>
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

  const [accent, accentForeground, foreground, success, danger] = useThemeColor([
    'accent',
    'accent-foreground',
    'foreground',
    'success',
    'danger',
  ]);

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
        className="flex-1 bg-background"
        contentContainerStyle={styles.centeredContainer}
        bounces={false}
        overScrollMode="never">
        <View className="items-center gap-6">
          <View
            className="size-16 items-center justify-center rounded-3xl"
            style={{ backgroundColor: `${accent}15` }}>
            <Ionicons name="hourglass-outline" size={32} color={accent} />
          </View>
          <View className="gap-2 items-center">
            <Text className="text-2xl font-bold text-foreground">Loading...</Text>
            <Text className="text-center text-base text-muted">
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
        className="flex-1 bg-background"
        contentContainerStyle={styles.centeredContainer}
        bounces={false}
        overScrollMode="never">
        <DecorativeOrb color="#EF4444" size={300} top={-100} left={-100} opacity={0.1} />

        <Animated.View entering={FadeInUp.duration(400)} className="items-center gap-6 w-full max-w-[340px]">
          <View
            className="size-20 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
            <Ionicons name="alert-circle" size={40} color={danger} />
          </View>

          <View className="gap-3 items-center">
            <Text className="text-2xl font-bold text-foreground text-center">
              Something went wrong
            </Text>
            <Text className="text-center text-base leading-6 text-muted">
              {error ?? 'Failed to load your session'}
            </Text>
          </View>

          <Button onPress={handleGoBack} size="lg" className="w-full">
            <Ionicons name="arrow-back" size={18} color={accentForeground} />
            <Button.Label className="text-lg font-semibold">Go Back</Button.Label>
          </Button>
        </Animated.View>
      </ScrollView>
    );
  }

  // Completed state
  if (phase === 'completed') {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={styles.centeredContainer}
        bounces={false}
        overScrollMode="never">
        <DecorativeOrb color={success} size={300} top={-100} left={-100} opacity={0.1} />
        <DecorativeOrb color={accent} size={200} top={150} right={-80} opacity={0.08} />

        <Animated.View entering={FadeInUp.duration(400)} className="items-center gap-8 w-full max-w-[340px]">
          <View
            className="size-24 items-center justify-center rounded-full"
            style={{ backgroundColor: `${success}15` }}>
            <Ionicons name="checkmark-circle" size={48} color={success} />
          </View>

          <View className="gap-3 items-center">
            <Text className="text-3xl font-bold text-foreground text-center">
              All done
            </Text>
            <Text className="text-center text-base leading-6 text-muted">
              You have completed today&apos;s check-in. Come back tomorrow for more insights.
            </Text>
          </View>

          <Button onPress={handleGoToToday} size="lg" className="w-full">
            <Button.Label className="text-lg font-semibold">Back to Today</Button.Label>
            <Ionicons name="arrow-forward" size={18} color={accentForeground} />
          </Button>
        </Animated.View>
      </ScrollView>
    );
  }

  // Active session state
  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={styles.questionContainer}
        bounces={false}
        overScrollMode="never">
        <DecorativeOrb color={accent} size={250} top={-80} left={-80} opacity={0.1} />

        <Animated.View entering={FadeInUp.duration(350)} className="gap-6 w-full">
          {/* Header with back button */}
          <View className="flex-row items-center justify-between">
            <Button variant="ghost" onPress={handleGoBack} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={24} color={foreground} />
            </Button>
            <Text className="text-lg font-semibold text-foreground">Daily Check-in</Text>
            {/* Spacer for alignment */}
            <View className="w-10" />
          </View>

          {/* Progress header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Ionicons name="help-circle-outline" size={20} color={accent} />
              <Text className="text-sm font-medium text-muted">
                {answeredCount + 1} / {totalCount}
              </Text>
            </View>
            {currentAxis && (
              <Chip variant="soft" color="accent" size="sm">
                <Chip.Label>{currentAxis.name}</Chip.Label>
              </Chip>
            )}
          </View>

          {/* Progress bar */}
          <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
            <View
              className="h-full rounded-full"
              style={{ width: `${progressPercentage}%`, backgroundColor: accent }}
            />
          </View>

          {/* Question card with swipe */}
          {currentQuestion ? (
            <QuestionCard
              prompt={currentQuestion.question.prompt}
              accent={accent}
              translateX={translateX}
              rotateZ={rotateZ}
              onSwipeComplete={handleSwipeComplete}
              isSubmitting={isSubmitting}
            />
          ) : (
            <Card variant="secondary">
              <Card.Body className="p-8 items-center">
                <Text className="text-muted">No more questions</Text>
              </Card.Body>
            </Card>
          )}

          {isSubmitting && (
            <Animated.View entering={FadeIn.duration(150)}>
              <Card variant="tertiary">
                <Card.Body className="flex-row items-center gap-3 p-4 justify-center">
                  <Ionicons name="time-outline" size={20} color={accent} />
                  <Text className="text-sm text-muted">Saving your answer...</Text>
                </Card.Body>
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
    padding: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  questionContainer: {
    flexGrow: 1,
    padding: 24,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  swipeIndicatorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
