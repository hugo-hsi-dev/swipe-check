import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, useThemeColor } from 'heroui-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';

import type { QuestionResponse } from '@/constants/question-contract';
import { AXES } from '@/constants/questions';
import { useOnboardingSession } from '@/hooks/use-onboarding-session';

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

function DecorativeOrb({ color, size, top, left, right, bottom, opacity = 0.15 }: { 
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

  const [accent, accentForeground, foreground, success] = useThemeColor([
    'accent',
    'accent-foreground',
    'foreground',
    'success',
  ]);

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
      <ScrollView className="flex-1 bg-background" contentContainerStyle={styles.centeredContainer} bounces={false} overScrollMode="never">
        <View className="items-center gap-6">
          <View className="size-16 items-center justify-center rounded-3xl" style={{ backgroundColor: `${accent}15` }}>
            <Ionicons name="hourglass-outline" size={32} color={accent} />
          </View>
          <View className="gap-2 items-center">
            <Text className="text-2xl font-bold text-foreground">Preparing...</Text>
            <Text className="text-center text-base text-muted">One moment</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (phase === 'complete') {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={styles.centeredContainer} bounces={false} overScrollMode="never">
        <DecorativeOrb color={success} size={300} top={-100} left={-100} opacity={0.1} />
        <DecorativeOrb color={accent} size={200} top={150} right={-80} opacity={0.08} />

        <Animated.View entering={FadeInUp.duration(400)} className="items-center gap-8 w-full max-w-[340px]">
          <View className="size-24 items-center justify-center rounded-full" style={{ backgroundColor: `${success}15` }}>
            <Ionicons name="checkmark-circle" size={48} color={success} />
          </View>

          <View className="gap-3 items-center">
            <Text className="text-3xl font-bold text-foreground text-center">All set</Text>
            <Text className="text-center text-base leading-6 text-muted">
              Your baseline is saved. Come back tomorrow for your first daily check-in.
            </Text>
          </View>

          <Button onPress={() => void handleComplete()} isDisabled={isSubmitting} size="lg" className="w-full">
            <Button.Label className="text-lg font-semibold">Start tracking</Button.Label>
            {!isSubmitting && <Ionicons name="arrow-forward" size={18} color={accentForeground} />}
          </Button>
        </Animated.View>
      </ScrollView>
    );
  }

  if (phase === 'questions') {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={styles.questionContainer} bounces={false} overScrollMode="never">
        <DecorativeOrb color={accent} size={250} top={-80} left={-80} opacity={0.1} />

        <Animated.View entering={FadeInUp.duration(350)} className="gap-6 w-full">
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

          {/* Question card */}
          <Card variant="secondary" className="overflow-hidden">
            <View className="h-1 w-full" style={{ backgroundColor: accent, opacity: 0.2 }} />
            <Card.Body className="p-6">
              <Text className="text-xl font-semibold leading-relaxed text-foreground">
                {currentQuestion?.question.prompt ?? 'Loading...'}
              </Text>
            </Card.Body>
          </Card>

          {/* Answer buttons */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)} className="gap-3">
            <Button
              onPress={() => void handleAnswer('agree')}
              isDisabled={isSubmitting || !currentQuestion}
              size="lg"
              className="w-full"
            >
              <Ionicons name="checkmark" size={22} color={accentForeground} />
              <Button.Label className="text-lg font-semibold">Agree</Button.Label>
            </Button>

            <Button
              variant="outline"
              onPress={() => void handleAnswer('disagree')}
              isDisabled={isSubmitting || !currentQuestion}
              size="lg"
              className="w-full"
            >
              <Ionicons name="close" size={22} color={foreground} />
              <Button.Label className="text-lg font-semibold">Disagree</Button.Label>
            </Button>
          </Animated.View>

          {isSubmitting && (
            <Animated.View entering={FadeIn.duration(150)}>
              <Card variant="tertiary">
                <Card.Body className="flex-row items-center gap-3 p-4">
                  <Ionicons name={lastAnswer === 'agree' ? 'checkmark' : 'close'} size={20} color={accent} />
                  <Text className="text-sm text-muted">Saving...</Text>
                </Card.Body>
              </Card>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    );
  }

  // Intro phase
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={styles.centeredContainer} bounces={false} overScrollMode="never">
      <DecorativeOrb color={accent} size={300} top={-100} left={-100} opacity={0.1} />
      <DecorativeOrb color="#8B5CF6" size={180} top={200} right={-60} opacity={0.06} />

      <Animated.View
        key={introStep}
        entering={FadeInUp.duration(350)}
        exiting={FadeOut.duration(150)}
        className="items-center gap-8 w-full max-w-[340px]"
      >
        {/* Icon */}
        <View className="size-20 items-center justify-center rounded-3xl" style={{ backgroundColor: `${accent}12` }}>
          <Ionicons name={currentIntroStep.icon} size={36} color={accent} />
        </View>

        {/* Step indicator dots */}
        <View className="flex-row items-center gap-2">
          {INTRO_STEPS.map((_, i) => (
            <View
              key={i}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === introStep ? 24 : 8,
                backgroundColor: i <= introStep ? accent : 'rgba(0,0,0,0.08)',
              }}
            />
          ))}
        </View>

        {/* Text content */}
        <View className="gap-3 items-center">
          <Text className="text-3xl font-bold text-foreground text-center leading-tight">
            {currentIntroStep.title}
          </Text>

          <Text className="text-base text-accent font-medium">
            {currentIntroStep.subtitle}
          </Text>

          <Text className="text-center text-base leading-6 text-muted">
            {currentIntroStep.description}
          </Text>
        </View>

        {/* Action buttons */}
        <View className="gap-3 w-full">
          <Button onPress={handleNextIntroStep} size="lg" className="w-full">
            <Button.Label className="text-lg font-semibold">
              {introStep === INTRO_STEPS.length - 1 ? 'Start' : 'Next'}
            </Button.Label>
            <Ionicons name="arrow-forward" size={18} color={accentForeground} />
          </Button>

          {introStep > 0 ? (
            <Button variant="ghost" onPress={handleBackIntroStep} className="w-full">
              <Ionicons name="arrow-back" size={18} color={foreground} />
              <Button.Label>Back</Button.Label>
            </Button>
          ) : (
            <Button variant="ghost" onPress={() => setPhase('questions')}>
              <Button.Label className="text-muted">Skip intro</Button.Label>
            </Button>
          )}

          {answeredCount > 0 && (
            <Button variant="ghost" onPress={() => setPhase('questions')}>
              <Button.Label style={{ color: accent }}>Resume</Button.Label>
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
});