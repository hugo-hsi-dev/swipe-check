import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

interface EmptyStateProps {
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}

export function EmptyState({ description, icon, title }: EmptyStateProps) {
  return (
    <Card>
      <CardBody>
        <View style={{ alignItems: 'center', gap: SPACING.lg, paddingVertical: SPACING['3xl'] }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: COLORS.cream,
              borderRadius: RADIUS.xl,
              height: 64,
              justifyContent: 'center',
              width: 64,
            }}>
            <Ionicons color={COLORS.softBrown} name={icon} size={28} />
          </View>
          <View style={{ alignItems: 'center', gap: SPACING.sm }}>
            <Text
              style={{
                color: COLORS.softBrown,
                fontSize: FONT_SIZES.xl,
                fontWeight: FONT_WEIGHTS.semibold,
                textAlign: 'center',
              }}>
              {title}
            </Text>
            <Text
              style={{
                color: COLORS.warmGray,
                fontSize: FONT_SIZES.base,
                lineHeight: FONT_SIZES.base * 1.5,
                maxWidth: 280,
                textAlign: 'center',
              }}>
              {description}
            </Text>
          </View>
        </View>
      </CardBody>
    </Card>
  );
}
