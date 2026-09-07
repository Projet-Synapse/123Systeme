// Powered by OnSpace.AI
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
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
          tabBarActiveTintColor: Colors.primary,
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
