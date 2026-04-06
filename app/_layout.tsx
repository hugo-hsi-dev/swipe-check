import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAppBootstrap } from '@/hooks/use-app-bootstrap';
import { useInitialRoute } from '@/hooks/use-initial-route';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/design-system';
import { NavVariantProvider } from '@/contexts/NavVariantContext';

import '@/global.css';

const ORGANIC_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.cream,
    border: COLORS.borderLight,
    card: COLORS.warmWhite,
    notification: COLORS.sage,
    primary: COLORS.terracotta,
    text: COLORS.softBrown,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const pathname = usePathname();
  const { bootstrapError, isBootstrapping } = useAppBootstrap(pathname);
  const { preview } = useGlobalSearchParams<{ preview?: string }>();
  const { evaluatedPathname, isDeterminingRoute, routeError, targetRoute } = useInitialRoute(pathname);
  const isOnboardingPreview = preview === '1';

  if (isBootstrapping || isDeterminingRoute) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.cream,
        }}>
        <ActivityIndicator color={COLORS.terracotta} />
        <Text
          style={{
            marginTop: SPACING.md,
            fontSize: FONT_SIZES.base,
            color: COLORS.softBrown,
          }}>
          Loading app...
        </Text>
      </View>
    );
  }

  if (bootstrapError || routeError) {
    return <Text>Failed to initialize app.</Text>;
  }

  const isRouteDecisionCurrent = evaluatedPathname === pathname;

  if (isRouteDecisionCurrent && targetRoute === 'onboarding' && pathname !== '/onboarding') {
    return <Redirect href="/onboarding" />;
  }

  if (isRouteDecisionCurrent && targetRoute === 'tabs' && pathname === '/onboarding' && !isOnboardingPreview) {
    return <Redirect href="/today" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={ORGANIC_THEME}>
        <NavVariantProvider>
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="session" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen
              name="journal/[id]"
              options={{
                presentation: 'card',
                headerShown: true,
              }}
            />
          </Stack>
          <StatusBar style="dark" />
        </NavVariantProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
