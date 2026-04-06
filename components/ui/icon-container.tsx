import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { COLORS, RADIUS } from '@/constants/design-system';

interface IconContainerProps extends ViewProps {
  children: ReactNode;
  size?: IconContainerSize;
  variant?: IconContainerVariant;
}
type IconContainerSize = 'lg' | 'md' | 'sm';

type IconContainerVariant = 'coral' | 'cream' | 'default' | 'sage' | 'terracotta';

const variantStyles: Record<IconContainerVariant, { bg: string }> = {
  coral: {
    bg: COLORS.coral,
  },
  cream: {
    bg: COLORS.cream,
  },
  default: {
    bg: COLORS.warmWhite,
  },
  sage: {
    bg: COLORS.sage,
  },
  terracotta: {
    bg: COLORS.terracotta,
  },
};

const sizeStyles: Record<IconContainerSize, { iconSize: number; radius: number; size: number; }> = {
  lg: {
    iconSize: 32,
    radius: RADIUS.xl,
    size: 64,
  },
  md: {
    iconSize: 28,
    radius: RADIUS.lg,
    size: 56,
  },
  sm: {
    iconSize: 20,
    radius: RADIUS.md,
    size: 40,
  },
};

// Avatar component for user/profile displays
interface AvatarProps extends ViewProps {
  children: ReactNode;
  size?: 'lg' | 'md' | 'sm';
  variant?: 'default' | 'sage' | 'terracotta';
}

// Helper for status icons with background colors
interface StatusIconProps extends Omit<IconContainerProps, 'variant'> {
  status: 'completed' | 'empty' | 'error' | 'inProgress' | 'success' | 'warning';
}

export function IconContainer({
  children,
  size = 'md',
  style,
  variant = 'default',
  ...props
}: IconContainerProps) {
  const variantStyle = variantStyles[variant];
  const sizeValue = sizeStyles[size];

  return (
    <View
      style={[
        {
          alignItems: 'center',
          backgroundColor: variantStyle.bg,
          borderRadius: sizeValue.radius,
          height: sizeValue.size,
          justifyContent: 'center',
          width: sizeValue.size,
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

export function StatusIcon({
  children,
  size = 'md',
  status,
  style,
  ...props
}: StatusIconProps) {
  const statusVariants: Record<StatusIconProps['status'], IconContainerVariant> = {
    completed: 'sage',
    empty: 'default',
    error: 'default',
    inProgress: 'terracotta',
    success: 'sage',
    warning: 'coral',
  };

  return (
    <IconContainer
      size={size}
      style={style}
      variant={statusVariants[status]}
      {...props}>
      {children}
    </IconContainer>
  );
}

const avatarSizes: Record<NonNullable<AvatarProps['size']>, number> = {
  lg: 56,
  md: 40,
  sm: 32,
};

export function Avatar({
  children,
  size = 'md',
  style,
  variant = 'default',
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
          alignItems: 'center',
          backgroundColor: bgColor,
          borderRadius: RADIUS.pill,
          height: avatarSize,
          justifyContent: 'center',
          width: avatarSize,
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}
