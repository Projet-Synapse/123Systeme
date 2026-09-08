// Powered by OnSpace.AI — ligne de routine : déclencheur lisible + interrupteur.
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Toggle } from '@/components/ui';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { DAY_LABELS, type Mode, type Routine } from '@/types';

interface RoutineRowProps {
  routine: Routine;
  mode: Mode | undefined;
  onToggle: (enabled: boolean) => void;
  onRemove: () => void;
  onPress: () => void;
}

function triggerLabel(routine: Routine): string {
  switch (routine.trigger.type) {
    case 'manual':
      return 'Manuel';
    case 'startup':
      return 'Au démarrage de l’app';
    case 'schedule': {
      const days =
        routine.trigger.days.length === 7
          ? 'chaque jour'
          : routine.trigger.days.map((d) => DAY_LABELS[d]).join(' ');
      return `${routine.trigger.time} · ${days}`;
    }
  }
}

export function RoutineRow({ routine, mode, onToggle, onRemove, onPress }: RoutineRowProps) {
  return (
    <View style={styles.container}>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress}>
        <View style={[styles.iconWrap, mode ? { backgroundColor: `${mode.color}22` } : null]}>
          <MaterialIcons
            name={(mode?.icon ?? 'help-outline') as keyof typeof MaterialIcons.glyphMap}
            size={20}
            color={mode?.color ?? Colors.textMuted}
          />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{mode ? mode.name : 'Mode supprimé'}</Text>
          <Text style={styles.subtitle}>{triggerLabel(routine)}</Text>
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Toggle label="" value={routine.enabled} onChange={onToggle} accentColor={mode?.color} />
        <Pressable onPress={onRemove} style={styles.remove} accessibilityLabel="Supprimer la routine">
          <MaterialIcons name="delete-outline" size={20} color={Colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMid,
    borderRadius: Radius.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: Spacing.sm,
  },
  remove: {
    padding: Spacing.sm,
  },
});
