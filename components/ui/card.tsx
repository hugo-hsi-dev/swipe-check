import { type ReactNode } from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/constants/design-system';

interface CardProps extends ViewProps {
  children: ReactNode;
  padding?: keyof typeof SPACING;
  variant?: CardVariant;
}

type CardVariant = 'default' | 'header' | 'peach' | 'sage' | 'terracotta';

const variantStyles: Record<CardVariant, ViewStyle> = {
  default: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS.xl,
  },
  header: {
    backgroundColor: COLORS.warmWhite,
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
    borderRadius: RADIUS['2xl'],
  },
  peach: {
    backgroundColor: COLORS.peach,
    borderRadius: RADIUS.xl,
  },
  sage: {
    backgroundColor: COLORS.sageLight,
    borderRadius: RADIUS.xl,
  },
  terracotta: {
    backgroundColor: COLORS.terracottaLight,
    borderRadius: RADIUS.xl,
  },
};

interface CardBodyProps extends ViewProps {
  children: ReactNode;
  gap?: keyof typeof SPACING;
}

interface CardFooterProps extends ViewProps {
  children: ReactNode;
}

interface CardHeaderProps extends ViewProps {
  children: ReactNode;
}

interface CardTitleProps extends ViewProps {
  children: ReactNode;
}

export function Card({
  children,
  padding = '2xl',
  style,
  variant = 'default',
  ...props
}: CardProps) {
  return (
    <View
      style={[
        variantStyles[variant],
        { padding: SPACING[padding] },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

export function CardBody({ children, gap = 'md', style, ...props }: CardBodyProps) {
  return (
    <View style={[{ gap: SPACING[gap] }, style]} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style, ...props }: CardFooterProps) {
  return (
    <View style={[{ marginTop: SPACING.md }, style]} {...props}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style, ...props }: CardHeaderProps) {
  return (
    <View style={[{ marginBottom: SPACING.md }, style]} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ children, style, ...props }: CardTitleProps) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}
