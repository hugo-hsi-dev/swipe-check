import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { COLORS, RADIUS } from '@/constants/design-system';

type IconContainerVariant = 'default' | 'sage' | 'terracotta' | 'coral' | 'cream';
type IconContainerSize = 'sm' | 'md' | 'lg';

interface IconContainerProps extends ViewProps {
  children: ReactNode;
  variant?: IconContainerVariant;
  size?: IconContainerSize;
}

const variantStyles: Record<IconContainerVariant, { bg: string }> = {
  default: {
    bg: COLORS.warmWhite,
  },
  sage: {
    bg: COLORS.sage,
  },
  terracotta: {
    bg: COLORS.terracotta,
  },
  coral: {
    bg: COLORS.coral,
  },
  cream: {
    bg: COLORS.cream,
  },
};

const sizeStyles: Record<IconContainerSize, { size: number; iconSize: number; radius: number }> = {
  sm: {
    size: 40,
    iconSize: 20,
    radius: RADIUS.md,
  },
  md: {
    size: 56,
    iconSize: 28,
    radius: RADIUS.lg,
  },
  lg: {
    size: 64,
    iconSize: 32,
    radius: RADIUS.xl,
  },
};

export function IconContainer({
  children,
  variant = 'default',
  size = 'md',
  style,
  ...props
}: IconContainerProps) {
  const variantStyle = variantStyles[variant];
  const sizeValue = sizeStyles[size];

  return (
    <View
      style={[
        {
          width: sizeValue.size,
          height: sizeValue.size,
          backgroundColor: variantStyle.bg,
          borderRadius: sizeValue.radius,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

// Helper for status icons with background colors
interface StatusIconProps extends Omit<IconContainerProps, 'variant'> {
  status: 'completed' | 'inProgress' | 'empty' | 'success' | 'warning' | 'error';
}

export function StatusIcon({
  children,
  status,
  size = 'md',
  style,
  ...props
}: StatusIconProps) {
  const statusVariants: Record<StatusIconProps['status'], IconContainerVariant> = {
    completed: 'sage',
    inProgress: 'terracotta',
    empty: 'default',
    success: 'sage',
    warning: 'coral',
    error: 'default',
  };

  return (
    <IconContainer
      variant={statusVariants[status]}
      size={size}
      style={style}
      {...props}>
      {children}
    </IconContainer>
  );
}

// Avatar component for user/profile displays
interface AvatarProps extends ViewProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'sage' | 'terracotta';
}

const avatarSizes: Record<NonNullable<AvatarProps['size']>, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

export function Avatar({
  children,
  size = 'md',
  variant = 'default',
  style,
  ...props
}: AvatarProps) {
  const avatarSize = avatarSizes[size];
  const bgColor = variant === 'sage'
    ? 'rgba(139, 154, 125, 0.15)'
    : variant === 'terracotta'
      ? 'rgba(196, 164, 132, 0.15)'
      : COLORS.warmWhite;

  return (
    <View
      style={[
        {
          width: avatarSize,
          height: avatarSize,
          backgroundColor: bgColor,
          borderRadius: RADIUS.pill,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}
