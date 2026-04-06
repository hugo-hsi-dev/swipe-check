import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { NAV_VARIANTS } from '@/constants/nav-variants';
import { useNavVariant } from '@/contexts/NavVariantContext';

type TabBarIconProps = {
  name: IconSymbolName;
  color: string;
  size?: number;
  focused: boolean;
};

export function TabBarIcon({ name, color, size = 28, focused }: TabBarIconProps) {
  const { activeVariant } = useNavVariant();
  const variant = NAV_VARIANTS[activeVariant];

  const shellStyle: ViewStyle = {
    ...variant.iconShellStyle,
    ...(focused ? variant.iconShellFocusedStyle : variant.iconShellIdleStyle),
  };

  // For variants with transparent idle state, use the passed color
  // For focused state, determine icon color based on variant
  const iconColor = focused
    ? activeVariant === 'C'
      ? '#FFFFFF' // White icon on terracotta background for variant C
      : activeVariant === 'B'
        ? color // Use tint color for variant B
        : activeVariant === 'A'
          ? color // Use tint color for variant A
          : color
    : color;

  return (
    <View style={shellStyle}>
      <IconSymbol name={name} size={size} color={iconColor} />
    </View>
  );
}
