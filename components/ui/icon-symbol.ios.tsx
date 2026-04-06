import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<IconSymbolName, ComponentProps<typeof MaterialIcons>['name']>;

type IconSymbolName =
  | 'book.fill'
  | 'calendar'
  | 'chart.bar.fill'
  | 'checkmark.circle.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right'
  | 'clock.fill'
  | 'ellipsis.circle.fill'
  | 'gearshape.fill'
  | 'house.fill'
  | 'paperplane.fill';

const MAPPING = {
  'book.fill': 'book',
  'calendar': 'calendar-today',
  'chart.bar.fill': 'bar-chart',
  'checkmark.circle.fill': 'check-circle',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'clock.fill': 'history',
  'ellipsis.circle.fill': 'more-horiz',
  'gearshape.fill': 'settings',
  'house.fill': 'home',
  'paperplane.fill': 'send',
} as IconMapping;

export function IconSymbol({
  color,
  name,
  size = 24,
  style,
}: {
  color: OpaqueColorValue | string;
  name: IconSymbolName;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  return <MaterialIcons color={color} name={MAPPING[name]} size={size} style={style} />;
}
