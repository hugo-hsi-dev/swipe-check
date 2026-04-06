import { Text, View } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

interface ProgressBarProps {
  progressPercentage: number;
  currentStep: number;
  totalSteps: number;
  accentColor?: string;
}

export function ProgressBar({
  progressPercentage,
  currentStep,
  totalSteps,
  accentColor = COLORS.terracotta,
}: ProgressBarProps) {
  return (
    <View style={{ gap: SPACING.sm }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.medium,
            color: COLORS.warmGray,
          }}>
          Question {currentStep} of {totalSteps}
        </Text>
        <Text
          style={{
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.medium,
            color: accentColor,
          }}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>
      <View
        style={{
          height: 8,
          backgroundColor: COLORS.sageLight,
          borderRadius: RADIUS.pill,
          overflow: 'hidden',
        }}>
        <View
          style={{
            height: '100%',
            width: `${progressPercentage}%`,
            backgroundColor: accentColor,
            borderRadius: RADIUS.pill,
          }}
        />
      </View>
    </View>
  );
}

interface MiniProgressBarProps {
  progressPercentage: number;
  accentColor?: string;
}

export function MiniProgressBar({
  progressPercentage,
  accentColor = COLORS.terracotta,
}: MiniProgressBarProps) {
  return (
    <View
      style={{
        height: 4,
        backgroundColor: COLORS.sageLight,
        borderRadius: RADIUS.pill,
        overflow: 'hidden',
      }}>
      <View
        style={{
          height: '100%',
          width: `${progressPercentage}%`,
          backgroundColor: accentColor,
          borderRadius: RADIUS.pill,
        }}
      />
    </View>
  );
}
