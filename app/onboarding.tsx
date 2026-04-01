import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { Button, Card } from 'heroui-native';

import type { QuestionResponse } from '@/constants/question-contract';
import { useOnboardingSession } from '@/hooks/use-onboarding-session';

type OnboardingPhase = 'intro' | 'questions' | 'complete';

const INTRO_STEPS = [
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

  // Loading state
  if (isLoading) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={styles.centeredContainer}
      >
        <View className="items-center gap-4">
          <View className="size-16 items-center justify-center rounded-full bg-accent-soft">
            <Ionicons name="hourglass-outline" size={32} className="text-accent" />
          </View>
          <Text className="text-center text-lg text-text-secondary">Loading your session...</Text>
        </View>
      </ScrollView>
    );
  }

  // Completion state
  if (phase === 'complete') {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={styles.centeredContainer}
      >
        <View className="gap-6">
          <View className="items-center gap-4">
            <View className="size-24 items-center justify-center rounded-full bg-success/10">
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            </View>

            <View className="items-center gap-2">
              <Text className="text-center text-2xl font-semibold">You&apos;re All Set!</Text>
              <Text className="text-center text-base text-text-secondary leading-relaxed">
                Your baseline is complete. Come back tomorrow for your first 3-question daily check-in.
              </Text>
            </View>
          </View>

          <Card>
            <Card.Body className="gap-4">
              <View className="gap-2">
                <Text className="text-center text-sm text-text-secondary">Questions answered</Text>
                <Text className="text-center text-3xl font-bold">{answeredCount}/{totalCount}</Text>
              </View>

              <Button
                onPress={() => void handleComplete()}
                isDisabled={isSubmitting}
                size="lg"
              >
                <Ionicons name="arrow-forward" size={18} />
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
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={styles.questionContainer}
      >
        <View className="gap-6">
          {/* Progress bar */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-text-secondary">Question {answeredCount + 1} of {totalCount}</Text>
              <Text className="text-sm font-medium text-accent">{getProgressPercentage()}%</Text>
            </View>
            <View className="h-2 w-full overflow-hidden rounded-full bg-surface-secondary">
              <View
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </View>
          </View>

          {/* Question card */}
          <Card className="bg-surface">
            <Card.Body className="gap-6 py-8">
              <View className="items-center gap-4">
                <View className="size-16 items-center justify-center rounded-full bg-accent-soft">
                  <Text className="text-2xl font-bold text-accent">{answeredCount + 1}</Text>
                </View>
                
                {currentQuestion ? (
                  <Text className="text-center text-xl font-semibold leading-relaxed">
                    {currentQuestion.question.prompt}
                  </Text>
                ) : (
                  <Text className="text-center text-xl font-semibold">Preparing next question...</Text>
                )}
              </View>
            </Card.Body>
          </Card>

          {/* Answer buttons */}
          <View className="gap-3">
            <Button
              onPress={() => void handleAnswer('agree')}
              isDisabled={isSubmitting || !currentQuestion}
              size="lg"
              className="bg-success"
            >
              <Ionicons name="checkmark-circle" size={24} />
              <Button.Label className="text-lg">Agree</Button.Label>
            </Button>

            <Button
              variant="tertiary"
              onPress={() => void handleAnswer('disagree')}
              isDisabled={isSubmitting || !currentQuestion}
              size="lg"
            >
              <Ionicons name="close-circle" size={24} />
              <Button.Label className="text-lg">Disagree</Button.Label>
            </Button>
          </View>

          {/* Subtle hint */}
          <Text className="text-center text-sm text-text-secondary">
            Choose the response that feels most accurate to you right now.
          </Text>

          {/* Answer feedback */}
          {isSubmitting && (
            <View className="items-center gap-2">
              <Text className="text-sm text-accent">
                {lastAnswer === 'agree' ? 'Saving Agree...' : 'Saving Disagree...'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // Intro phase (default)
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={styles.centeredContainer}
    >
      <View className="gap-6">
        {/* Step indicator */}
        <View className="flex-row justify-center gap-2">
          {INTRO_STEPS.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full transition-all duration-200 ${
                index === introStep 
                  ? 'w-6 bg-accent' 
                  : index < introStep 
                    ? 'w-2 bg-accent/60' 
                    : 'w-2 bg-surface-tertiary'
              }`}
            />
          ))}
        </View>

        {/* Content */}
        <Card className="bg-surface">
          <Card.Body className="gap-8 py-8">
            <View className="items-center gap-6">
              <View className="size-24 items-center justify-center rounded-full bg-accent-soft">
                <Ionicons 
                  name={currentIntroStep.icon as keyof typeof Ionicons.glyphMap} 
                  size={48} 
                  className="text-accent" 
                />
              </View>

              <View className="items-center gap-3">
                <Text className="text-center text-2xl font-bold">{currentIntroStep.title}</Text>
                <Text className="text-center text-base text-text-secondary leading-relaxed">
                  {currentIntroStep.description}
                </Text>
              </View>
            </View>

            {/* Step counter */}
            <Text className="text-center text-sm text-text-secondary">
              Step {introStep + 1} of {INTRO_STEPS.length}
            </Text>
          </Card.Body>
        </Card>

        {/* Navigation buttons */}
        <View className="gap-3">
          <Button 
            onPress={handleNextIntroStep} 
            isDisabled={isLoading}
            size="lg"
          >
            <Button.Label className="text-lg">
              {introStep === INTRO_STEPS.length - 1 ? 'Start Questions' : 'Next'}
            </Button.Label>
            <Ionicons name="arrow-forward" size={20} />
          </Button>

          {introStep > 0 && (
            <Button 
              variant="tertiary"
              onPress={handleBackIntroStep}
              isDisabled={isLoading}
            >
              <Ionicons name="arrow-back" size={18} />
              <Button.Label>Back</Button.Label>
            </Button>
          )}
        </View>

        {/* Skip option for returning users */}
        {answeredCount > 0 && (
          <Button 
            variant="ghost"
            onPress={() => setPhase('questions')}
            isDisabled={isLoading}
          >
            <Button.Label className="text-text-secondary">Resume where you left off</Button.Label>
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  questionContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 24,
    paddingTop: 48,
    paddingBottom: 48,
  },
});
