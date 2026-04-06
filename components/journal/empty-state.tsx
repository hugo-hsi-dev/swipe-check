import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Card>
      <CardBody>
        <View style={{ alignItems: 'center', gap: SPACING.lg, paddingVertical: SPACING['3xl'] }}>
          <View
            style={{
              width: 64,
              height: 64,
              backgroundColor: COLORS.cream,
              borderRadius: RADIUS.xl,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Ionicons name={icon} size={28} color={COLORS.softBrown} />
          </View>
          <View style={{ alignItems: 'center', gap: SPACING.sm }}>
            <Text
              style={{
                fontSize: FONT_SIZES.xl,
                fontWeight: FONT_WEIGHTS.semibold,
                color: COLORS.softBrown,
                textAlign: 'center',
              }}>
              {title}
            </Text>
            <Text
              style={{
                fontSize: FONT_SIZES.base,
                color: COLORS.warmGray,
                textAlign: 'center',
                maxWidth: 280,
                lineHeight: FONT_SIZES.base * 1.5,
              }}>
              {description}
            </Text>
          </View>
        </View>
      </CardBody>
    </Card>
  );
}
