import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card } from 'heroui-native';

import { useOnboardingSession } from '@/hooks/use-onboarding-session';

export default function OnboardingScreen() {
  const { isLoading, completeOnboarding } = useOnboardingSession();
  const [currentStep, setCurrentStep] = useState(0);

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

  async function handleComplete() {
    await completeOnboarding();
    router.replace('/(tabs)');
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      void handleComplete();
    }
  }

  const currentStepData = steps[currentStep];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        gap: 32,
      }}>
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

          <Button onPress={handleNext} isDisabled={isLoading}>
            <Ionicons name={currentStep === steps.length - 1 ? 'checkmark' : 'arrow-forward'} size={18} />
            <Button.Label>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button.Label>
          </Button>

          {currentStep > 0 && (
            <Button variant="tertiary" onPress={() => setCurrentStep(currentStep - 1)}>
              <Button.Label>Back</Button.Label>
            </Button>
          )}
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
