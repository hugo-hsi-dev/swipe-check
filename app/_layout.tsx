import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/design-system';
import { useAppBootstrap } from '@/hooks/use-app-bootstrap';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInitialRoute } from '@/hooks/use-initial-route';
import '@/global.css';

const ORGANIC_LIGHT_THEME = {
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
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const { bootstrapError, isBootstrapping } = useAppBootstrap(pathname);
  const { preview } = useGlobalSearchParams<{ preview?: string }>();
  const { evaluatedPathname, isDeterminingRoute, routeError, targetRoute } = useInitialRoute(pathname);
  const isOnboardingPreview = preview === '1';
  const isDark = colorScheme === 'dark';

  if (isBootstrapping || isDeterminingRoute) {
    return (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: COLORS.cream,
          flex: 1,
          justifyContent: 'center',
        }}>
        <ActivityIndicator color={COLORS.terracotta} />
        <Text
          style={{
            color: COLORS.softBrown,
            fontSize: FONT_SIZES.base,
            marginTop: SPACING.md,
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
      <ThemeProvider value={isDark ? DarkTheme : ORGANIC_LIGHT_THEME}>
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="session" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          <Stack.Screen
            name="journal/[id]"
            options={{
              headerShown: true,
              presentation: 'card',
            }}
          />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
