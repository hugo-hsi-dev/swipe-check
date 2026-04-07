import { Text, View } from 'react-native';

import { Badge, BadgeLabel } from '@/components/ui/badge';
import { AppIcon } from '@/components/ui/app-icon';
import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

interface TypeCardProps {
  currentType: null | string;
  isLoading?: boolean;
}

export function TypeCard({ currentType, isLoading = false }: TypeCardProps) {
  if (isLoading) {
    return (
      <Card variant="sage">
        <CardBody>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.md }}>
            <View
              style={{
                backgroundColor: 'rgba(139, 154, 125, 0.2)',
                borderRadius: 16,
                height: 48,
                width: 48,
              }}
            />
            <View style={{ gap: SPACING.sm }}>
              <View
                style={{
                  backgroundColor: 'rgba(139, 154, 125, 0.2)',
                  borderRadius: 4,
                  height: 16,
                  width: 80,
                }}
              />
              <View
                style={{
                  backgroundColor: 'rgba(139, 154, 125, 0.15)',
                  borderRadius: 4,
                  height: 12,
                  width: 120,
                }}
              />
            </View>
          </View>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card variant="sage">
      <CardBody>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.md }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: 'rgba(139, 154, 125, 0.2)',
              borderRadius: 16,
              height: 48,
              justifyContent: 'center',
              width: 48,
            }}>
            <AppIcon color={COLORS.sage} name="person-outline" size={24} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: COLORS.warmGray,
                fontSize: FONT_SIZES.sm,
                marginBottom: SPACING.xs,
              }}>
              Current Type
            </Text>
            <Text
              style={{
                color: COLORS.softBrown,
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
              }}>
              {currentType ?? 'Unknown'}
            </Text>
          </View>

          {currentType && (
            <Badge size="sm" variant="sage">
              <BadgeLabel>Active</BadgeLabel>
            </Badge>
          )}
        </View>
      </CardBody>
    </Card>
  );
}
