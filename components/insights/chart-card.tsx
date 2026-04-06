import { Text, View } from 'react-native';

import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

interface AxisBarProps {
  axisId: string;
  poleA: { id: string; label: string };
  poleB: { id: string; label: string };
  strength: number;
  dominantPoleId: string | null;
}

export function AxisBar({ axisId, poleA, poleB, strength, dominantPoleId }: AxisBarProps) {
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
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.medium,
            color: COLORS.softBrown,
          }}>
          {poleA.label}
        </Text>
        <Text
          style={{
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.medium,
            color: COLORS.softBrown,
          }}>
          {poleB.label}
        </Text>
      </View>

      <View
        style={{
          height: 12,
          backgroundColor: COLORS.sageLight,
          borderRadius: RADIUS.pill,
          overflow: 'hidden',
        }}
        testID={`axis-bar-${axisId}`}>
        {isTied ? (
          <View
            style={{
              width: '50%',
              height: '100%',
              backgroundColor: COLORS.warmGray,
              borderRadius: RADIUS.pill,
              alignSelf: 'center',
            }}
            testID={`axis-fill-${axisId}`}
          />
        ) : (
          <View
            style={{
              width: `${dominancePercent}%`,
              height: '100%',
              backgroundColor: COLORS.terracotta,
              borderRadius: RADIUS.pill,
              alignSelf: isPoleBDominant ? 'flex-start' : 'flex-end',
            }}
            testID={`axis-fill-${axisId}`}
          />
        )}
      </View>

      <Text
        style={{
          fontSize: FONT_SIZES.sm,
          color: COLORS.warmGray,
          textAlign: 'center',
        }}>
        {dominanceText}
      </Text>
    </View>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <Text
          style={{
            fontSize: FONT_SIZES.xl,
            fontWeight: FONT_WEIGHTS.semibold,
            color: COLORS.softBrown,
          }}>
          {title}
        </Text>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}
