import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Card, CardBody } from '@/components/ui/card';
import { Badge, BadgeLabel } from '@/components/ui/badge';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

interface StreakCardProps {
  streakCount: number;
  totalReflections: number;
}

export function StreakCard({ streakCount, totalReflections }: StreakCardProps) {
  return (
    <Card variant="peach">
      <CardBody>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: 'rgba(212, 165, 116, 0.2)',
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="flame-outline" size={24} color={COLORS.coral} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: FONT_SIZES.sm,
                color: COLORS.warmGray,
                marginBottom: SPACING.xs,
              }}>
              Current Streak
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
                color: COLORS.softBrown,
              }}>
              {streakCount} day{streakCount === 1 ? '' : 's'}
            </Text>
          </View>

          <Badge variant="coral" size="sm">
            <BadgeLabel>{totalReflections} reflections</BadgeLabel>
          </Badge>
        </View>
      </CardBody>
    </Card>
  );
}

interface MiniStreakProps {
  count: number;
}

export function MiniStreak({ count }: MiniStreakProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: 'rgba(212, 165, 116, 0.15)',
        borderRadius: 9999,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
      }}>
      <Ionicons name="flame" size={14} color={COLORS.coral} />
      <Text
        style={{
          fontSize: FONT_SIZES.xs,
          fontWeight: FONT_WEIGHTS.semibold,
          color: COLORS.coral,
        }}>
        {count}
      </Text>
    </View>
  );
}
