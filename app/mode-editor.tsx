// Powered by OnSpace.AI — éditeur de mode : création, personnalisation et
// routines. Modifier un mode fourni crée d'abord une copie personnelle, pour
// que les défauts restent intacts.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  IconPicker,
  Input,
  Row,
  SectionHeader,
  Stepper,
  Toggle,
  confirmDelete,
} from '@/components';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useModes } from '@/contexts/ModesContext';
import { MODE_COLORS, DAY_LABELS, type ModeSettings, type RoutineTrigger } from '@/types';

const ACCENTS = MODE_COLORS;

const TRIGGER_TYPES: { type: RoutineTrigger['type']; label: string }[] = [
  { type: 'manual', label: 'Manuel' },
  { type: 'startup', label: 'Au démarrage' },
  { type: 'schedule', label: 'Horaire' },
];

export default function ModeEditorScreen() {
  const params = useLocalSearchParams<{ id?: string; modeId?: string; newRoutine?: string }>();
  const { modes, addMode, updateMode, removeMode, activateMode, addRoutine, routines, removeRoutine } =
    useModes();

  // `modeId` reste accepté pour les liens profonds existants (« Ajouter une
  // routine » depuis l'écran Modes envoie désormais `id`).
  const modeIdParam = params.id ?? params.modeId;
  const existing = useMemo(() => modes.find((m) => m.id === modeIdParam) ?? null, [modes, modeIdParam]);

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? 'auto-awesome');
  const [accent, setAccent] = useState(existing?.settings.accentColor ?? ACCENTS[0]);
  const [settingsState, setSettingsState] = useState<ModeSettings>(
    existing?.settings ?? {
      darkUi: true,
      doNotDisturb: false,
      volume: 70,
      brightness: 80,
      powerSaver: false,
      accentColor: ACCENTS[0],
      note: '',
    },
  );
  // Un mode système ne se modifie pas : on duplique avant d'éditer.
  const [clonedId, setClonedId] = useState<string | null>(null);

  useEffect(() => {
    if (existing?.isSystem && !clonedId) {
      const copy = addMode({
        name: `${existing.name} (perso)`,
        icon: existing.icon,
        color: existing.color,
        settings: existing.settings,
      });
      setClonedId(copy.id);
    }
    // addMode est stable ; la duplication doit se faire une seule fois.
  }, [existing, clonedId, addMode]);

  const current = clonedId ? modes.find((m) => m.id === clonedId) : existing;
  const modeRoutines = routines.filter((r) => r.modeId === current?.id);

  const patchSettings = (patch: Partial<ModeSettings>) => {
    const next = { ...settingsState, ...patch, accentColor: accent };
    setSettingsState(next);
    if (current) updateMode(current.id, { settings: next });
  };

  const patchBase = (patch: { name?: string; icon?: string; color?: string }) => {
    if (current) updateMode(current.id, patch);
  };

  const save = (activate: boolean) => {
    if (!current) {
      const created = addMode({
        name: name.trim() || 'Nouveau mode',
        icon,
        color: accent,
        settings: { ...settingsState, accentColor: accent },
      });
      if (activate) activateMode(created.id);
    } else {
      patchBase({ name: name.trim() || current.name, icon, color: accent });
      patchSettings({ accentColor: accent });
      if (activate) activateMode(current.id);
    }
    router.back();
  };

  const [routineType, setRoutineType] = useState<RoutineTrigger['type']>('schedule');
  const [routineTime, setRoutineTime] = useState('22:00');
  const [routineDays, setRoutineDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [routineError, setRoutineError] = useState<string | null>(null);

  const canEdit = Boolean(current);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{existing ? 'Modifier le mode' : 'Nouveau mode'}</Text>
      {existing?.isSystem ? (
        <Text style={styles.cloneNote}>
          Les modes fournis ne se modifient pas : une copie personnelle vient d'être créée.
        </Text>
      ) : null}

      <Card style={styles.section}>
        <Input
          label="Nom du mode"
          placeholder="Ex. Nuit, Travail, Jeu…"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.spacing} />
        <IconPicker label="Icône" value={icon} onChange={setIcon} />
        <View style={styles.spacing} />
        <Text style={styles.label}>Couleur d'accent</Text>
        <View style={styles.swatches}>
          {ACCENTS.map((color) => (
            <Pressable
              key={color}
              onPress={() => {
                setAccent(color);
                patchSettings({ accentColor: color });
              }}
              style={[styles.swatch, { backgroundColor: color }, accent === color && styles.swatchSelected]}
              accessibilityRole="button"
              accessibilityLabel={`Couleur ${color}`}
              accessibilityState={{ selected: accent === color }}
            />
          ))}
        </View>
      </Card>

      <SectionHeader title="Réglages appliqués" subtitle="Ce que ce mode change sur l'appareil" />
      <Card>
        <Toggle
          label="Ne pas déranger"
          description="Masque distractions et aperçus."
          value={settingsState.doNotDisturb}
          onChange={(doNotDisturb) => patchSettings({ doNotDisturb })}
          accentColor={accent}
        />
        <Toggle
          label="Économie d'énergie"
          description="Réduit animations et activité de fond."
          value={settingsState.powerSaver}
          onChange={(powerSaver) => patchSettings({ powerSaver })}
          accentColor={accent}
        />
        <Stepper
          label="Volume"
          value={settingsState.volume}
          min={0}
          max={100}
          step={5}
          onChange={(volume) => patchSettings({ volume })}
          format={(v) => `${v} %`}
        />
        <Stepper
          label="Luminosité"
          value={settingsState.brightness}
          min={10}
          max={100}
          step={5}
          onChange={(brightness) => patchSettings({ brightness })}
          format={(v) => `${v} %`}
        />
        <View style={styles.spacing} />
        <Input
          label="Note (piste d'ambiance)"
          placeholder="Ex. fond d'écran sombre, rangement du bureau…"
          value={settingsState.note}
          onChangeText={(note) => patchSettings({ note })}
          multiline
        />
      </Card>

      {canEdit ? (
        <>
          <SectionHeader title="Routines de ce mode" subtitle="Quand l'activer automatiquement" />
          {modeRoutines.map((routine) => (
            <Row
              key={routine.id}
              icon="bolt"
              iconColor={accent}
              title={
                routine.trigger.type === 'schedule'
                  ? `${routine.trigger.time} · ${routine.trigger.days.map((d) => DAY_LABELS[d]).join('')}`
                  : routine.trigger.type === 'startup'
                    ? "Au démarrage de l'app"
                    : 'Manuel'
              }
              right="Retirer"
              onPress={() =>
                confirmDelete('Supprimer la routine ?', 'Ce déclencheur automatique disparaîtra.', () =>
                  removeRoutine(routine.id),
                )
              }
            />
          ))}
          <Card style={styles.section}>
            <Text style={styles.label}>Nouveau déclencheur</Text>
            <View style={styles.typeRow}>
              {TRIGGER_TYPES.map(({ type, label }) => (
                <Pressable
                  key={type}
                  style={[styles.typeButton, routineType === type && styles.typeButtonOn]}
                  onPress={() => setRoutineType(type)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: routineType === type }}
                >
                  <Text style={[styles.typeLabel, routineType === type && styles.typeLabelOn]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            {routineType === 'schedule' ? (
              <>
                <Input
                  label="Heure (HH:MM)"
                  value={routineTime}
                  onChangeText={setRoutineTime}
                  inputMode="numeric"
                />
                <View style={styles.spacing} />
                <View style={styles.daysRow}>
                  {DAY_LABELS.map((label, index) => {
                    const on = routineDays.includes(index);
                    return (
                      <Pressable
                        key={index}
                        style={[styles.day, on && { backgroundColor: accent, borderColor: accent }]}
                        onPress={() =>
                          setRoutineDays((prev) =>
                            prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index].sort(),
                          )
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Jour ${label}`}
                        accessibilityState={{ selected: on }}
                      >
                        <Text style={[styles.dayLabel, on && styles.dayLabelOn]}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}
            {routineError ? <Text style={styles.routineError}>{routineError}</Text> : null}
            <View style={styles.spacing} />
            <Button
              label="+ Ajouter la routine"
              variant="secondary"
              onPress={() => {
                if (!current) return;
                if (routineType === 'schedule') {
                  const match = /^(\d{1,2}):(\d{2})$/.exec(routineTime.trim());
                  const hours = match ? Number(match[1]) : NaN;
                  const minutes = match ? Number(match[2]) : NaN;
                  if (!match || hours > 23 || minutes > 59) {
                    setRoutineError('Heure invalide : format attendu HH:MM (ex. 22:30).');
                    return;
                  }
                  if (routineDays.length === 0) {
                    setRoutineError('Choisissez au moins un jour de déclenchement.');
                    return;
                  }
                  setRoutineError(null);
                  addRoutine(current.id, {
                    type: 'schedule',
                    days: routineDays,
                    time: routineTime.trim().padStart(5, '0'),
                  });
                  return;
                }
                setRoutineError(null);
                addRoutine(current.id, { type: routineType });
              }}
            />
          </Card>
        </>
      ) : null}

      <View style={styles.footer}>
        <Button label="Enregistrer et activer" onPress={() => save(true)} accentColor={accent} />
        {current ? (
          <Button label="Enregistrer sans activer" variant="ghost" onPress={() => save(false)} />
        ) : null}
        {current && !current.isSystem ? (
          <View style={styles.footerRow}>
            <Button
              label="Supprimer ce mode"
              variant="danger"
              onPress={() =>
                confirmDelete(
                  'Supprimer ce mode ?',
                  `« ${current.name} » et ses routines disparaîtront définitivement.`,
                  () => {
                    removeMode(current.id);
                    router.back();
                  },
                )
              }
              style={styles.grow}
            />
            <Button label="Annuler" variant="ghost" onPress={router.back} style={styles.grow} />
          </View>
        ) : (
          <Button label="Annuler" variant="ghost" onPress={router.back} />
        )}
      </View>
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
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  cloneNote: {
    color: Colors.gold,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.sm,
  },
  routineError: {
    color: Colors.error,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.sm,
  },
  section: {
    marginTop: Spacing.lg,
  },
  spacing: {
    height: Spacing.lg,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.sm,
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatch: {
    borderColor: Colors.border,
    borderRadius: Radius.full,
    borderWidth: 2,
    height: 36,
    width: 36,
  },
  swatchSelected: {
    borderColor: '#FFFFFF',
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeButton: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  typeButtonOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  typeLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
  typeLabelOn: {
    color: Colors.textInverse,
    fontWeight: Typography.weights.semibold,
  },
  daysRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  day: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  dayLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
  },
  dayLabelOn: {
    color: Colors.textInverse,
    fontWeight: Typography.weights.semibold,
  },
  footer: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  footerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  grow: {
    flex: 1,
  },
});
