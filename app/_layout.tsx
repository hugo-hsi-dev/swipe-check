import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HeroUINativeProvider } from 'heroui-native';
import 'react-native-reanimated';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAppBootstrap } from '@/hooks/use-app-bootstrap';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useInitialRoute } from '@/hooks/use-initial-route';

import '@/global.css';

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

  if (isBootstrapping || isDeterminingRoute) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
        <Text className="mt-3 text-foreground">Loading app...</Text>
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
      <HeroUINativeProvider config={{ devInfo: { stylingPrinciples: false } }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
          <StatusBar style="auto" />
        </ThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
