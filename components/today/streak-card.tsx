import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Badge, BadgeLabel } from '@/components/ui/badge';
import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

interface MiniStreakProps {
  count: number;
}

interface StreakCardProps {
  streakCount: number;
  totalReflections: number;
}

export function MiniStreak({ count }: MiniStreakProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: 'rgba(212, 165, 116, 0.15)',
        borderRadius: 9999,
        flexDirection: 'row',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
      }}>
      <Ionicons color={COLORS.coral} name="flame" size={14} />
      <Text
        style={{
          color: COLORS.coral,
          fontSize: FONT_SIZES.xs,
          fontWeight: FONT_WEIGHTS.semibold,
        }}>
        {count}
      </Text>
    </View>
  );
}

export function StreakCard({ streakCount, totalReflections }: StreakCardProps) {
  return (
    <Card variant="peach">
      <CardBody>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.md }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: 'rgba(212, 165, 116, 0.2)',
              borderRadius: 16,
              height: 48,
              justifyContent: 'center',
              width: 48,
            }}>
            <Ionicons color={COLORS.coral} name="flame-outline" size={24} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: COLORS.warmGray,
                fontSize: FONT_SIZES.sm,
                marginBottom: SPACING.xs,
              }}>
              Current Streak
            </Text>
            <Text
              style={{
                color: COLORS.softBrown,
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
              }}>
              {streakCount} day{streakCount === 1 ? '' : 's'}
            </Text>
          </View>

          <Badge size="sm" variant="coral">
            <BadgeLabel>{totalReflections} reflections</BadgeLabel>
          </Badge>
        </View>
      </CardBody>
    </Card>
  );
}
