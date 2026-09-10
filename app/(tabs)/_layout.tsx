// Powered by OnSpace.AI
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UpdateBanner } from '@/components';
import { Colors } from '@/constants/theme';
import { useAccent } from '@/hooks/useAccent';

/** Onglets dans l'ordre des touches 1 à 5. */
const TAB_ROUTES = ['/', '/modes', '/widgets', '/docks', '/reglages'] as const;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const accent = useAccent();
  const router = useRouter();

  // Le mode actif colore l'interface : la tab bar suit son accent.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.title = '123Système';
  }, []);

  // Bureau : les touches 1 à 5 basculent d'onglet, sauf en pleine saisie.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKeyDown = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index < 0 || index >= TAB_ROUTES.length || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;
      router.push(TAB_ROUTES[index]);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <UpdateBanner />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: Platform.select({ ios: insets.bottom + 60, android: insets.bottom + 60, default: 70 }),
            paddingTop: 8,
            paddingBottom: Platform.select({
              ios: insets.bottom + 8,
              android: insets.bottom + 8,
              default: 8,
            }),
            paddingHorizontal: 16,
            backgroundColor: Colors.surface,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
          },
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size }) => <MaterialIcons name="devices" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="modes"
          options={{
            title: 'Modes',
            tabBarIcon: ({ color, size }) => <MaterialIcons name="nightlight" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="widgets"
          options={{
            title: 'Widgets',
            tabBarIcon: ({ color, size }) => <MaterialIcons name="grid-view" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="docks"
          options={{
            title: 'Stardocks',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="space-dashboard" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="reglages"
          options={{
            title: 'Réglages',
            tabBarIcon: ({ color, size }) => <MaterialIcons name="settings" size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
