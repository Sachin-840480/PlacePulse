import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFcmSetup } from '../hooks/useFcmSetup';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useFcmSetup();

  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="jobs" options={{ title: 'Jobs', animation: 'slide_from_right', // or 'fade', 'default'
            }}
          />
          <Stack.Screen name="notifications" options={{ title: 'Notifications', animation: 'slide_from_right' }} />

          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />

          <Stack.Screen name="coming-soon" options={{ title: 'Coming Soon', animation: 'slide_from_right' }} />

        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
