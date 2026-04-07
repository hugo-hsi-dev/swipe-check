import { Pressable, Text, View } from 'react-native';

import { Badge, BadgeLabel } from '@/components/ui/badge';
import { AppIcon } from '@/components/ui/app-icon';
import { Avatar } from '@/components/ui/icon-container';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '@/constants/design-system';

interface JournalListItemProps {
  avatarText: string;
  id: string;
  onPress: (id: string) => void;
  subtitle: string;
  title: string;
  type: 'daily' | 'onboarding';
  typeLabel: string;
}

export function JournalListItem({
  avatarText,
  id,
  onPress,
  subtitle,
  title,
  type,
  typeLabel,
}: JournalListItemProps) {
  return (
    <Pressable
      onPress={() => onPress(id)}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: COLORS.warmWhite,
        borderRadius: RADIUS.lg,
        flexDirection: 'row',
        gap: SPACING.md,
        opacity: pressed ? 0.7 : 1,
        padding: SPACING.lg,
      })}>
      <Avatar size="md" variant={type === 'onboarding' ? 'terracotta' : 'sage'}>
        <Text
          style={{
            color: type === 'onboarding' ? COLORS.terracotta : COLORS.sage,
            fontSize: FONT_SIZES.sm,
            fontWeight: FONT_WEIGHTS.semibold,
          }}>
          {avatarText}
        </Text>
      </Avatar>

      <View style={{ flex: 1, gap: SPACING.xs }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: SPACING.sm }}>
          <Text
            style={{
              color: COLORS.softBrown,
              fontSize: FONT_SIZES.base,
              fontWeight: FONT_WEIGHTS.medium,
            }}>
            {title}
          </Text>
          <Badge size="sm" variant={type === 'onboarding' ? 'terracotta' : 'sage'}>
            <BadgeLabel>{typeLabel}</BadgeLabel>
          </Badge>
        </View>
        <Text
          style={{
            color: COLORS.warmGray,
            fontSize: FONT_SIZES.sm,
          }}>
          {subtitle}
        </Text>
      </View>

      <AppIcon color={COLORS.warmGray} name="chevron-forward" size={18} />
    </Pressable>
  );
}
