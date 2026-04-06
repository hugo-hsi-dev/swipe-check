import { Text, View } from 'react-native';

import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

interface StatCardProps {
  value: string;
  label: string;
  variant?: 'default' | 'sage' | 'terracotta' | 'peach';
}

export function StatCard({ value, label, variant = 'default' }: StatCardProps) {
  return (
    <Card variant={variant}>
      <CardBody>
        <View style={{ alignItems: 'center', gap: SPACING.xs }}>
          <Text
            style={{
              fontSize: FONT_SIZES['3xl'],
              fontWeight: FONT_WEIGHTS.bold,
              color: COLORS.softBrown,
            }}>
            {value}
          </Text>
          <Text
            style={{
              fontSize: FONT_SIZES.sm,
              color: COLORS.warmGray,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
            {label}
          </Text>
        </View>
      </CardBody>
    </Card>
  );
}

interface StatRowProps {
  stats: { value: string; label: string }[];
}

export function StatRow({ stats }: StatRowProps) {
  return (
    <View style={{ flexDirection: 'row', gap: SPACING.md }}>
      {stats.map((stat, index) => (
        <View key={`${stat.label}-${index}`} style={{ flex: 1 }}>
          <StatCard
            value={stat.value}
            label={stat.label}
            variant={index === 0 ? 'sage' : index === 1 ? 'terracotta' : 'peach'}
          />
        </View>
      ))}
    </View>
  );
}
