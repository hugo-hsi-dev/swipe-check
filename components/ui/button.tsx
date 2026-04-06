import { type ReactNode } from 'react';
import {
  Pressable,
  Text,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type TextProps,
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

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isDisabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  testID?: string;
}

const variantStyles: Record<ButtonVariant, { bg: string; border?: string; text: string }> = {
  primary: {
    bg: COLORS.terracotta,
    text: '#FFFFFF',
  },
  secondary: {
    bg: COLORS.warmWhite,
    border: COLORS.terracottaLight,
    text: COLORS.terracotta,
  },
  ghost: {
    bg: 'transparent',
    text: COLORS.softBrown,
  },
  danger: {
    bg: COLORS.danger,
    text: '#FFFFFF',
  },
};

const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.sm,
  },
  md: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZES.base,
  },
  lg: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    fontSize: FONT_SIZES.lg,
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isDisabled = false,
  onPress,
  style,
  testID,
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={(state) => {
        const baseStyle: ViewStyle = {
          backgroundColor: isDisabled ? COLORS.warmGray : variantStyle.bg,
          borderRadius: RADIUS.md,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderWidth: variantStyle.border ? 1 : 0,
          borderColor: variantStyle.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: SPACING.sm,
          opacity: isDisabled ? 0.5 : 1,
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

interface ButtonLabelProps extends TextProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonLabel({
  children,
  variant = 'primary',
  size = 'md',
  style,
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

interface ButtonIconProps extends ViewProps {
  children: ReactNode;
}

export function ButtonIcon({ children, style, ...props }: ButtonIconProps) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}
