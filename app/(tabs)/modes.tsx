// Powered by OnSpace.AI — Modes : bibliothèque d'ambiances + routines qui
// les activent automatiquement.
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState, ModeCard, RoutineRow, SectionHeader } from '@/components';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useModes } from '@/contexts/ModesContext';
import type { Mode, RoutineTrigger } from '@/types';

const TRIGGER_LABELS: Record<RoutineTrigger['type'], string> = {
  manual: 'Manuel',
  startup: 'Au démarrage',
  schedule: 'Horaire',
};

export default function ModesScreen() {
  const router = useRouter();
  const { modes, routines, settings, activeMode, activateMode, updateRoutine, removeRoutine } = useModes();
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);

  const routineCountByMode = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const routine of routines) {
      counts[routine.modeId] = (counts[routine.modeId] ?? 0) + 1;
    }
    return counts;
  }, [routines]);

  const routinesWithMode = useMemo(
    () => routines.map((routine) => ({ routine, mode: modes.find((m) => m.id === routine.modeId) })),
    [routines, modes],
  );

  const openEditor = (mode?: Mode) => {
    router.push({ pathname: '/mode-editor', params: mode ? { id: mode.id } : {} });
  };

  const addQuickRoutine = () => {
    if (modes.length === 0) return;
    const mode = modes[0];
    router.push({ pathname: '/mode-editor', params: { modeId: mode.id, newRoutine: '1' } });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Modes</Text>
      <Text style={styles.subtitle}>
        Une ambiance complète en un appui : interface, volume, luminosité, distractions.
      </Text>

      <View style={styles.grid}>
        {modes.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            active={activeMode?.id === mode.id}
            routineCount={routineCountByMode[mode.id] ?? 0}
            onActivate={() => activateMode(activeMode?.id === mode.id ? null : mode.id)}
            onOpen={() => openEditor(mode)}
          />
        ))}
      </View>

      <Button label="+ Créer un mode" onPress={() => openEditor()} style={styles.createButton} />

      <SectionHeader
        title="Routines"
        subtitle={
          settings.startupRoutinesEnabled
            ? 'Les routines « au démarrage » s’appliquent à l’ouverture.'
            : 'Routines au démarrage désactivées (voir Réglages).'
        }
      />

      {routinesWithMode.length === 0 ? (
        <EmptyState
          icon="bolt"
          title="Aucune routine"
          subtitle="Ajoutez-en une pour activer un mode automatiquement."
        >
          <Button label="Ajouter une routine" variant="secondary" onPress={addQuickRoutine} />
        </EmptyState>
      ) : (
        routinesWithMode.map(({ routine, mode }) => (
          <RoutineRow
            key={routine.id}
            routine={routine}
            mode={mode}
            onToggle={(enabled) => updateRoutine(routine.id, { enabled })}
            onRemove={() => removeRoutine(routine.id)}
            onPress={() => setEditingRoutineId(editingRoutineId === routine.id ? null : routine.id)}
          />
        ))
      )}

      {editingRoutineId ? (
        <Pressable style={styles.hintRow} onPress={() => setEditingRoutineId(null)}>
          <Text style={styles.hint}>
            Touchez une routine pour la replier. Déclencheurs gérés dans l'éditeur de mode :
            {Object.values(TRIGGER_LABELS).join(' · ')}.
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl + Spacing.lg,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.base,
    marginTop: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -Spacing.sm,
    marginRight: -Spacing.sm,
    marginTop: Spacing.lg,
  },
  createButton: {
    marginTop: Spacing.lg,
  },
  hintRow: {
    marginTop: Spacing.md,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
  },
});
