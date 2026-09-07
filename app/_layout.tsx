// Powered by OnSpace.AI
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DeviceProvider } from '@/contexts/DeviceContext';
import { DocksProvider } from '@/contexts/DocksContext';
import { ModesProvider } from '@/contexts/ModesContext';
import { WidgetsProvider } from '@/contexts/WidgetsContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DeviceProvider>
        <ModesProvider>
          <WidgetsProvider>
            <DocksProvider>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="mode-editor" options={{ presentation: 'modal' }} />
                {/* Fenêtre sans chrome rendue par Electron pour les docks. */}
                <Stack.Screen name="dock" options={{ headerShown: false }} />
              </Stack>
            </DocksProvider>
          </WidgetsProvider>
        </ModesProvider>
      </DeviceProvider>
    </SafeAreaProvider>
  );
}
