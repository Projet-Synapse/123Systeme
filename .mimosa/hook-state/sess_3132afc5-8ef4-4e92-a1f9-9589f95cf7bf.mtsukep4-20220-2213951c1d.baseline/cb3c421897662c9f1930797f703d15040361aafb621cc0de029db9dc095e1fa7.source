// Powered by OnSpace.AI — carte de mode : aperçu des réglages + activation.
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Chip } from '@/components/ui';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import type { Mode } from '@/types';

interface ModeCardProps {
  mode: Mode;
  active: boolean;
  routineCount: number;
  onActivate: () => void;
  onOpen: () => void;
}

export function ModeCard({ mode, active, routineCount, onActivate, onOpen }: ModeCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, active && styles.active, pressed && styles.pressed]}
      onPress={onOpen}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${mode.color}22` }]}>
          <MaterialIcons
            name={mode.icon as keyof typeof MaterialIcons.glyphMap}
            size={24}
            color={mode.color}
          />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.name}>{mode.name}</Text>
          <Text style={styles.meta}>
            {mode.isSystem ? 'Mode fourni' : 'Mode personnel'}
            {routineCount > 0 ? ` · ${routineCount} routine${routineCount > 1 ? 's' : ''}` : ''}
          </Text>
        </View>
        {active ? <Chip label="Actif" color={Colors.success} /> : null}
      </View>

      <View style={styles.settings}>
        <Chip label={`Volume ${mode.settings.volume}%`} />
        <Chip label={`Luminosité ${mode.settings.brightness}%`} />
        {mode.settings.doNotDisturb ? <Chip label="Ne pas déranger" color={Colors.gold} /> : null}
        {mode.settings.powerSaver ? <Chip label="Économie" color={Colors.mint} /> : null}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          { borderColor: mode.color },
          active && styles.buttonActive,
          pressed && styles.pressed,
        ]}
        onPress={(event) => {
          event.stopPropagation();
          onActivate();
        }}
      >
        <Text style={[styles.buttonLabel, { color: active ? Colors.textPrimary : mode.color }]}>
          {active ? 'Désactiver' : 'Activer'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1,
    margin: Spacing.sm,
    maxWidth: 360,
    minWidth: 260,
    padding: Spacing.lg,
  },
  active: {
    borderColor: Colors.success,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  titleWrap: {
    flex: 1,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  settings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  button: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
  },
  buttonActive: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
  },
  buttonLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});
