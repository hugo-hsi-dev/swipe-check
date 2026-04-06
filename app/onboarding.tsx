import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';

import type { QuestionResponse } from '@/constants/question-contract';

import { AnswerButtonGroup } from '@/components/session/answer-button';
import { ProgressBar } from '@/components/session/progress-bar';
import { QuestionCard } from '@/components/session/question-card';
import { Badge } from '@/components/ui/badge';
import { Button, ButtonLabel } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';
import { AXES } from '@/constants/questions';
import { useOnboardingSession } from '@/hooks/use-onboarding-session';

type OnboardingPhase = 'complete' | 'intro' | 'questions';

const INTRO_STEPS = [
  {
    description: 'Track how you think, feel, and act over time. Not a personality test—just a daily practice of noticing.',
    icon: 'sparkles-outline' as const,
    subtitle: 'Your personal pattern journal',
    title: 'Welcome to Swipe Check',
  },
  {
    description: 'First, we will ask 12 questions to understand your starting point. No right answers. Just be honest.',
    icon: 'time-outline' as const,
    subtitle: 'Quick baseline setup',
    title: '12 questions. 2 minutes.',
  },
  {
    description: 'Agree or Disagree. Do not overthink it. Your immediate response is usually the most accurate.',
    icon: 'flash-outline' as const,
    subtitle: 'Go with your first instinct',
    title: 'Trust your gut',
  },
  {
    description: 'After setup, short daily check-ins help you spot patterns and see how you change over time.',
    icon: 'calendar-outline' as const,
    subtitle: 'Build the habit',
    title: 'Then, 3 questions a day',
  },
] as const;

export default function OnboardingScreen() {
  const {
    answeredCount,
    canComplete,
    completeOnboarding,
    currentQuestionIndex,
    isLoading,
    isSubmitting,
    questions,
    submitAnswer,
    totalCount,
  } = useOnboardingSession();

  const accent = COLORS.terracotta;

  const [introStep, setIntroStep] = useState(0);
  const [phase, setPhase] = useState<OnboardingPhase>('intro');
  const [lastAnswer, setLastAnswer] = useState<null | QuestionResponse>(null);

  useEffect(() => {
    if (!isLoading && answeredCount > 0 && phase === 'intro') {
      setPhase('questions');
    }
  }, [answeredCount, isLoading, phase]);

  useEffect(() => {
    if (!isLoading && canComplete && phase === 'questions') {
      setPhase('complete');
    }
  }, [canComplete, isLoading, phase]);

  async function handleComplete() {
    await completeOnboarding();
    router.replace('/today');
  }

  async function handleAnswer(response: QuestionResponse) {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || isSubmitting) return;

    setLastAnswer(response);
    try {
      await submitAnswer(currentQuestion.question.id, response);
    } catch (_error: unknown) {
      setLastAnswer(null);
    }
  }

  function handleNextIntroStep() {
    if (introStep < INTRO_STEPS.length - 1) {
      setIntroStep(introStep + 1);
    } else {
      setPhase('questions');
    }
  }

  function handleBackIntroStep() {
    if (introStep > 0) setIntroStep(introStep - 1);
  }

  function getProgressPercentage(): number {
    if (totalCount === 0) return 0;
    return Math.round((answeredCount / totalCount) * 100);
  }

  const currentQuestion = currentQuestionIndex >= 0 ? questions[currentQuestionIndex] : null;
  const currentIntroStep = INTRO_STEPS[introStep];
  const currentAxis = currentQuestion
    ? AXES.find((axis) => axis.id === currentQuestion.question.axisId) ?? null
    : null;
  const progressPercentage = getProgressPercentage();

  if (isLoading) {
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
              Preparing...
            </Text>
            <Text
              style={{
                color: COLORS.warmGray,
                fontSize: FONT_SIZES.base,
                textAlign: 'center',
              }}>
              One moment
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (phase === 'complete') {
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
              All set
            </Text>
            <Text
              style={{
                color: COLORS.warmGray,
                fontSize: FONT_SIZES.base,
                lineHeight: FONT_SIZES.base * 1.5,
                textAlign: 'center',
              }}>
              Your baseline is saved. Come back tomorrow for your first daily check-in.
            </Text>
          </View>

          <Button isDisabled={isSubmitting} onPress={() => void handleComplete()}>
            <ButtonLabel>Start tracking</ButtonLabel>
            {!isSubmitting && <Ionicons color="#FFFFFF" name="arrow-forward" size={18} />}
          </Button>
        </Animated.View>
      </ScrollView>
    );
  }

  if (phase === 'questions') {
    return (
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.questionContainer}
        overScrollMode="never"
        style={{ backgroundColor: COLORS.cream, flex: 1 }}>
        <DecorativeOrb color={accent} left={-80} opacity={0.1} size={250} top={-80} />

        <Animated.View entering={FadeInUp.duration(350)} style={{ gap: SPACING.xl, width: '100%' }}>
          {/* Progress header */}
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.sm }}>
              <Ionicons color={accent} name="help-circle-outline" size={20} />
              <Text
                style={{
                  color: COLORS.warmGray,
                  fontSize: FONT_SIZES.sm,
                  fontWeight: FONT_WEIGHTS.medium,
                }}>
                {answeredCount + 1} / {totalCount}
              </Text>
            </View>
            {currentAxis && (
              <Badge size="sm" variant="terracotta">
                <Text
                  style={{
                    color: COLORS.terracotta,
                    fontSize: FONT_SIZES.xs,
                    fontWeight: FONT_WEIGHTS.semibold,
                  }}>
                  {currentAxis.name}
                </Text>
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

          {/* Question card */}
          <QuestionCard
            categoryLabel={currentAxis?.name}
            prompt={currentQuestion?.question.prompt ?? 'Loading...'}
          />

          {/* Answer buttons */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)} style={{ gap: SPACING.md }}>
            <AnswerButtonGroup
              isDisabled={isSubmitting || !currentQuestion}
              onAgree={() => void handleAnswer('agree')}
              onDisagree={() => void handleAnswer('disagree')}
            />
          </Animated.View>

          {isSubmitting && (
            <Animated.View entering={FadeIn.duration(150)}>
              <Card variant="default">
                <CardBody
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: SPACING.md,
                    padding: SPACING.lg,
                  }}>
                  <Ionicons
                    color={accent}
                    name={lastAnswer === 'agree' ? 'checkmark' : 'close'}
                    size={20}
                  />
                  <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.sm }}>Saving...</Text>
                </CardBody>
              </Card>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    );
  }

  // Intro phase
  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={styles.centeredContainer}
      overScrollMode="never"
      style={{ backgroundColor: COLORS.cream, flex: 1 }}>
      <DecorativeOrb color={accent} left={-100} opacity={0.1} size={300} top={-100} />
      <DecorativeOrb color="#8B5CF6" opacity={0.06} right={-60} size={180} top={200} />

      <Animated.View
        entering={FadeInUp.duration(350)}
        exiting={FadeOut.duration(150)}
        key={introStep}
        style={{ alignItems: 'center', gap: SPACING['3xl'], maxWidth: 340, width: '100%' }}>
        {/* Icon */}
        <View
          style={{
            alignItems: 'center',
            backgroundColor: `${accent}12`,
            borderRadius: RADIUS.xl,
            height: 80,
            justifyContent: 'center',
            width: 80,
          }}>
          <Ionicons color={accent} name={currentIntroStep.icon} size={36} />
        </View>

        {/* Step indicator dots */}
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.sm }}>
          {INTRO_STEPS.map((_, i) => (
            <View
              key={i}
              style={{
                backgroundColor: i <= introStep ? accent : 'rgba(0,0,0,0.08)',
                borderRadius: 9999,
                height: 8,
                width: i === introStep ? 24 : 8,
              }}
            />
          ))}
        </View>

        {/* Text content */}
        <View style={{ alignItems: 'center', gap: SPACING.md }}>
          <Text
            style={{
              color: COLORS.softBrown,
              fontSize: FONT_SIZES['3xl'],
              fontWeight: FONT_WEIGHTS.bold,
              lineHeight: FONT_SIZES['3xl'] * 1.2,
              textAlign: 'center',
            }}>
            {currentIntroStep.title}
          </Text>

          <Text
            style={{
              color: accent,
              fontSize: FONT_SIZES.base,
              fontWeight: FONT_WEIGHTS.medium,
            }}>
            {currentIntroStep.subtitle}
          </Text>

          <Text
            style={{
              color: COLORS.warmGray,
              fontSize: FONT_SIZES.base,
              lineHeight: FONT_SIZES.base * 1.5,
              textAlign: 'center',
            }}>
            {currentIntroStep.description}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={{ gap: SPACING.md, width: '100%' }}>
          <Button onPress={handleNextIntroStep}>
            <ButtonLabel>
              {introStep === INTRO_STEPS.length - 1 ? 'Start' : 'Next'}
            </ButtonLabel>
            <Ionicons color="#FFFFFF" name="arrow-forward" size={18} />
          </Button>

          {introStep > 0 ? (
            <Button onPress={handleBackIntroStep} variant="ghost">
              <Ionicons color={COLORS.softBrown} name="arrow-back" size={18} />
              <ButtonLabel variant="ghost">Back</ButtonLabel>
            </Button>
          ) : (
            <Button onPress={() => setPhase('questions')} variant="ghost">
              <ButtonLabel style={{ color: COLORS.warmGray }} variant="ghost">
                Skip intro
              </ButtonLabel>
            </Button>
          )}

          {answeredCount > 0 && (
            <Button onPress={() => setPhase('questions')} variant="ghost">
              <ButtonLabel style={{ color: accent }} variant="ghost">
                Resume
              </ButtonLabel>
            </Button>
          )}
        </View>
      </Animated.View>
    </ScrollView>
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
  questionContainer: {
    flexGrow: 1,
    padding: SPACING.xl,
    paddingBottom: 32,
    paddingTop: 48,
  },
});
