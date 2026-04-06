import { Text, View } from 'react-native';

import { Card, CardBody } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

interface QuestionCardProps {
  categoryLabel?: string;
  prompt: string;
}

export function QuestionCard({ categoryLabel, prompt }: QuestionCardProps) {
  return (
    <Card variant="default">
      <CardBody gap="lg">
        {categoryLabel && (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: COLORS.terracottaLight,
              borderRadius: 9999,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.xs,
            }}>
            <Text
              style={{
                color: COLORS.terracotta,
                fontSize: FONT_SIZES.xs,
                fontWeight: FONT_WEIGHTS.semibold,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}>
              {categoryLabel}
            </Text>
          </View>
        )}
        <Text
          style={{
            color: COLORS.softBrown,
            fontSize: FONT_SIZES['2xl'],
            fontWeight: FONT_WEIGHTS.semibold,
            lineHeight: FONT_SIZES['2xl'] * 1.4,
            textAlign: 'center',
          }}>
          {prompt}
        </Text>
      </CardBody>
    </Card>
  );
}
