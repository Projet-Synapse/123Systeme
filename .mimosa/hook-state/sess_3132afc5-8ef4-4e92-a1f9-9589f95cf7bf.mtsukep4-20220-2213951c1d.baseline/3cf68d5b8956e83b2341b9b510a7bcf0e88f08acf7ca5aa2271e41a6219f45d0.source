// Powered by OnSpace.AI — aperçu fidèle d'un dock : mêmes proportions et
// couleurs que la fenêtre Electron réelle, dans une vignette.
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { DockConfig, DockPosition } from '@/types';

interface DockPreviewProps {
  dock: DockConfig;
  /** Échelle des icônes dans la vignette (la fenêtre réelle suit dock.size). */
  iconSize?: number;
}

export function DockPreview({ dock, iconSize = 28 }: DockPreviewProps) {
  const vertical = dock.position === 'left' || dock.position === 'right';
  const items = dock.items.length > 0 ? dock.items : null;

  return (
    <View style={[styles.stage, stageByPosition[dock.position]]}>
      <View
        style={[
          styles.dock,
          vertical ? styles.dockVertical : styles.dockHorizontal,
          { backgroundColor: dock.accentColor, opacity: Math.max(dock.opacity, 0.55) },
        ]}
      >
        {items ? (
          items.map((item) => (
            <View key={item.id} style={styles.item} accessibilityLabel={item.label}>
              <MaterialIcons
                name={item.icon as keyof typeof MaterialIcons.glyphMap}
                size={iconSize}
                color="#FFFFFF"
              />
            </View>
          ))
        ) : (
          <Text style={styles.empty}>Dock vide</Text>
        )}
      </View>
    </View>
  );
}

const stageByPosition: Record<DockPosition, StyleProp<ViewStyle>> = {
  bottom: { justifyContent: 'flex-end', paddingBottom: Spacing.sm },
  top: { justifyContent: 'flex-start', paddingTop: Spacing.sm },
  left: { alignItems: 'flex-start', justifyContent: 'center', paddingLeft: Spacing.sm },
  right: { alignItems: 'flex-end', justifyContent: 'center', paddingRight: Spacing.sm },
};

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    height: 120,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dock: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  dockHorizontal: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: Spacing.sm,
  },
  dockVertical: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    gap: Spacing.sm,
  },
  item: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  empty: {
    color: '#FFFFFF',
    fontSize: 12,
    paddingHorizontal: Spacing.md,
  },
});
