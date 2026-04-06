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

import { Card, CardBody } from '@/components/ui/card';
import { Button, ButtonLabel } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/session/progress-bar';
import { QuestionCard } from '@/components/session/question-card';
import { AnswerButtonGroup } from '@/components/session/answer-button';
import type { QuestionResponse } from '@/constants/question-contract';
import { AXES } from '@/constants/questions';
import { useOnboardingSession } from '@/hooks/use-onboarding-session';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

type OnboardingPhase = 'intro' | 'questions' | 'complete';

const INTRO_STEPS = [
  {
    icon: 'sparkles-outline' as const,
    title: 'Welcome to Swipe Check',
    subtitle: 'Your personal pattern journal',
    description: 'Track how you think, feel, and act over time. Not a personality test—just a daily practice of noticing.',
  },
  {
    icon: 'time-outline' as const,
    title: '12 questions. 2 minutes.',
    subtitle: 'Quick baseline setup',
    description: 'First, we will ask 12 questions to understand your starting point. No right answers. Just be honest.',
  },
  {
    icon: 'flash-outline' as const,
    title: 'Trust your gut',
    subtitle: 'Go with your first instinct',
    description: 'Agree or Disagree. Do not overthink it. Your immediate response is usually the most accurate.',
  },
  {
    icon: 'calendar-outline' as const,
    title: 'Then, 3 questions a day',
    subtitle: 'Build the habit',
    description: 'After setup, short daily check-ins help you spot patterns and see how you change over time.',
  },
] as const;

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

export default function OnboardingScreen() {
  const {
    answeredCount,
    currentQuestionIndex,
    isLoading,
    isSubmitting,
    questions,
    completeOnboarding,
    submitAnswer,
    totalCount,
    canComplete,
  } = useOnboardingSession();

  const accent = COLORS.terracotta;

  const [introStep, setIntroStep] = useState(0);
  const [phase, setPhase] = useState<OnboardingPhase>('intro');
  const [lastAnswer, setLastAnswer] = useState<QuestionResponse | null>(null);

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
    } catch {
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
              Preparing...
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES.base,
                color: COLORS.warmGray,
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
              All set
            </Text>
            <Text
              style={{
                textAlign: 'center',
                fontSize: FONT_SIZES.base,
                lineHeight: FONT_SIZES.base * 1.5,
                color: COLORS.warmGray,
              }}>
              Your baseline is saved. Come back tomorrow for your first daily check-in.
            </Text>
          </View>

          <Button onPress={() => void handleComplete()} isDisabled={isSubmitting}>
            <ButtonLabel>Start tracking</ButtonLabel>
            {!isSubmitting && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          </Button>
        </Animated.View>
      </ScrollView>
    );
  }

  if (phase === 'questions') {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.cream }}
        contentContainerStyle={styles.questionContainer}
        bounces={false}
        overScrollMode="never">
        <DecorativeOrb color={accent} size={250} top={-80} left={-80} opacity={0.1} />

        <Animated.View entering={FadeInUp.duration(350)} style={{ gap: SPACING.xl, width: '100%' }}>
          {/* Progress header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <Ionicons name="help-circle-outline" size={20} color={accent} />
              <Text
                style={{
                  fontSize: FONT_SIZES.sm,
                  fontWeight: FONT_WEIGHTS.medium,
                  color: COLORS.warmGray,
                }}>
                {answeredCount + 1} / {totalCount}
              </Text>
            </View>
            {currentAxis && (
              <Badge variant="terracotta" size="sm">
                <Text
                  style={{
                    fontSize: FONT_SIZES.xs,
                    fontWeight: FONT_WEIGHTS.semibold,
                    color: COLORS.terracotta,
                  }}>
                  {currentAxis.name}
                </Text>
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

          {/* Question card */}
          <QuestionCard
            prompt={currentQuestion?.question.prompt ?? 'Loading...'}
            categoryLabel={currentAxis?.name}
          />

          {/* Answer buttons */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)} style={{ gap: SPACING.md }}>
            <AnswerButtonGroup
              onAgree={() => void handleAnswer('agree')}
              onDisagree={() => void handleAnswer('disagree')}
              isDisabled={isSubmitting || !currentQuestion}
            />
          </Animated.View>

          {isSubmitting && (
            <Animated.View entering={FadeIn.duration(150)}>
              <Card variant="default">
                <CardBody
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.md,
                    padding: SPACING.lg,
                  }}>
                  <Ionicons
                    name={lastAnswer === 'agree' ? 'checkmark' : 'close'}
                    size={20}
                    color={accent}
                  />
                  <Text style={{ fontSize: FONT_SIZES.sm, color: COLORS.warmGray }}>Saving...</Text>
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
      style={{ flex: 1, backgroundColor: COLORS.cream }}
      contentContainerStyle={styles.centeredContainer}
      bounces={false}
      overScrollMode="never">
      <DecorativeOrb color={accent} size={300} top={-100} left={-100} opacity={0.1} />
      <DecorativeOrb color="#8B5CF6" size={180} top={200} right={-60} opacity={0.06} />

      <Animated.View
        key={introStep}
        entering={FadeInUp.duration(350)}
        exiting={FadeOut.duration(150)}
        style={{ alignItems: 'center', gap: SPACING['3xl'], width: '100%', maxWidth: 340 }}>
        {/* Icon */}
        <View
          style={{
            width: 80,
            height: 80,
            backgroundColor: `${accent}12`,
            borderRadius: RADIUS.xl,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name={currentIntroStep.icon} size={36} color={accent} />
        </View>

        {/* Step indicator dots */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
          {INTRO_STEPS.map((_, i) => (
            <View
              key={i}
              style={{
                height: 8,
                borderRadius: 9999,
                width: i === introStep ? 24 : 8,
                backgroundColor: i <= introStep ? accent : 'rgba(0,0,0,0.08)',
              }}
            />
          ))}
        </View>

        {/* Text content */}
        <View style={{ gap: SPACING.md, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: FONT_SIZES['3xl'],
              fontWeight: FONT_WEIGHTS.bold,
              color: COLORS.softBrown,
              textAlign: 'center',
              lineHeight: FONT_SIZES['3xl'] * 1.2,
            }}>
            {currentIntroStep.title}
          </Text>

          <Text
            style={{
              fontSize: FONT_SIZES.base,
              color: accent,
              fontWeight: FONT_WEIGHTS.medium,
            }}>
            {currentIntroStep.subtitle}
          </Text>

          <Text
            style={{
              textAlign: 'center',
              fontSize: FONT_SIZES.base,
              lineHeight: FONT_SIZES.base * 1.5,
              color: COLORS.warmGray,
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
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Button>

          {introStep > 0 ? (
            <Button variant="ghost" onPress={handleBackIntroStep}>
              <Ionicons name="arrow-back" size={18} color={COLORS.softBrown} />
              <ButtonLabel variant="ghost">Back</ButtonLabel>
            </Button>
          ) : (
            <Button variant="ghost" onPress={() => setPhase('questions')}>
              <ButtonLabel variant="ghost" style={{ color: COLORS.warmGray }}>
                Skip intro
              </ButtonLabel>
            </Button>
          )}

          {answeredCount > 0 && (
            <Button variant="ghost" onPress={() => setPhase('questions')}>
              <ButtonLabel variant="ghost" style={{ color: accent }}>
                Resume
              </ButtonLabel>
            </Button>
          )}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
