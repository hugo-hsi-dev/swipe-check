import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AnswerButtonGroup } from '@/components/session/answer-button';
import { QuestionCard } from '@/components/session/question-card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeableQuestionCardProps {
  accentColor?: string;
  categoryLabel?: string;
  enableHaptics?: boolean;
  hintText?: string;
  isDisabled?: boolean;
  onAnswer: (response: 'agree' | 'disagree') => void;
  prompt: string;
  showButtons?: boolean;
  showHint?: boolean;
  testID?: string;
}

export function SwipeableQuestionCard({
  accentColor = COLORS.terracotta,
  categoryLabel,
  enableHaptics = true,
  hintText = 'Swipe or tap to answer',
  isDisabled = false,
  onAnswer,
  prompt,
  showButtons = true,
  showHint = true,
  testID,
}: SwipeableQuestionCardProps) {
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const leftOpacity = useSharedValue(0);
  const leftScale = useSharedValue(0.5);
  const rightOpacity = useSharedValue(0);
  const rightScale = useSharedValue(0.5);

  useEffect(() => {
    translateX.value = 0;
    rotateZ.value = 0;
    leftOpacity.value = 0;
    leftScale.value = 0.5;
    rightOpacity.value = 0;
    rightScale.value = 0.5;
  }, [leftOpacity, leftScale, rightOpacity, rightScale, rotateZ, translateX]);

  function triggerHaptic() {
    if (!enableHaptics) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // no-op: haptics unavailable
    }
  }

  function handleAnswer(response: 'agree' | 'disagree') {
    triggerHaptic();
    onAnswer(response);
  }

  function handleSwipeComplete(direction: 'left' | 'right') {
    const response: 'agree' | 'disagree' = direction === 'right' ? 'agree' : 'disagree';
    handleAnswer(response);
  }

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isDisabled) return;

      translateX.value = event.translationX;
      rotateZ.value = event.translationX * 0.05;

      const progress = Math.abs(event.translationX) / SWIPE_THRESHOLD;
      const clampedProgress = Math.min(progress, 1);

      if (event.translationX > 0) {
        rightOpacity.value = clampedProgress;
        rightScale.value = 0.5 + clampedProgress * 0.5;
        leftOpacity.value = 0;
        leftScale.value = 0.5;
      } else {
        leftOpacity.value = clampedProgress;
        leftScale.value = 0.5 + clampedProgress * 0.5;
        rightOpacity.value = 0;
        rightScale.value = 0.5;
      }
    })
    .onEnd((event) => {
      if (isDisabled) {
        translateX.value = withSpring(0);
        rotateZ.value = withSpring(0);
        leftOpacity.value = withTiming(0);
        leftScale.value = withTiming(0.5);
        rightOpacity.value = withTiming(0);
        rightScale.value = withTiming(0.5);
        return;
      }

      const isRightSwipe = event.translationX > SWIPE_THRESHOLD;
      const isLeftSwipe = event.translationX < -SWIPE_THRESHOLD;

      if (isRightSwipe) {
        translateX.value = withSpring(SCREEN_WIDTH, { velocity: event.velocityX });
        rotateZ.value = withTiming(15);
        runOnJS(handleSwipeComplete)('right');
      } else if (isLeftSwipe) {
        translateX.value = withSpring(-SCREEN_WIDTH, { velocity: event.velocityX });
        rotateZ.value = withTiming(-15);
        runOnJS(handleSwipeComplete)('left');
      } else {
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

  function handleAgreePress() {
    if (isDisabled) return;
    triggerHaptic();
    translateX.value = withSpring(SCREEN_WIDTH);
    rotateZ.value = withTiming(15);
    handleAnswer('agree');
  }

  function handleDisagreePress() {
    if (isDisabled) return;
    triggerHaptic();
    translateX.value = withSpring(-SCREEN_WIDTH);
    rotateZ.value = withTiming(-15);
    handleAnswer('disagree');
  }

  return (
    <View style={styles.cardContainer} testID={testID}>
      {/* Swipe indicators */}
      <SwipeIndicator
        accent={accentColor}
        direction="left"
        opacity={leftOpacity}
        scale={leftScale}
      />
      <SwipeIndicator
        accent={accentColor}
        direction="right"
        opacity={rightOpacity}
        scale={rightScale}
      />

      {/* Swipeable card */}
      <GestureDetector gesture={gesture}>
        <Animated.View
          accessibilityLabel={`Question: ${prompt}${categoryLabel ? `, Category: ${categoryLabel}` : ''}`}
          style={[styles.card, animatedCardStyle]}>
          <QuestionCard categoryLabel={categoryLabel} prompt={prompt} />
        </Animated.View>
      </GestureDetector>

      {/* Button controls for accessibility */}
      {showButtons && (
        <View style={styles.buttonContainer}>
          <AnswerButtonGroup
            isDisabled={isDisabled}
            onAgree={handleAgreePress}
            onDisagree={handleDisagreePress}
          />
        </View>
      )}

      {/* Hint text */}
      {showHint && (
        <View style={styles.hintContainer}>
          <Ionicons color={COLORS.warmGray} name="swap-horizontal-outline" size={16} />
          <Text style={styles.hintText}>{hintText}</Text>
        </View>
      )}
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
  buttonContainer: {
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
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
  hintContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    marginTop: SPACING.lg,
    opacity: 0.6,
  },
  hintText: {
    color: COLORS.warmGray,
    fontSize: FONT_SIZES.sm,
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