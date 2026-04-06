import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Card, CardBody } from '@/components/ui/card';
import { Badge, BadgeLabel } from '@/components/ui/badge';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

interface TypeCardProps {
  currentType: string | null;
  isLoading?: boolean;
}

export function TypeCard({ currentType, isLoading = false }: TypeCardProps) {
  if (isLoading) {
    return (
      <Card variant="sage">
        <CardBody>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
            <View
              style={{
                width: 48,
                height: 48,
                backgroundColor: 'rgba(139, 154, 125, 0.2)',
                borderRadius: 16,
              }}
            />
            <View style={{ gap: SPACING.sm }}>
              <View
                style={{
                  width: 80,
                  height: 16,
                  backgroundColor: 'rgba(139, 154, 125, 0.2)',
                  borderRadius: 4,
                }}
              />
              <View
                style={{
                  width: 120,
                  height: 12,
                  backgroundColor: 'rgba(139, 154, 125, 0.15)',
                  borderRadius: 4,
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md }}>
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: 'rgba(139, 154, 125, 0.2)',
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name="person-outline" size={24} color={COLORS.sage} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: FONT_SIZES.sm,
                color: COLORS.warmGray,
                marginBottom: SPACING.xs,
              }}>
              Current Type
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES['2xl'],
                fontWeight: FONT_WEIGHTS.bold,
                color: COLORS.softBrown,
              }}>
              {currentType ?? 'Unknown'}
            </Text>
          </View>

          {currentType && (
            <Badge variant="sage" size="sm">
              <BadgeLabel>Active</BadgeLabel>
            </Badge>
          )}
        </View>
      </CardBody>
    </Card>
  );
}
