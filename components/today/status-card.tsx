import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Card, CardBody } from '@/components/ui/card';
import { Button, ButtonLabel } from '@/components/ui/button';
import { IconContainer } from '@/components/ui/icon-container';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

interface StatusCardProps {
  status: 'completed' | 'inProgress' | 'empty';
  answersCount: number;
  currentType?: string | null;
  onStartSession: () => void;
  onResumeSession: () => void;
}

export function StatusCard({
  status,
  answersCount,
  currentType,
  onStartSession,
  onResumeSession,
}: StatusCardProps) {
  const isCompleted = status === 'completed';
  const isInProgress = status === 'inProgress';
  const isEmpty = status === 'empty';

  const statusConfig = {
    completed: {
      icon: 'checkmark-circle' as const,
      iconColor: '#FFFFFF',
      containerVariant: 'sage' as const,
      title: 'Daily Check-in Complete',
      description: 'Great job completing your daily reflection.',
      cardVariant: 'sage' as const,
    },
    inProgress: {
      icon: 'play-circle' as const,
      iconColor: '#FFFFFF',
      containerVariant: 'terracotta' as const,
      title: 'Check-in In Progress',
      description: 'Continue where you left off.',
      cardVariant: 'terracotta' as const,
    },
    empty: {
      icon: 'sunny-outline' as const,
      iconColor: COLORS.softBrown,
      containerVariant: 'default' as const,
      title: 'Start Your Day',
      description: 'Take a moment to check in with yourself.',
      cardVariant: 'terracotta' as const,
    },
  };

  const config = statusConfig[status];

  return (
    <Card variant={config.cardVariant}>
      <CardBody gap="lg">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <IconContainer variant={config.containerVariant} size="lg">
            <Ionicons name={config.icon} size={28} color={config.iconColor} />
          </IconContainer>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: FONT_SIZES.lg,
                fontWeight: FONT_WEIGHTS.semibold,
                color: COLORS.softBrown,
              }}>
              {config.title}
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES.base,
                color: COLORS.warmGray,
              }}>
              {config.description}
            </Text>
          </View>
        </View>

        {/* Empty State */}
        {isEmpty && (
          <Button onPress={onStartSession}>
            <Ionicons name="play-outline" size={18} color="#FFFFFF" />
            <ButtonLabel>Start Daily Check-in</ButtonLabel>
          </Button>
        )}

        {/* In-Progress State */}
        {isInProgress && (
          <View style={{ gap: SPACING.sm }}>
            <Button onPress={onResumeSession}>
              <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
              <ButtonLabel>Continue Check-in</ButtonLabel>
            </Button>
            <Text
              style={{
                textAlign: 'center',
                fontSize: FONT_SIZES.sm,
                color: COLORS.warmGray,
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
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: SPACING.sm,
              }}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.sage} />
              <Text
                style={{
                  fontSize: FONT_SIZES.sm,
                  color: COLORS.sage,
                  fontWeight: FONT_WEIGHTS.medium,
                }}>
                Completed today
              </Text>
            </View>
            {currentType && (
              <View style={{ alignItems: 'center', gap: SPACING.xs, paddingTop: SPACING.sm }}>
                <Text
                  style={{
                    fontSize: FONT_SIZES.sm,
                    color: COLORS.warmGray,
                  }}>
                  Current Type
                </Text>
                <Text
                  style={{
                    fontSize: FONT_SIZES['2xl'],
                    fontWeight: FONT_WEIGHTS.bold,
                    color: COLORS.sage,
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
