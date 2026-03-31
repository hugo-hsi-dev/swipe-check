import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

import { Button } from 'heroui-native';

import { useOnboardingSession } from '@/hooks/use-onboarding-session';

export default function OnboardingScreen() {
  const { isLoading, completeOnboarding } = useOnboardingSession();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Swipe Check',
      description: 'Discover your personality type through quick daily questions.',
    },
    {
      title: 'Swipe to Answer',
      description: 'Swipe right for agree, left for disagree. It\'s that simple!',
    },
    {
      title: 'Track Your Type',
      description: 'See how your personality evolves over time with daily insights.',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    await completeOnboarding();
    router.replace('/today');
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <View className="flex-1 bg-background px-6 py-12">
      {/* Progress indicator */}
      <View className="flex-row justify-center gap-2 mb-12">
        {steps.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full ${
              index === currentStep ? 'w-8 bg-accent' : 'w-2 bg-surface-secondary'
            }`}
          />
        ))}
      </View>

      {/* Content */}
      <View className="flex-1 justify-center gap-6">
        <Text className="text-3xl font-bold text-center text-primary">
          {currentStepData.title}
        </Text>
        <Text className="text-lg text-center text-secondary">
          {currentStepData.description}
        </Text>
      </View>

      {/* Navigation buttons */}
      <View className="gap-4 mt-8">
        {isLastStep ? (
          <Button
            onPress={handleComplete}
            isDisabled={isLoading}
            className="w-full">
            <Button.Label>Get Started</Button.Label>
          </Button>
        ) : (
          <>
            <Button onPress={handleNext} className="w-full">
              <Button.Label>Next</Button.Label>
            </Button>
            <Pressable onPress={handleComplete} className="py-3">
              <Text className="text-center text-secondary">Skip</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
