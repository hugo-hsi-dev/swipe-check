import { type ReactNode } from 'react';
import { Text, View, type TextProps, type ViewProps } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

type BadgeVariant = 'default' | 'sage' | 'terracotta' | 'coral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends ViewProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
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
  coral: {
    bg: 'rgba(212, 165, 116, 0.15)',
    text: COLORS.coral,
  },
};

const sizeStyles: Record<BadgeSize, { paddingHorizontal: number; paddingVertical: number; fontSize: number }> = {
  sm: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    fontSize: FONT_SIZES.xs,
  },
  md: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.sm,
  },
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
  ...props
}: BadgeProps) {
  return (
    <View
      style={[
        {
          backgroundColor: variantStyles[variant].bg,
          borderRadius: RADIUS.pill,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
          alignSelf: 'flex-start',
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

interface BadgeLabelProps extends TextProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

export function BadgeLabel({
  children,
  variant = 'default',
  size = 'md',
  style,
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
