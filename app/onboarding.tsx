import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card } from 'heroui-native';

import type { QuestionResponse } from '@/constants/question-contract';
import { useOnboardingSession } from '@/hooks/use-onboarding-session';

type OnboardingPhase = 'intro' | 'questions';

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
  } = useOnboardingSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<OnboardingPhase>('intro');

  const steps = [
    {
      title: 'Welcome to Swipe Check',
      description:
        'Discover your personality type through quick daily check-ins. Swipe through questions and track your type over time.',
      icon: 'hand-left-outline',
    },
    {
      title: 'Quick Daily Sessions',
      description:
        'Each day, you will get a curated set of questions. Answer with a simple swipe or tap. It takes less than a minute.',
      icon: 'time-outline',
    },
    {
      title: 'Track Your Insights',
      description:
        'Watch your personality profile evolve. See trends, patterns, and insights about how you think and interact.',
      icon: 'trending-up-outline',
    },
  ];

  useEffect(() => {
    if (!isLoading && answeredCount > 0) {
      setPhase('questions');
    }
  }, [answeredCount, isLoading]);

  async function handleComplete() {
    await completeOnboarding();
    router.replace('/today');
  }

  async function handleAnswer(response: QuestionResponse) {
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) {
      return;
    }

    const nextAnsweredCount = answeredCount + 1;

    await submitAnswer(currentQuestion.question.id, response);

    if (nextAnsweredCount === totalCount) {
      await handleComplete();
    }
  }

  function handleNext() {
    if (phase === 'intro' && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (phase === 'intro') {
      setPhase('questions');
    } else {
      void handleComplete();
    }
  }

  const currentStepData = steps[currentStep];
  const currentQuestion = currentQuestionIndex >= 0 ? questions[currentQuestionIndex] : null;
  const showQuestionFlow = phase === 'questions';

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        gap: 32,
      }}>
      {showQuestionFlow ? (
        <View className="gap-6">
          <View className="items-center gap-3">
            {currentQuestion ? (
              <Text className="text-center text-2xl font-semibold">{currentQuestion.question.prompt}</Text>
            ) : (
              <Text className="text-center text-2xl font-semibold">You&apos;re ready to finish</Text>
            )}
            <Text className="text-center text-base text-text-secondary">
              {answeredCount} of {totalCount} answered
            </Text>
          </View>

          <Card>
            <Card.Body className="gap-4">
              {currentQuestion ? (
                <>
                  <Text className="text-center text-text-secondary leading-relaxed">
                    Choose the response that feels most accurate.
                  </Text>

                  <Button isDisabled={isLoading || isSubmitting} onPress={() => void handleAnswer('agree')}>
                    <Ionicons name="checkmark" size={18} />
                    <Button.Label>Agree</Button.Label>
                  </Button>

                  <Button
                    variant="tertiary"
                    isDisabled={isLoading || isSubmitting}
                    onPress={() => void handleAnswer('disagree')}>
                    <Ionicons name="close" size={18} />
                    <Button.Label>Disagree</Button.Label>
                  </Button>
                </>
              ) : (
                <>
                  <Text className="text-center text-text-secondary leading-relaxed">
                    Your answers are ready. Finish onboarding to continue.
                  </Text>

                  <Button isDisabled={isLoading || isSubmitting} onPress={() => void handleComplete()}>
                    <Ionicons name="checkmark-circle" size={18} />
                    <Button.Label>Get Started</Button.Label>
                  </Button>
                </>
              )}

            </Card.Body>
          </Card>
        </View>
      ) : (
        <>
          <View className="items-center gap-6">
            <View className="size-24 items-center justify-center rounded-full bg-accent-soft">
              <Ionicons name={currentStepData.icon as keyof typeof Ionicons.glyphMap} size={40} />
            </View>

            <View className="items-center gap-3">
              <Text className="text-center text-2xl font-semibold">{currentStepData.title}</Text>
              <Text className="text-center text-base text-text-secondary leading-relaxed">
                {currentStepData.description}
              </Text>
            </View>
          </View>

          <Card>
            <Card.Body className="gap-6">
              <View className="flex-row justify-center gap-2">
                {steps.map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index === currentStep ? 'bg-accent' : 'bg-surface-tertiary'
                    }`}
                  />
                ))}
              </View>

              <Button onPress={handleNext} isDisabled={isLoading || isSubmitting}>
                <Ionicons name="arrow-forward" size={18} />
                <Button.Label>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</Button.Label>
              </Button>
            </Card.Body>
          </Card>
        </>
      )}
    </ScrollView>
  );
}
