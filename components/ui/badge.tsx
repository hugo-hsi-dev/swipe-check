import { type ReactNode } from 'react';
import { Text, type TextProps, View, type ViewProps } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

interface BadgeProps extends ViewProps {
  children: ReactNode;
  size?: BadgeSize;
  variant?: BadgeVariant;
}
type BadgeSize = 'md' | 'sm';

type BadgeVariant = 'coral' | 'default' | 'sage' | 'terracotta';

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  coral: {
    bg: 'rgba(212, 165, 116, 0.15)',
    text: COLORS.coral,
  },
  default: {
    bg: 'rgba(74, 66, 56, 0.08)',
    text: COLORS.softBrown,
  },
  sage: {
    bg: 'rgba(139, 154, 125, 0.15)',
    text: COLORS.sage,
  },
  terracotta: {
    bg: 'rgba(196, 164, 132, 0.15)',
    text: COLORS.terracotta,
  },
};

const sizeStyles: Record<BadgeSize, { fontSize: number; paddingHorizontal: number; paddingVertical: number; }> = {
  md: {
    fontSize: FONT_SIZES.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  sm: {
    fontSize: FONT_SIZES.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
};

interface BadgeLabelProps extends TextProps {
  children: ReactNode;
  size?: BadgeSize;
  variant?: BadgeVariant;
}

export function Badge({
  children,
  size = 'md',
  style,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: variantStyles[variant].bg,
          borderRadius: RADIUS.pill,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

export function BadgeLabel({
  children,
  size = 'md',
  style,
  variant = 'default',
  ...props
}: BadgeLabelProps) {
  return (
    <Text
      style={[
        {
          color: variantStyles[variant].text,
          fontSize: sizeStyles[size].fontSize,
          fontWeight: FONT_WEIGHTS.semibold,
        },
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
}
