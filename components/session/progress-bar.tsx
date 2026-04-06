import { Text, View } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

interface MiniProgressBarProps {
  accentColor?: string;
  progressPercentage: number;
}

interface ProgressBarProps {
  accentColor?: string;
  currentStep: number;
  progressPercentage: number;
  totalSteps: number;
}

export function MiniProgressBar({
  accentColor = COLORS.terracotta,
  progressPercentage,
}: MiniProgressBarProps) {
  return (
    <View
      style={{
        backgroundColor: COLORS.sageLight,
        borderRadius: RADIUS.pill,
        height: 4,
        overflow: 'hidden',
      }}>
      <View
        style={{
          backgroundColor: accentColor,
          borderRadius: RADIUS.pill,
          height: '100%',
          width: `${progressPercentage}%`,
        }}
      />
    </View>
  );
}

export function ProgressBar({
  accentColor = COLORS.terracotta,
  currentStep,
  progressPercentage,
  totalSteps,
}: ProgressBarProps) {
  return (
    <View style={{ gap: SPACING.sm }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            color: COLORS.warmGray,
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.medium,
          }}>
          Question {currentStep} of {totalSteps}
        </Text>
        <Text
          style={{
            color: accentColor,
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.medium,
          }}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>
      <View
        style={{
          backgroundColor: COLORS.sageLight,
          borderRadius: RADIUS.pill,
          height: 8,
          overflow: 'hidden',
        }}>
        <View
          style={{
            backgroundColor: accentColor,
            borderRadius: RADIUS.pill,
            height: '100%',
            width: `${progressPercentage}%`,
          }}
        />
      </View>
    </View>
  );
}
