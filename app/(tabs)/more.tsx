import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';

import { Button, ButtonIcon, ButtonLabel } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { clearSQLiteData, exportUserData } from '@/lib/local-data/sqlite';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '@/constants/design-system';

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
    } catch {
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
    } catch {
      if (isMounted.current) {
        Alert.alert('Reset Failed', 'Unable to reset data. Please try again.');
        setIsResetting(false);
        setShowResetConfirmation(false);
      }
    }
  }

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

      <Card variant="default">
        <CardHeader>
          <Text
            style={{
              fontSize: FONT_SIZES.xl,
              fontWeight: FONT_WEIGHTS.semibold,
              color: COLORS.softBrown,
            }}>
            Data Management
          </Text>
        </CardHeader>
        <CardBody gap="sm">
          {!showResetConfirmation ? (
            <>
              <Button
                variant="secondary"
                onPress={handleExportData}
                isDisabled={isExporting}
                style={{ alignSelf: 'stretch' }}>
                <ButtonIcon>
                  <Ionicons name="download-outline" size={20} color={COLORS.terracotta} />
                </ButtonIcon>
                <ButtonLabel variant="secondary">{isExporting ? 'Exporting...' : 'Export My Data'}</ButtonLabel>
              </Button>
              <Text
                style={{
                  fontSize: FONT_SIZES.sm,
                  color: COLORS.warmGray,
                  lineHeight: FONT_SIZES.sm * 1.5,
                }}>
                Download a copy of all your app data
              </Text>

              <Button
                variant="danger"
                onPress={() => setShowResetConfirmation(true)}
                isDisabled={isResetting}
                style={{ alignSelf: 'stretch', marginTop: SPACING.sm }}>
                <ButtonIcon>
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                </ButtonIcon>
                <ButtonLabel variant="danger">Reset All Data</ButtonLabel>
              </Button>
              <Text
                style={{
                  fontSize: FONT_SIZES.sm,
                  color: COLORS.warmGray,
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
                    width: 64,
                    height: 64,
                    backgroundColor: COLORS.cream,
                    borderRadius: 9999,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Ionicons name="warning-outline" size={28} color={COLORS.danger} />
                </View>
                <Text
                  style={{
                    fontSize: FONT_SIZES.lg,
                    fontWeight: FONT_WEIGHTS.semibold,
                    textAlign: 'center',
                    color: COLORS.danger,
                  }}>
                  Are you sure?
                </Text>
                <Text
                  style={{
                    fontSize: FONT_SIZES.sm,
                    color: COLORS.warmGray,
                    textAlign: 'center',
                    lineHeight: FONT_SIZES.sm * 1.5,
                  }}>
                  This will permanently delete all your local data. The app will return to its first-launch state.
                </Text>
              </View>
              <Button variant="danger" onPress={handleResetData} isDisabled={isResetting}>
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                <ButtonLabel variant="danger">
                  {isResetting ? 'Deleting...' : 'Yes, Delete All Data'}
                </ButtonLabel>
              </Button>
              <Button
                variant="secondary"
                onPress={() => {
                  setShowResetConfirmation(false);
                }}
                isDisabled={isResetting}>
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