import { Text, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Button, ButtonLabel } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { IconContainer } from '@/components/ui/icon-container';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

interface StatusCardProps {
  answersCount: number;
  currentType?: null | string;
  onResumeSession: () => void;
  onStartSession: () => void;
  status: 'completed' | 'empty' | 'inProgress';
}

export function StatusCard({
  answersCount,
  currentType,
  onResumeSession,
  onStartSession,
  status,
}: StatusCardProps) {
  const isCompleted = status === 'completed';
  const isInProgress = status === 'inProgress';
  const isEmpty = status === 'empty';

  const statusConfig = {
    completed: {
      cardVariant: 'sage' as const,
      containerVariant: 'sage' as const,
      description: 'Great job completing your daily reflection.',
      icon: 'checkmark-circle' as const,
      iconColor: '#FFFFFF',
      title: 'Daily Check-in Complete',
    },
    empty: {
      cardVariant: 'terracotta' as const,
      containerVariant: 'default' as const,
      description: 'Take a moment to check in with yourself.',
      icon: 'sunny-outline' as const,
      iconColor: COLORS.softBrown,
      title: 'Start Your Day',
    },
    inProgress: {
      cardVariant: 'terracotta' as const,
      containerVariant: 'terracotta' as const,
      description: 'Continue where you left off.',
      icon: 'play-circle' as const,
      iconColor: '#FFFFFF',
      title: 'Check-in In Progress',
    },
  };

  const config = statusConfig[status];

  return (
    <Card variant={config.cardVariant}>
      <CardBody gap="lg">
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.md }}>
          <IconContainer size="lg" variant={config.containerVariant}>
            <AppIcon color={config.iconColor} name={config.icon} size={28} />
          </IconContainer>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: COLORS.softBrown,
                fontSize: FONT_SIZES.lg,
                fontWeight: FONT_WEIGHTS.semibold,
              }}>
              {config.title}
            </Text>
            <Text
              style={{
                color: COLORS.warmGray,
                fontSize: FONT_SIZES.base,
              }}>
              {config.description}
            </Text>
          </View>
        </View>

        {/* Empty State */}
        {isEmpty && (
          <Button onPress={onStartSession}>
            <AppIcon color="#FFFFFF" name="play-outline" size={18} />
            <ButtonLabel>Start Daily Check-in</ButtonLabel>
          </Button>
        )}

        {/* In-Progress State */}
        {isInProgress && (
          <View style={{ gap: SPACING.sm }}>
            <Button onPress={onResumeSession}>
              <AppIcon color="#FFFFFF" name="refresh-outline" size={18} />
              <ButtonLabel>Continue Check-in</ButtonLabel>
            </Button>
            <Text
              style={{
                color: COLORS.warmGray,
                fontSize: FONT_SIZES.sm,
                textAlign: 'center',
              }}>
              {answersCount > 0
                ? `${answersCount} question${answersCount === 1 ? '' : 's'} answered`
                : 'No questions answered yet'}
            </Text>
          </View>
        )}

        {/* Completed State */}
        {isCompleted && (
          <View style={{ gap: SPACING.sm }}>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                gap: SPACING.sm,
                justifyContent: 'center',
              }}>
              <AppIcon color={COLORS.sage} name="checkmark-circle" size={16} />
              <Text
                style={{
                  color: COLORS.sage,
                  fontSize: FONT_SIZES.sm,
                  fontWeight: FONT_WEIGHTS.medium,
                }}>
                Completed today
              </Text>
            </View>
            {currentType && (
              <View style={{ alignItems: 'center', gap: SPACING.xs, paddingTop: SPACING.sm }}>
                <Text
                  style={{
                    color: COLORS.warmGray,
                    fontSize: FONT_SIZES.sm,
                  }}>
                  Current Type
                </Text>
                <Text
                  style={{
                    color: COLORS.sage,
                    fontSize: FONT_SIZES['2xl'],
                    fontWeight: FONT_WEIGHTS.bold,
                  }}>
                  {currentType}
                </Text>
              </View>
            )}
          </View>
        )}
      </CardBody>
    </Card>
  );
}
