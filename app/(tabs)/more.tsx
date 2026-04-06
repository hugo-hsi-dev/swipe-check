import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { Button, ButtonIcon, ButtonLabel } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';
import { clearSQLiteData, exportUserData } from '@/lib/local-data/sqlite';

export default function MoreScreen() {
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ??
    (Constants.expoConfig?.android?.versionCode != null
      ? String(Constants.expoConfig.android.versionCode)
      : 'Unknown');

  const [showResetConfirmation, setShowResetConfirmation] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const isMounted = React.useRef(true);

  React.useEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

  async function handleExportData() {
    setIsExporting(true);
    try {
      const data = await exportUserData();
      const jsonString = JSON.stringify(data, null, 2);
      Alert.alert(
        'Data Exported',
        `Your data has been exported (${jsonString.length} characters). In a production app, this would be saved to a file or shared.`,
        [{ text: 'OK' }]
      );
    } catch (_error: unknown) {
      Alert.alert('Export Failed', 'Unable to export data. Please try again.');
    } finally {
      if (isMounted.current) {
        setIsExporting(false);
      }
    }
  }

  async function handleResetData() {
    setIsResetting(true);
    try {
      await clearSQLiteData();
      if (isMounted.current) {
        router.replace('/onboarding');
      }
    } catch (_error: unknown) {
      if (isMounted.current) {
        Alert.alert('Reset Failed', 'Unable to reset data. Please try again.');
        setIsResetting(false);
        setShowResetConfirmation(false);
      }
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{
        gap: SPACING.lg,
        padding: SPACING.xl,
        paddingBottom: SPACING['2xl'],
        paddingTop: SPACING['3xl'],
      }}
      style={{ backgroundColor: COLORS.cream, flex: 1 }}>
      <Card>
        <CardBody gap="sm">
          <Text
            style={{
              color: COLORS.softBrown,
              fontSize: FONT_SIZES['2xl'],
              fontWeight: FONT_WEIGHTS.bold,
            }}>
            More
          </Text>
          <Text
            style={{
              color: COLORS.warmGray,
              fontSize: FONT_SIZES.base,
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
              color: COLORS.softBrown,
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
            }}>
            Secondary Screens
          </Text>
        </CardHeader>
        <CardBody gap="sm">
          <Button onPress={() => router.push('/journal')} style={{ alignSelf: 'stretch' }} variant="secondary">
            <ButtonIcon>
              <Ionicons color={COLORS.terracotta} name="book" size={20} />
            </ButtonIcon>
            <ButtonLabel variant="secondary">Journal</ButtonLabel>
          </Button>
          <Text
            style={{
              color: COLORS.warmGray,
              fontSize: FONT_SIZES.sm,
              lineHeight: FONT_SIZES.sm * 1.5,
            }}>
            View your history and past entries
          </Text>

          <Button onPress={() => router.push('/settings')} style={{ alignSelf: 'stretch' }} variant="secondary">
            <ButtonIcon>
              <Ionicons color={COLORS.terracotta} name="settings" size={20} />
            </ButtonIcon>
            <ButtonLabel variant="secondary">Settings</ButtonLabel>
          </Button>
          <Text
            style={{
              color: COLORS.warmGray,
              fontSize: FONT_SIZES.sm,
              lineHeight: FONT_SIZES.sm * 1.5,
            }}>
            App information and local data controls
          </Text>
        </CardBody>
      </Card>

      <Card variant="default">
        <CardHeader>
          <Text
            style={{
              color: COLORS.softBrown,
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
            }}>
            Data Management
          </Text>
        </CardHeader>
        <CardBody gap="sm">
          {!showResetConfirmation ? (
            <>
              <Button
                isDisabled={isExporting}
                onPress={handleExportData}
                style={{ alignSelf: 'stretch' }}
                variant="secondary">
                <ButtonIcon>
                  <Ionicons color={COLORS.terracotta} name="download-outline" size={20} />
                </ButtonIcon>
                <ButtonLabel variant="secondary">{isExporting ? 'Exporting...' : 'Export My Data'}</ButtonLabel>
              </Button>
              <Text
                style={{
                  color: COLORS.warmGray,
                  fontSize: FONT_SIZES.sm,
                  lineHeight: FONT_SIZES.sm * 1.5,
                }}>
                Download a copy of all your app data
              </Text>

              <Button
                isDisabled={isResetting}
                onPress={() => setShowResetConfirmation(true)}
                style={{ alignSelf: 'stretch', marginTop: SPACING.sm }}
                variant="danger">
                <ButtonIcon>
                  <Ionicons color="#FFFFFF" name="trash-outline" size={18} />
                </ButtonIcon>
                <ButtonLabel variant="danger">Reset All Data</ButtonLabel>
              </Button>
              <Text
                style={{
                  color: COLORS.warmGray,
                  fontSize: FONT_SIZES.sm,
                  lineHeight: FONT_SIZES.sm * 1.5,
                }}>
                Permanently delete all data and start fresh
              </Text>
            </>
          ) : (
            <>
              <View style={{ alignItems: 'center', gap: SPACING.md, paddingBottom: SPACING.sm }}>
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: COLORS.cream,
                    borderRadius: 9999,
                    height: 64,
                    justifyContent: 'center',
                    width: 64,
                  }}>
                  <Ionicons color={COLORS.danger} name="warning-outline" size={28} />
                </View>
                <Text
                  style={{
                    color: COLORS.danger,
                    fontSize: FONT_SIZES.lg,
                    fontWeight: FONT_WEIGHTS.semibold,
                    textAlign: 'center',
                  }}>
                  Are you sure?
                </Text>
                <Text
                  style={{
                    color: COLORS.warmGray,
                    fontSize: FONT_SIZES.sm,
                    lineHeight: FONT_SIZES.sm * 1.5,
                    textAlign: 'center',
                  }}>
                  This will permanently delete all your local data. The app will return to its first-launch state.
                </Text>
              </View>
              <Button isDisabled={isResetting} onPress={handleResetData} variant="danger">
                <Ionicons color="#FFFFFF" name="trash-outline" size={18} />
                <ButtonLabel variant="danger">
                  {isResetting ? 'Deleting...' : 'Yes, Delete All Data'}
                </ButtonLabel>
              </Button>
              <Button
                isDisabled={isResetting}
                onPress={() => {
                  setShowResetConfirmation(false);
                }}
                variant="secondary">
                <ButtonLabel variant="secondary">Cancel</ButtonLabel>
              </Button>
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <Text
            style={{
              color: COLORS.softBrown,
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
            }}>
            About
          </Text>
        </CardHeader>
        <CardBody gap="sm">
          <Text
            style={{
              color: COLORS.warmGray,
              fontSize: FONT_SIZES.base,
              lineHeight: FONT_SIZES.base * 1.5,
            }}>
            Swipe Check
          </Text>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.base }}>Version</Text>
            <Text style={{ color: COLORS.softBrown, fontSize: FONT_SIZES.base }}>
              {Constants.expoConfig?.version ?? 'Unknown'}
            </Text>
          </View>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text style={{ color: COLORS.warmGray, fontSize: FONT_SIZES.base }}>Build</Text>
            <Text style={{ color: COLORS.softBrown, fontSize: FONT_SIZES.base }}>{buildNumber}</Text>
          </View>
        </CardBody>
      </Card>
    </ScrollView>
  );
}
