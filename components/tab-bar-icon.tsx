import React from 'react';
import { View, type OpaqueColorValue } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import type { NavVariant } from '@/constants/nav-variants';

type TabBarIconProps = {
  name: IconSymbolName;
  color: string;
  size?: number;
  focused: boolean;
  variant: NavVariant;
};

export function TabBarIcon({ name, color, size = 28, focused, variant }: TabBarIconProps) {
  const iconColor: string | OpaqueColorValue = focused ? variant.focusedIconColor : color;
  const shellStyle = [variant.iconShellStyle, focused ? variant.iconShellFocusedStyle : variant.iconShellIdleStyle];

  return (
    <View style={shellStyle}>
      <IconSymbol name={name} size={size} color={iconColor} />
    </View>
  );
}
