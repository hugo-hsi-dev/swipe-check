import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useThemeColor } from 'heroui-native';
import Animated, {
  FadeIn,
  FadeInDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
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
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;
const MAX_BORDER_RADIUS = 48;

function OverlayLabel({
  direction,
  opacity,
  scale,
}: {
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
        styles.overlayLabel,
        {
          [isRight ? 'right' : 'left']: 24,
          backgroundColor: isRight ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          borderColor: isRight ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
        },
        animatedStyle,
      ]}>
      <Ionicons
        name={isRight ? 'checkmark' : 'close'}
        size={56}
        color={isRight ? '#22c55e' : '#ef4444'}
      />
      <Text style={[styles.overlayLabelText, { color: isRight ? '#22c55e' : '#ef4444' }]}>
        {isRight ? 'AGREE' : 'DISAGREE'}
      </Text>
    </Animated.View>
  );
}

function ProgressBar({
  progress,
  total,
  color,
}: {
  progress: number;
  total: number;
  color: string;
}) {
  const dots = Array.from({ length: total }, (_, i) => i < progress);

  return (
    <View style={styles.progressContainer}>
      {dots.map((isActive, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            isActive && { backgroundColor: color, transform: [{ scale: 1 }] },
          ]}
        />
      ))}
    </View>
  );
}



interface QuestionCardProps {
  prompt: string;
  category: string;
  accent: string;
  backgroundColor: string;
  foregroundColor: string;
  answeredCount: number;
  totalCount: number;
  onSwipeComplete: (direction: 'left' | 'right') => void;
  onClose: () => void;
  isActive: boolean;
  hasSwiped: boolean;
  onFirstSwipe: () => void;
}

function QuestionCard({
  prompt,
  accent,
  backgroundColor,
  foregroundColor,
  answeredCount,
  totalCount,
  onSwipeComplete,
  onClose,
  isActive,
  hasSwiped,
  onFirstSwipe,
}: QuestionCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const scale = useSharedValue(1);
  const borderRadius = useSharedValue(0);
  const borderOpacity = useSharedValue(0);
  const hasCommittedAnswer = useSharedValue(false);

  const leftOpacity = useSharedValue(0);
  const leftScale = useSharedValue(0.5);
  const rightOpacity = useSharedValue(0);
  const rightScale = useSharedValue(0.5);

  // Reset animation when card becomes active
  useEffect(() => {
    if (isActive) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      rotateZ.value = withSpring(0, { damping: 20, stiffness: 300 });
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });
      borderRadius.value = withSpring(0, { damping: 20, stiffness: 300 });
      borderOpacity.value = 0;
      hasCommittedAnswer.value = false;
      leftOpacity.value = 0;
      leftScale.value = 0.5;
      rightOpacity.value = 0;
      rightScale.value = 0.5;
    }
    // Shared values are stable references from useSharedValue
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow swipe if this is the active card
      if (!isActive) return;

      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3; // Less vertical movement
      rotateZ.value = event.translationX * 0.02; // Subtle rotation

      // Calculate progress (0 to 1) based on swipe distance
      const progress = Math.abs(event.translationX) / SWIPE_THRESHOLD;
      const clampedProgress = Math.min(progress, 1);

      // Scale down and round corners as swipe progresses
      const scaleValue = 1 - clampedProgress * 0.08;
      scale.value = Math.max(scaleValue, 0.92);

      // Border radius increases as we swipe
      borderRadius.value = clampedProgress * MAX_BORDER_RADIUS;

      // Border opacity fades in as we swipe
      borderOpacity.value = clampedProgress;

      // Update indicator opacity
      if (event.translationX > 0) {
        rightOpacity.value = Math.min(clampedProgress * 1.5, 1);
        rightScale.value = 0.5 + clampedProgress * 0.5;
        leftOpacity.value = 0;
        leftScale.value = 0.5;
      } else {
        leftOpacity.value = Math.min(clampedProgress * 1.5, 1);
        leftScale.value = 0.5 + clampedProgress * 0.5;
        rightOpacity.value = 0;
        rightScale.value = 0.5;
      }
    })
    .onEnd((event) => {
      if (!isActive) return;

      const isRightSwipe = event.translationX > SWIPE_THRESHOLD;
      const isLeftSwipe = event.translationX < -SWIPE_THRESHOLD;

      if ((isRightSwipe || isLeftSwipe) && hasCommittedAnswer.value) {
        return;
      }

      if (isRightSwipe) {
        hasCommittedAnswer.value = true;
        if (!hasSwiped) {
          runOnJS(onFirstSwipe)();
        }
        runOnJS(onSwipeComplete)('right');
        translateX.value = withSpring(SCREEN_WIDTH * 1.2, { velocity: event.velocityX });
        translateY.value = withTiming(event.translationY * 0.5, { duration: 300 });
        rotateZ.value = withTiming(8, { duration: 300 });
        scale.value = withTiming(0.85, { duration: 300 });
        borderRadius.value = withTiming(MAX_BORDER_RADIUS, { duration: 300 });
      } else if (isLeftSwipe) {
        hasCommittedAnswer.value = true;
        if (!hasSwiped) {
          runOnJS(onFirstSwipe)();
        }
        runOnJS(onSwipeComplete)('left');
        translateX.value = withSpring(-SCREEN_WIDTH * 1.2, { velocity: event.velocityX });
        translateY.value = withTiming(event.translationY * 0.5, { duration: 300 });
        rotateZ.value = withTiming(-8, { duration: 300 });
        scale.value = withTiming(0.85, { duration: 300 });
        borderRadius.value = withTiming(MAX_BORDER_RADIUS, { duration: 300 });
      } else {
        // Spring back to center
        translateX.value = withSpring(0, { damping: 15, stiffness: 400 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 400 });
        rotateZ.value = withSpring(0, { damping: 15, stiffness: 400 });
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        borderRadius.value = withSpring(0, { damping: 15, stiffness: 400 });
        leftOpacity.value = withTiming(0, { duration: 200 });
        leftScale.value = withTiming(0.5, { duration: 200 });
        rightOpacity.value = withTiming(0, { duration: 200 });
        rightScale.value = withTiming(0.5, { duration: 200 });
      }
    });

  function animateExit(direction: 'left' | 'right') {
    const velocityX = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    const rotation = direction === 'right' ? 8 : -8;
    const exitX = direction === 'right' ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;

    translateX.value = withSpring(exitX, { velocity: velocityX });
    translateY.value = withTiming(0, { duration: 300 });
    rotateZ.value = withTiming(rotation, { duration: 300 });
    scale.value = withTiming(0.85, { duration: 300 });
    borderRadius.value = withTiming(MAX_BORDER_RADIUS, { duration: 300 });
  }

  function handleAnswerPress(direction: 'left' | 'right') {
    if (!isActive || hasCommittedAnswer.value) {
      return;
    }

    hasCommittedAnswer.value = true;
    if (!hasSwiped) {
      onFirstSwipe();
    }

    onSwipeComplete(direction);
    animateExit(direction);
  }

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${rotateZ.value}deg` },
      { scale: scale.value },
    ],
    borderRadius: borderRadius.value,
    borderWidth: 1,
    borderColor: `rgba(0, 0, 0, ${borderOpacity.value * 0.15})`,
  }));

  return (
    <View style={styles.cardWrapper} pointerEvents={isActive ? 'auto' : 'none'}>
      <OverlayLabel direction="left" opacity={leftOpacity} scale={leftScale} />
      <OverlayLabel direction="right" opacity={rightOpacity} scale={rightScale} />

      <GestureDetector gesture={gesture}>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[
            styles.card,
            animatedCardStyle,
            { backgroundColor },
          ]}>
          {/* Close button - part of card */}
          <Pressable onPress={onClose} style={styles.cardCloseButton}>
            <Ionicons name="close" size={28} color={foregroundColor} />
          </Pressable>

          {/* Progress bar */}
          <View style={styles.cardProgressContainer}>
            <ProgressBar progress={answeredCount} total={totalCount} color={accent} />
          </View>

          {/* Question text */}
          <View style={styles.contentContainer}>
            <Text style={[styles.promptText, { color: foregroundColor }]}>{prompt}</Text>
          </View>

          <View style={styles.bottomHint}>
            <View style={styles.answerButtonsRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Disagree"
                accessibilityHint="Submit a disagree response for this question"
                disabled={!isActive}
                onPress={() => handleAnswerPress('left')}
                style={[
                  styles.answerButton,
                  styles.answerButtonSecondary,
                  !isActive && styles.answerButtonDisabled,
                ]}>
                <Ionicons name="close" size={18} color={foregroundColor} />
                <Text style={[styles.answerButtonText, { color: foregroundColor }]}>Disagree</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Agree"
                accessibilityHint="Submit an agree response for this question"
                disabled={!isActive}
                onPress={() => handleAnswerPress('right')}
                style={[
                  styles.answerButton,
                  { backgroundColor: accent },
                  !isActive && styles.answerButtonDisabled,
                ]}>
                <Ionicons name="checkmark" size={18} color={backgroundColor} />
                <Text style={[styles.answerButtonText, { color: backgroundColor }]}>Agree</Text>
              </Pressable>
            </View>

            {!hasSwiped && (
              <View style={styles.swipeHintContainer}>
                <View style={styles.hintPill}>
                  <Ionicons name="arrow-back" size={14} color="rgba(0,0,0,0.4)" />
                  <Text style={styles.hintPillText}>Swipe or tap to answer</Text>
                  <Ionicons name="arrow-forward" size={14} color="rgba(0,0,0,0.4)" />
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function SessionScreen() {
  const {
    phase,
    questions,
    currentQuestionIndex,
    answeredCount,
    totalCount,
    isSubmitting,
    error,
    submitAnswer,
  } = useDailySessionFlow();

  const [accent, accentForeground, foreground, success, background] = useThemeColor([
    'accent',
    'accent-foreground',
    'foreground',
    'success',
    'background',
  ]);

  const backgroundColor = background;

  const [cardKey, setCardKey] = useState(0);
  const [hasSwiped, setHasSwiped] = useState(false);

  const handleSwipeComplete = useCallback(async (direction: 'left' | 'right') => {
    const response: QuestionResponse = direction === 'right' ? 'agree' : 'disagree';
    try {
      await submitAnswer(response);
      // Trigger card key change to force re-render with new question
      setCardKey(prev => prev + 1);
    } catch {
      // Error handling - card will reset via useEffect
    }
  }, [submitAnswer]);

  const handleFirstSwipe = useCallback(() => {
    setHasSwiped(true);
  }, []);

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
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar style="auto" />
        <View style={styles.centeredContent}>
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.loadingContainer}>
            <View style={[styles.loadingOrb, { backgroundColor: `${accent}20` }]}>
              <Ionicons name="hourglass-outline" size={40} color={accent} />
            </View>
            <Text style={[styles.loadingTitle, { color: foreground }]}>
              Preparing
            </Text>
            <Text style={[styles.loadingSubtitle, { color: `${foreground}80` }]}>
              Getting today&apos;s questions ready
            </Text>
          </Animated.View>
        </View>
      </View>
    );
  }

  // Error state
  if (phase === 'error') {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar style="auto" />
        <View style={styles.centeredContent}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.resultContainer}>
            <View style={[styles.resultOrb, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
            </View>

            <Text style={[styles.resultTitle, { color: foreground }]}>
              Something went wrong
            </Text>
            <Text style={[styles.resultSubtitle, { color: `${foreground}80` }]}>
              {error ?? 'Failed to load your session'}
            </Text>

            <Pressable
              onPress={handleGoBack}
              style={[styles.actionButton, { backgroundColor: accent }]}>
              <Ionicons name="arrow-back" size={20} color={accentForeground} />
              <Text style={[styles.actionButtonText, { color: accentForeground }]}>
                Go Back
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  // Completed state
  if (phase === 'completed') {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar style="auto" />
        <View style={styles.centeredContent}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.resultContainer}>
            <View style={[styles.resultOrb, { backgroundColor: `${success}20` }]}>
              <Ionicons name="checkmark-circle" size={56} color={success} />
            </View>

            <Text style={[styles.resultTitle, { color: foreground }]}>
              All done
            </Text>
            <Text style={[styles.resultSubtitle, { color: `${foreground}80` }]}>
              You&apos;ve completed today&apos;s check-in. Come back tomorrow for more insights.
            </Text>

            <Pressable
              onPress={handleGoToToday}
              style={[styles.actionButton, { backgroundColor: success }]}>
              <Text style={[styles.actionButtonText, { color: 'white' }]}>
                Back to Today
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    );
  }

  // Active session state
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="auto" />
      <View style={[styles.container, { backgroundColor }]}>
        {/* Card area - full screen */}
        <View style={styles.cardArea}>
          {/* Card preview behind - render FIRST so it's behind */}
          {currentQuestionIndex < questions.length - 1 && (
            <View
              style={[
                styles.cardPreview,
                { backgroundColor },
              ]}
              pointerEvents="none"
            />
          )}

          {/* Main swipeable card - render on top */}
          {currentQuestion ? (
            <QuestionCard
              key={cardKey}
              prompt={currentQuestion.question.prompt}
              category={currentAxis?.name ?? 'Question'}
              accent={accent}
              backgroundColor={background}
              foregroundColor={foreground}
              answeredCount={answeredCount}
              totalCount={totalCount}
              onSwipeComplete={handleSwipeComplete}
              onClose={handleGoBack}
              isActive={!isSubmitting}
              hasSwiped={hasSwiped}
              onFirstSwipe={handleFirstSwipe}
            />
          ) : null}
        </View>

        {/* Loading overlay */}
        {isSubmitting && currentQuestionIndex >= totalCount - 1 && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.loadingOverlay}>
            <View style={[styles.loadingSpinner, { backgroundColor: `${accent}20` }]}>
              <Ionicons name="sync" size={32} color={accent} />
            </View>
          </Animated.View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  // Loading state
  loadingContainer: {
    alignItems: 'center',
    gap: 20,
  },
  loadingOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  loadingSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },

  // Result states
  resultContainer: {
    alignItems: 'center',
    gap: 24,
    maxWidth: 320,
  },
  resultOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },


  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    transform: [{ scale: 0.8 }],
  },

  // Card area
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  cardWrapper: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardPreview: {
    position: 'absolute',
    width: '90%',
    height: SCREEN_HEIGHT * 0.62,
    borderRadius: 24,
    transform: [{ scale: 0.95 }, { translateY: 16 }],
    zIndex: 1,
  },

  // Card
  card: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 20,
  },
  cardCloseButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    zIndex: 10,
  },
  cardProgressContainer: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  promptText: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 40,
  },
  bottomHint: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    gap: 16,
  },
  answerButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  answerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  answerButtonSecondary: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  answerButtonDisabled: {
    opacity: 0.5,
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  swipeHintContainer: {
    alignItems: 'center',
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
  },
  hintPillText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: '500',
  },

  // Overlay labels
  overlayLabel: {
    position: 'absolute',
    top: '35%',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  overlayLabelText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },



  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
