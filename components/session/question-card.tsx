import { Text, View } from 'react-native';

import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

interface QuestionCardProps {
  prompt: string;
  categoryLabel?: string;
}

export function QuestionCard({ prompt, categoryLabel }: QuestionCardProps) {
  return (
    <Card variant="default">
      <CardBody gap="lg">
        {categoryLabel && (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: COLORS.terracottaLight,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.xs,
              borderRadius: 9999,
            }}>
            <Text
              style={{
                fontSize: FONT_SIZES.xs,
                fontWeight: FONT_WEIGHTS.semibold,
                color: COLORS.terracotta,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
              {categoryLabel}
            </Text>
          </View>
        )}
        <Text
          style={{
            fontSize: FONT_SIZES['2xl'],
            fontWeight: FONT_WEIGHTS.semibold,
            color: COLORS.softBrown,
            lineHeight: FONT_SIZES['2xl'] * 1.4,
            textAlign: 'center',
          }}>
          {prompt}
        </Text>
      </CardBody>
    </Card>
  );
}
