import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { loadToken } from '@/lib/api';
import { usePalette } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const scheme = useColorScheme();
  const c = usePalette();

  useEffect(() => {
    loadToken().finally(() => SplashScreen.hideAsync().catch(() => {}));
  }, []);

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider value={{ ...base, colors: { ...base.colors, primary: c.primary, background: c.bg, card: c.bg, text: c.text, border: c.border } }}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: c.bg },
          headerTintColor: c.text,
          headerTitleStyle: { fontWeight: '700' },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: c.bg },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="signup" options={{ title: '' }} />
        <Stack.Screen name="login" options={{ title: '' }} />
        <Stack.Screen name="forgot-password" options={{ title: '' }} />
        <Stack.Screen name="verify" options={{ title: '' }} />
        <Stack.Screen name="reset-password" options={{ title: '' }} />
        <Stack.Screen name="setup/customer" options={{ title: 'Your dog', headerBackVisible: false, gestureEnabled: false }} />
        <Stack.Screen name="setup/walker" options={{ title: 'Walker profile', headerBackVisible: false, gestureEnabled: false }} />
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
        <Stack.Screen name="(walker)" options={{ headerShown: false }} />
        <Stack.Screen name="walker/[id]" options={{ title: '' }} />
        <Stack.Screen name="walk/[id]" options={{ title: 'Walk' }} />
      </Stack>
    </ThemeProvider>
  );
}
