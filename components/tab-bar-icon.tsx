import React from 'react';
import { type OpaqueColorValue, View } from 'react-native';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { getNavVariant } from '@/constants/nav-variants';

type TabBarIconProps = {
  color: string;
  focused: boolean;
  name: IconSymbolName;
  size?: number;
};

export function TabBarIcon({ color, focused, name, size = 28 }: TabBarIconProps) {
  const variant = getNavVariant();
  const iconColor: OpaqueColorValue | string = focused ? variant.focusedIconColor : color;
  const shellStyle = [variant.iconShellStyle, focused ? variant.iconShellFocusedStyle : variant.iconShellIdleStyle];

  return (
    <View style={shellStyle}>
      <IconSymbol color={iconColor} name={name} size={size} />
    </View>
  );
}
