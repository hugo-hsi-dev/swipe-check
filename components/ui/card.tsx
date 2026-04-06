import { type ReactNode } from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';

import { COLORS, RADIUS, SPACING } from '@/constants/design-system';

type CardVariant = 'default' | 'sage' | 'terracotta' | 'peach' | 'header';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: keyof typeof SPACING;
}

const variantStyles: Record<CardVariant, ViewStyle> = {
  default: {
    backgroundColor: COLORS.warmWhite,
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
  peach: {
    backgroundColor: COLORS.peach,
    borderRadius: RADIUS.xl,
  },
  header: {
    backgroundColor: COLORS.warmWhite,
    borderRadius: RADIUS['2xl'],
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
  },
};

export function Card({
  children,
  variant = 'default',
  padding = '2xl',
  style,
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

interface CardHeaderProps extends ViewProps {
  children: ReactNode;
}

export function CardHeader({ children, style, ...props }: CardHeaderProps) {
  return (
    <View style={[{ marginBottom: SPACING.md }, style]} {...props}>
      {children}
    </View>
  );
}

interface CardTitleProps extends ViewProps {
  children: ReactNode;
}

export function CardTitle({ children, style, ...props }: CardTitleProps) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

interface CardBodyProps extends ViewProps {
  children: ReactNode;
  gap?: keyof typeof SPACING;
}

export function CardBody({ children, gap = 'md', style, ...props }: CardBodyProps) {
  return (
    <View style={[{ gap: SPACING[gap] }, style]} {...props}>
      {children}
    </View>
  );
}

interface CardFooterProps extends ViewProps {
  children: ReactNode;
}

export function CardFooter({ children, style, ...props }: CardFooterProps) {
  return (
    <View style={[{ marginTop: SPACING.md }, style]} {...props}>
      {children}
    </View>
  );
}
