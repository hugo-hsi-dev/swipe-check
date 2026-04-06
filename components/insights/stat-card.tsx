import { Text, View } from 'react-native';

import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

interface StatCardProps {
  label: string;
  value: string;
  variant?: 'default' | 'peach' | 'sage' | 'terracotta';
}

interface StatRowProps {
  stats: { label: string; value: string; }[];
}

export function StatCard({ label, value, variant = 'default' }: StatCardProps) {
  return (
    <Card variant={variant}>
      <CardBody>
        <View style={{ alignItems: 'center', gap: SPACING.xs }}>
          <Text
            style={{
              color: COLORS.softBrown,
              fontSize: FONT_SIZES['3xl'],
              fontWeight: FONT_WEIGHTS.bold,
            }}>
            {value}
          </Text>
          <Text
            style={{
              color: COLORS.warmGray,
              fontSize: FONT_SIZES.sm,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
            {label}
          </Text>
        </View>
      </CardBody>
    </Card>
  );
}

export function StatRow({ stats }: StatRowProps) {
  return (
    <View style={{ flexDirection: 'row', gap: SPACING.md }}>
      {stats.map((stat, index) => (
        <View key={`${stat.label}-${index}`} style={{ flex: 1 }}>
          <StatCard
            label={stat.label}
            value={stat.value}
            variant={index === 0 ? 'sage' : index === 1 ? 'terracotta' : 'peach'}
          />
        </View>
      ))}
    </View>
  );
}
