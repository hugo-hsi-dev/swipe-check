import { type ReactNode } from 'react';
import {
  Pressable,
  type PressableStateCallbackType,
  type StyleProp,
  Text,
  type TextProps,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  RADIUS,
  SPACING,
} from '@/constants/design-system';

interface ButtonProps {
  children: ReactNode;
  isDisabled?: boolean;
  onPress?: () => void;
  size?: ButtonSize;
  style?: ((state: PressableStateCallbackType) => StyleProp<ViewStyle>) | StyleProp<ViewStyle>;
  testID?: string;
  variant?: ButtonVariant;
}
type ButtonSize = 'lg' | 'md' | 'sm';

type ButtonVariant = 'danger' | 'ghost' | 'primary' | 'secondary';

const variantStyles: Record<ButtonVariant, { bg: string; border?: string; text: string }> = {
  danger: {
    bg: COLORS.danger,
    text: '#FFFFFF',
  },
  ghost: {
    bg: 'transparent',
    text: COLORS.softBrown,
  },
  primary: {
    bg: COLORS.terracotta,
    text: '#FFFFFF',
  },
  secondary: {
    bg: COLORS.warmWhite,
    border: COLORS.terracottaLight,
    text: COLORS.terracotta,
  },
};

const sizeStyles: Record<ButtonSize, { fontSize: number; paddingHorizontal: number; paddingVertical: number; }> = {
  lg: {
    fontSize: FONT_SIZES.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  md: {
    fontSize: FONT_SIZES.base,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sm: {
    fontSize: FONT_SIZES.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
};

interface ButtonIconProps extends ViewProps {
  children: ReactNode;
}

interface ButtonLabelProps extends TextProps {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function Button({
  children,
  isDisabled = false,
  onPress,
  size = 'md',
  style,
  testID,
  variant = 'primary',
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={(state) => {
        const baseStyle: ViewStyle = {
          alignItems: 'center',
          backgroundColor: isDisabled ? COLORS.warmGray : variantStyle.bg,
          borderColor: variantStyle.border,
          borderRadius: RADIUS.md,
          borderWidth: variantStyle.border ? 1 : 0,
          flexDirection: 'row',
          gap: SPACING.sm,
          justifyContent: 'center',
          opacity: isDisabled ? 0.5 : 1,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        };
        if (typeof style === 'function') {
          const userStyle = style(state);
          return [baseStyle, userStyle];
        }
        return [baseStyle, style];
      }}
      testID={testID}>
      {children}
    </Pressable>
  );
}

export function ButtonIcon({ children, style, ...props }: ButtonIconProps) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}

export function ButtonLabel({
  children,
  size = 'md',
  style,
  variant = 'primary',
  ...props
}: ButtonLabelProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Text
      style={[
        {
          color: variantStyle.text,
          fontSize: sizeStyle.fontSize,
          fontWeight: FONT_WEIGHTS.semibold,
        },
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
}
