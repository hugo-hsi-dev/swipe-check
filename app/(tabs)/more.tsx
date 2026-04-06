import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Button, ButtonIcon, ButtonLabel } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

export default function MoreScreen() {
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ??
    (Constants.expoConfig?.android?.versionCode != null
      ? String(Constants.expoConfig.android.versionCode)
      : 'Unknown');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.cream }}
      contentContainerStyle={{
        gap: SPACING.lg,
        padding: SPACING.xl,
        paddingTop: SPACING['3xl'],
        paddingBottom: SPACING['2xl'],
      }}>
      <Card>
        <CardBody gap="sm">
          <Text
            style={{
              fontSize: FONT_SIZES['2xl'],
              fontWeight: FONT_WEIGHTS.bold,
              color: COLORS.softBrown,
            }}>
            More
          </Text>
          <Text
            style={{
              fontSize: FONT_SIZES.base,
              color: COLORS.warmGray,
              lineHeight: FONT_SIZES.base * 1.5,
            }}>
            App information and additional features
          </Text>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Text
            style={{
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.softBrown,
            }}>
            Secondary Screens
          </Text>
        </CardHeader>
        <CardBody gap="sm">
          <Button variant="secondary" onPress={() => router.push('/journal')} style={{ alignSelf: 'stretch' }}>
            <ButtonIcon>
              <Ionicons name="book" size={20} color={COLORS.terracotta} />
            </ButtonIcon>
            <ButtonLabel variant="secondary">Journal</ButtonLabel>
          </Button>
          <Text
            style={{
              fontSize: FONT_SIZES.sm,
              color: COLORS.warmGray,
              lineHeight: FONT_SIZES.sm * 1.5,
            }}>
            View your history and past entries
          </Text>

          <Button variant="secondary" onPress={() => router.push('/settings')} style={{ alignSelf: 'stretch' }}>
            <ButtonIcon>
              <Ionicons name="settings" size={20} color={COLORS.terracotta} />
            </ButtonIcon>
            <ButtonLabel variant="secondary">Settings</ButtonLabel>
          </Button>
          <Text
            style={{
              fontSize: FONT_SIZES.sm,
              color: COLORS.warmGray,
              lineHeight: FONT_SIZES.sm * 1.5,
            }}>
            App information and local data controls
          </Text>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Text
            style={{
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.softBrown,
            }}>
            About
          </Text>
        </CardHeader>
        <CardBody gap="sm">
          <Text
            style={{
              fontSize: FONT_SIZES.base,
              color: COLORS.warmGray,
              lineHeight: FONT_SIZES.base * 1.5,
            }}>
            Swipe Check
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.warmGray }}>Version</Text>
            <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.softBrown }}>
              {Constants.expoConfig?.version ?? 'Unknown'}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.warmGray }}>Build</Text>
            <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.softBrown }}>{buildNumber}</Text>
          </View>
        </CardBody>
      </Card>
    </ScrollView>
  );
}
