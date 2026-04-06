import { Text, View } from 'react-native';

import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

interface AxisBarProps {
  axisId: string;
  dominantPoleId: null | string;
  poleA: { id: string; label: string };
  poleB: { id: string; label: string };
  strength: number;
}

interface ChartCardProps {
  children: React.ReactNode;
  title: string;
}

export function AxisBar({ axisId, dominantPoleId, poleA, poleB, strength }: AxisBarProps) {
  const dominancePercent = Math.round(Math.abs(strength) * 100);
  const isTied = dominantPoleId === null;
  const isPoleBDominant = dominantPoleId === poleB.id;

  const dominanceText = isTied
    ? 'Balanced'
    : dominantPoleId === poleA.id
      ? `${poleA.label} (${dominancePercent}%)`
      : `${poleB.label} (${dominancePercent}%)`;

  return (
    <View style={{ gap: SPACING.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          style={{
            color: COLORS.softBrown,
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.medium,
          }}>
          {poleA.label}
        </Text>
        <Text
          style={{
            color: COLORS.softBrown,
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.medium,
          }}>
          {poleB.label}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: COLORS.sageLight,
          borderRadius: RADIUS.pill,
          height: 12,
          overflow: 'hidden',
        }}
        testID={`axis-bar-${axisId}`}>
        {isTied ? (
          <View
            style={{
              alignSelf: 'center',
              backgroundColor: COLORS.warmGray,
              borderRadius: RADIUS.pill,
              height: '100%',
              width: '50%',
            }}
            testID={`axis-fill-${axisId}`}
          />
        ) : (
          <View
            style={{
              alignSelf: isPoleBDominant ? 'flex-start' : 'flex-end',
              backgroundColor: COLORS.terracotta,
              borderRadius: RADIUS.pill,
              height: '100%',
              width: `${dominancePercent}%`,
            }}
            testID={`axis-fill-${axisId}`}
          />
        )}
      </View>

      <Text
        style={{
          color: COLORS.warmGray,
          fontSize: FONT_SIZES.sm,
          textAlign: 'center',
        }}>
        {dominanceText}
      </Text>
    </View>
  );
}

export function ChartCard({ children, title }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <Text
          style={{
            color: COLORS.softBrown,
            fontSize: FONT_SIZES.xl,
            fontWeight: FONT_WEIGHTS.semibold,
          }}>
          {title}
        </Text>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}
