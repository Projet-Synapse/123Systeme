// Powered by OnSpace.AI — Modes : bibliothèque d'ambiances + routines qui
// les activent automatiquement.
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState, ModeCard, RoutineRow, SectionHeader, Toast, confirmDelete } from '@/components';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useModes } from '@/contexts/ModesContext';
import { notifyHaptic } from '@/hooks/notifyHaptic';
import type { Mode } from '@/types';

export default function ModesScreen() {
  const router = useRouter();
  const { modes, routines, settings, activeMode, activateMode, updateRoutine, removeRoutine } = useModes();
  const [toast, setToast] = useState<string | null>(null);

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
    router.push({ pathname: '/mode-editor', params: { id: mode.id, newRoutine: '1' } });
  };

  const toggleActivate = (mode: Mode) => {
    const turningOff = activeMode?.id === mode.id;
    activateMode(turningOff ? null : mode.id);
    notifyHaptic();
    setToast(turningOff ? `Mode ${mode.name} désactivé` : `Mode ${mode.name} activé`);
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
            onActivate={() => toggleActivate(mode)}
            onOpen={() => openEditor(mode)}
          />
        ))}
      </View>

      <Button label="+ Créer un mode" onPress={() => openEditor()} style={styles.createButton} />

      <SectionHeader
        title="Routines"
        subtitle={
          settings.startupRoutinesEnabled
            ? 'Les routines « au démarrage » s’appliquent à l’ouverture. Touchez-en une pour la retrouver dans son mode.'
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
            onRemove={() =>
              confirmDelete(
                'Supprimer la routine ?',
                mode
                  ? `Le mode ${mode.name} ne s'activera plus automatiquement.`
                  : 'Elle ne se déclenchera plus.',
                () => removeRoutine(routine.id),
              )
            }
            // Toucher une routine ouvre l'éditeur de son mode, routines en vue.
            onPress={() => router.push({ pathname: '/mode-editor', params: { id: routine.modeId } })}
          />
        ))
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
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
});
