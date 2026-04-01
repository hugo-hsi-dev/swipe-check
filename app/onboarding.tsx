import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, useThemeColor as useHeroThemeColor } from 'heroui-native';

import type { QuestionResponse } from '@/constants/question-contract';
import { AXES } from '@/constants/questions';
import { useOnboardingSession } from '@/hooks/use-onboarding-session';

type OnboardingPhase = 'intro' | 'questions' | 'complete';

const INTRO_STEPS: {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    title: 'Welcome to Swipe Check',
    description:
      'Your daily personality journal. Track how you think, feel, and act over time through simple daily check-ins.',
    icon: 'journal-outline',
  },
  {
    title: 'Baseline Setup',
    description:
      'First, we will ask 12 quick questions to understand your personality baseline. This takes about 2 minutes.',
    icon: 'clipboard-outline',
  },
  {
    title: 'Simple Answers',
    description:
      'Just choose Agree or Disagree for each statement. There are no right or wrong answers—just be honest.',
    icon: 'thumbs-up-outline',
  },
  {
    title: 'Daily Check-ins',
    description:
      'After setup, you will answer just 3 questions daily. Watch your personality patterns emerge over time.',
    icon: 'calendar-outline',
  },
] as const;

const INTRO_METRICS = [
  {
    value: '12',
    label: 'Baseline prompts',
  },
  {
    value: '4',
    label: 'Personality axes',
  },
  {
    value: '3/day',
    label: 'Daily check-ins',
  },
] as const;

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
  const [accentForeground, foreground, successForeground] = useHeroThemeColor([
    'accent-foreground',
    'foreground',
    'success-foreground',
  ]);
  const [introStep, setIntroStep] = useState(0);
  const [phase, setPhase] = useState<OnboardingPhase>('intro');
  const [lastAnswer, setLastAnswer] = useState<QuestionResponse | null>(null);

  // Resume from persisted state: if answers exist, skip to questions
  useEffect(() => {
    if (!isLoading && answeredCount > 0 && phase === 'intro') {
      setPhase('questions');
    }
  }, [answeredCount, isLoading, phase]);

  // Check if all questions are answered
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

    if (!currentQuestion || isSubmitting) {
      return;
    }

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
    if (introStep > 0) {
      setIntroStep(introStep - 1);
    }
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
  const introProgressPercentage = Math.round(((introStep + 1) / INTRO_STEPS.length) * 100);

  // Loading state
  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={styles.loadingContainer}>
        <View className="gap-6">
          <View className="items-start gap-4">
            <View className="size-16 items-center justify-center rounded-3xl bg-accent-soft">
              <Ionicons name="hourglass-outline" size={32} color={accentForeground} />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-semibold uppercase tracking-[0.24em] text-text-secondary">
                Swipe Check
              </Text>
              <Text className="text-3xl font-bold leading-tight text-foreground">
                Preparing your baseline.
              </Text>
              <Text className="max-w-[320px] text-base leading-7 text-text-secondary">
                We are restoring your onboarding session so you can continue exactly where you left
                off.
              </Text>
            </View>
          </View>

          <Card variant="secondary">
            <Card.Body className="gap-4 p-5">
              <View className="flex-row items-center gap-3">
                <View className="size-12 items-center justify-center rounded-2xl bg-surface-secondary">
                  <Ionicons name="sparkles-outline" size={22} color={foreground} />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-base font-semibold text-foreground">
                    Personal baseline, not a personality test.
                  </Text>
                  <Text className="text-sm leading-6 text-text-secondary">
                    Short, honest answers help shape tomorrow&apos;s check-in.
                  </Text>
                </View>
              </View>
            </Card.Body>
          </Card>
        </View>
      </ScrollView>
    );
  }

  // Completion state
  if (phase === 'complete') {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={styles.flowContainer}>
        <View className="relative gap-8">
          <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
            <View className="absolute -left-16 top-8 size-56 rounded-full bg-success/10" />
            <View className="absolute right-[-64px] top-32 size-44 rounded-full bg-accent/10" />
            <View className="absolute bottom-0 left-1/4 size-72 rounded-full bg-surface-secondary/50" />
          </View>

          <View className="gap-4">
            <Chip color="success" variant="soft" size="sm">
              <Chip.Label>Baseline complete</Chip.Label>
            </Chip>

            <View className="items-start gap-4">
              <View className="size-16 items-center justify-center rounded-3xl bg-success/10">
                <Ionicons name="checkmark-circle" size={34} color={successForeground} />
              </View>

              <View className="gap-3">
                <Text className="text-4xl font-bold leading-tight text-foreground">
                  You&apos;re all set.
                </Text>
                <Text className="max-w-[320px] text-base leading-7 text-text-secondary">
                  Your baseline is complete. Come back tomorrow for your first 3-question daily
                  check-in.
                </Text>
              </View>
            </View>
          </View>

          <Card variant="secondary">
            <Card.Body className="gap-4 p-5">
              <View className="flex-row gap-3">
                <View className="flex-1 gap-1 rounded-3xl bg-surface p-4">
                  <Text className="text-sm text-text-secondary">Questions answered</Text>
                  <Text className="text-3xl font-bold text-foreground">
                    {answeredCount}/{totalCount}
                  </Text>
                </View>

                <View className="flex-1 gap-1 rounded-3xl bg-surface p-4">
                  <Text className="text-sm text-text-secondary">Next step</Text>
                  <Text className="text-lg font-semibold text-foreground">Daily check-ins</Text>
                </View>
              </View>

              <Button
                onPress={() => void handleComplete()}
                isDisabled={isSubmitting}
                size="lg"
                className="w-full"
              >
                <Ionicons name="arrow-forward" size={18} color={accentForeground} />
                <Button.Label>Get Started</Button.Label>
              </Button>
            </Card.Body>
          </Card>
        </View>
      </ScrollView>
    );
  }

  // Questions phase
  if (phase === 'questions') {
    return (
      <ScrollView className="flex-1 bg-background" contentContainerStyle={styles.flowContainer}>
        <View className="relative gap-8">
          <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
            <View className="absolute -left-20 top-10 size-56 rounded-full bg-accent/12" />
            <View className="absolute right-[-56px] top-56 size-44 rounded-full bg-success/10" />
            <View className="absolute bottom-0 left-1/4 size-72 rounded-full bg-surface-secondary/60" />
          </View>

          <View className="gap-4">
            <View className="flex-row items-end justify-between gap-4">
              <View className="flex-1 gap-3">
                <Chip color="accent" variant="soft" size="sm">
                  <Chip.Label>
                    Question {answeredCount + 1} of {totalCount}
                  </Chip.Label>
                </Chip>

                <View className="gap-2">
                  <Text className="text-3xl font-bold leading-tight text-foreground">
                    Answer what feels true right now.
                  </Text>
                  <Text className="text-base leading-7 text-text-secondary">
                    There are no right answers. Your pattern is what matters.
                  </Text>
                </View>
              </View>

              <View className="items-end gap-1">
                <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
                  Progress
                </Text>
                <Text className="text-2xl font-bold text-foreground">{progressPercentage}%</Text>
              </View>
            </View>

            <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
              <View
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
          </View>

          <Card variant="secondary" className="overflow-hidden">
            <View className="h-1 w-full bg-accent" style={{ opacity: 0.12 }} />
            <Card.Body className="gap-6 p-6">
              <View className="flex-row items-start gap-4">
                <View className="size-14 items-center justify-center rounded-3xl bg-accent-soft">
                  <Text className="text-2xl font-bold text-accent">{answeredCount + 1}</Text>
                </View>

                <View className="flex-1 gap-3">
                  <View className="flex-row flex-wrap gap-2">
                    {currentAxis && (
                      <Chip variant="soft" color="accent" size="sm">
                        <Chip.Label>{currentAxis.name}</Chip.Label>
                      </Chip>
                    )}
                    <Chip variant="secondary" size="sm">
                      <Chip.Label>Baseline prompt</Chip.Label>
                    </Chip>
                  </View>

                  {currentQuestion ? (
                    <Text className="text-2xl font-semibold leading-snug text-foreground">
                      {currentQuestion.question.prompt}
                    </Text>
                  ) : (
                    <Text className="text-2xl font-semibold leading-snug text-foreground">
                      Preparing the next question...
                    </Text>
                  )}
                </View>
              </View>

              <Text className="text-sm leading-6 text-text-secondary">
                Tap the response that best matches your current default, not your ideal self.
              </Text>
            </Card.Body>
          </Card>

          <View className="gap-3">
            <Button
              onPress={() => void handleAnswer('agree')}
              isDisabled={isSubmitting || !currentQuestion}
              size="lg"
              className="w-full"
            >
              <Ionicons name="checkmark-circle" size={20} color={accentForeground} />
              <Button.Label className="text-lg">Agree</Button.Label>
            </Button>

            <Button
              variant="outline"
              onPress={() => void handleAnswer('disagree')}
              isDisabled={isSubmitting || !currentQuestion}
              size="lg"
              className="w-full"
            >
              <Ionicons name="close-circle" size={20} color={foreground} />
              <Button.Label className="text-lg">Disagree</Button.Label>
            </Button>
          </View>

          <Card variant="transparent">
            <Card.Body className="gap-2 p-0">
              <Text className="text-sm font-medium text-foreground">Why this matters</Text>
              <Text className="text-sm leading-6 text-text-secondary">
                Your baseline shapes tomorrow&apos;s 3-question check-in and the personality snapshot
                shown in Today and Insights.
              </Text>
            </Card.Body>
          </Card>

          {isSubmitting && (
            <Card variant="secondary">
              <Card.Body className="flex-row items-center gap-3 p-4">
                <View className="size-10 items-center justify-center rounded-2xl bg-accent-soft">
                  <Ionicons
                    name={lastAnswer === 'agree' ? 'checkmark' : 'close'}
                    size={18}
                    color={accentForeground}
                  />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-sm font-medium text-foreground">
                    Saving {lastAnswer === 'agree' ? 'Agree' : 'Disagree'}...
                  </Text>
                  <Text className="text-sm text-text-secondary">Locking in your response.</Text>
                </View>
              </Card.Body>
            </Card>
          )}
        </View>
      </ScrollView>
    );
  }

  // Intro phase (default)
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={styles.flowContainer}>
      <View className="relative gap-8">
        <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
          <View className="absolute -left-20 top-12 size-64 rounded-full bg-accent/12" />
          <View className="absolute right-[-72px] top-40 size-48 rounded-full bg-success/10" />
          <View className="absolute bottom-0 left-1/3 size-80 rounded-full bg-surface-secondary/60" />
        </View>

        <View className="gap-4">
          <View className="flex-row flex-wrap gap-2">
            <Chip color="accent" variant="soft" size="sm">
              <Chip.Label>Onboarding</Chip.Label>
            </Chip>
            <Chip variant="secondary" size="sm">
              <Chip.Label>12 questions</Chip.Label>
            </Chip>
            <Chip color="success" variant="soft" size="sm">
              <Chip.Label>About 2 min</Chip.Label>
            </Chip>
          </View>

          <View className="gap-3">
            <Text className="text-4xl font-bold leading-tight text-foreground">
              Build a baseline that actually feels like you.
            </Text>
            <Text className="max-w-[340px] text-base leading-7 text-text-secondary">
              Swipe Check starts with a fast 12-question baseline, then turns into a short daily
              check-in.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {INTRO_METRICS.map((metric) => (
              <Card key={metric.label} variant="secondary" className="min-w-[110px] flex-1">
                <Card.Body className="gap-1 p-4">
                  <Text className="text-2xl font-bold text-foreground">{metric.value}</Text>
                  <Text className="text-sm leading-5 text-text-secondary">{metric.label}</Text>
                </Card.Body>
              </Card>
            ))}
          </View>
        </View>

        <View className="gap-5">
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-text-secondary">
                Step {introStep + 1} of {INTRO_STEPS.length}
              </Text>
              <Text className="text-sm font-medium text-accent">{introProgressPercentage}%</Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
              <View
                className="h-full rounded-full bg-accent transition-all duration-200"
                style={{ width: `${introProgressPercentage}%` }}
              />
            </View>
          </View>

          <Card variant="secondary" className="overflow-hidden">
            <View className="h-1 w-full bg-accent" style={{ opacity: 0.12 }} />
            <Card.Body className="gap-6 p-6">
              <View className="flex-row items-start gap-4">
                <View className="size-16 items-center justify-center rounded-3xl bg-accent-soft">
                  <Ionicons
                    name={currentIntroStep.icon}
                    size={28}
                    color={accentForeground}
                  />
                </View>

                <View className="flex-1 gap-3">
                  <View className="flex-row flex-wrap items-center gap-2">
                    <Chip variant="soft" color="accent" size="sm">
                      <Chip.Label>Step highlight</Chip.Label>
                    </Chip>
                    <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
                      Swipe Check
                    </Text>
                  </View>

                  <Text className="text-2xl font-semibold leading-snug text-foreground">
                    {currentIntroStep.title}
                  </Text>
                  <Text className="text-base leading-7 text-text-secondary">
                    {currentIntroStep.description}
                  </Text>
                </View>
              </View>

              <Card variant="transparent">
                <Card.Body className="gap-2 p-0">
                  <Text className="text-sm font-medium text-foreground">What to expect</Text>
                  <Text className="text-sm leading-6 text-text-secondary">
                    Keep it honest and quick. The goal is a baseline that feels accurate, not
                    polished.
                  </Text>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </View>

        <View className="gap-3">
          <Button onPress={handleNextIntroStep} isDisabled={isLoading} size="lg" className="w-full">
            <Button.Label className="text-lg">
              {introStep === INTRO_STEPS.length - 1 ? 'Start Questions' : 'Next'}
            </Button.Label>
            <Ionicons name="arrow-forward" size={20} color={accentForeground} />
          </Button>

          {introStep > 0 ? (
            <Button variant="secondary" onPress={handleBackIntroStep} isDisabled={isLoading} size="lg" className="w-full">
              <Ionicons name="arrow-back" size={18} color={foreground} />
              <Button.Label>Back</Button.Label>
            </Button>
          ) : (
            <Button variant="ghost" onPress={() => setPhase('questions')} isDisabled={isLoading}>
              <Button.Label className="text-text-secondary">Skip to questions</Button.Label>
            </Button>
          )}

          {answeredCount > 0 && (
            <Button variant="tertiary" onPress={() => setPhase('questions')} isDisabled={isLoading}>
              <Button.Label className="text-text-secondary">Resume where you left off</Button.Label>
            </Button>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  flowContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
});
