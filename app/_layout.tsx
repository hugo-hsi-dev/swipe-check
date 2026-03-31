import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HeroUINativeProvider } from 'heroui-native';
import 'react-native-reanimated';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAppBootstrap } from '@/hooks/use-app-bootstrap';
import { useColorScheme } from '@/hooks/use-color-scheme';
import '@/global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { bootstrapError, isBootstrapping } = useAppBootstrap();

  if (isBootstrapping) {
    return null;
  }

  if (bootstrapError) {
    return <Text>Failed to initialize local data.</Text>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider config={{ devInfo: { stylingPrinciples: false } }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Details' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
