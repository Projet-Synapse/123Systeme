// Powered by OnSpace.AI — rendu d'une vraie fenêtre de dock (fenêtre Electron
// sans chrome). La config vient du stockage local partagé avec la fenêtre
// principale ; `docks:updated` la recharge après une édition.
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useDocks } from '@/contexts/DocksContext';
import { desktop } from '@/services/platform';
import type { DockConfig } from '@/types';

export default function DockScreen() {
  const params = useLocalSearchParams<{ dockId?: string }>();
  const dockId = params.dockId ?? '';
  const { docks, launchTarget } = useDocks();
  const [version, setVersion] = useState(0);

  // Le processus principal signale que la config a été éditée : on relit
  // simplement le contexte, qui a déjà lu le nouveau stockage local.
  useEffect(() => {
    const bridge = desktop();
    if (!bridge) return;
    return bridge.onDocksUpdated(() => setVersion((v) => v + 1));
  }, []);

  const dock: DockConfig | undefined = docks.find((d) => d.id === dockId);
  // `version` ne sert qu'à forcer le rendu après un broadcast ; linter, calme-toi.
  void version;

  const [error, setError] = useState<string | null>(null);

  const onLaunch = useCallback(
    (target: string) => {
      void launchTarget(target).then((message) => setError(message));
    },
    [launchTarget],
  );

  if (!dock) {
    return (
      <View style={[styles.dock, styles.empty]}>
        <Text style={styles.emptyText}>Dock introuvable</Text>
      </View>
    );
  }

  return (
    <View style={[styles.dock, { opacity: Math.max(dock.opacity, 0.55) }]}>
      {dock.items.map((item) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            styles.item,
            dock.size >= 48 && { width: dock.size, height: dock.size, borderRadius: dock.size / 4 },
            pressed && dock.magnification && styles.itemHovered,
          ]}
          onPress={() => onLaunch(item.target)}
          accessibilityLabel={`Lancer ${item.label}`}
        >
          <MaterialIcons
            name={item.icon as keyof typeof MaterialIcons.glyphMap}
            size={Math.round(dock.size * 0.55)}
            color="#FFFFFF"
          />
        </Pressable>
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    height: '100%',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
  },
  empty: {
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  itemHovered: {
    backgroundColor: Colors.surfaceMid,
    transform: [{ scale: 1.15 }],
  },
  error: {
    color: Colors.error,
    fontSize: 10,
    marginLeft: 8,
  },
});
