// Powered by OnSpace.AI — rendu réel d'un widget selon son type. Chaque type
// fonctionne honnêtement : horloge en direct, note éditable, raccourcis
// lançables (bureau), moniteur système (bureau), compte à rebours.
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '@/components/ui';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useDevice } from '@/contexts/DeviceContext';
import { useDocks } from '@/contexts/DocksContext';
import { WIDGET_KIND_LABELS } from '@/contexts/WidgetsContext';
import type { WidgetConfig } from '@/types';

interface WidgetCardProps {
  widget: WidgetConfig;
  onOptionsChange: (options: WidgetConfig['options']) => void;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function ClockWidget({ now }: { now: Date }) {
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <View>
      <Text style={styles.clockTime}>{time}</Text>
      <Text style={styles.clockDate}>{date}</Text>
    </View>
  );
}

function NotesWidget({ widget, onOptionsChange }: WidgetCardProps) {
  return (
    <TextInput
      style={styles.noteInput}
      placeholder="Écrivez votre note…"
      placeholderTextColor={Colors.textMuted}
      multiline
      value={widget.options.text ?? ''}
      onChangeText={(text) => onOptionsChange({ text })}
    />
  );
}

function ShortcutsWidget({ widget }: Pick<WidgetCardProps, 'widget'>) {
  const { launchTarget } = useDocks();
  const [error, setError] = useState<string | null>(null);
  const shortcuts = useMemo(() => {
    return (widget.options.targets ?? '')
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [label, target] = entry.split('|').map((part) => part.trim());
        return { label: label || target, target: target || label };
      });
  }, [widget.options.targets]);

  if (shortcuts.length === 0) {
    return <Text style={styles.hint}>Format : Libellé|cible ; … — ex. Mail|https://mail.google.com</Text>;
  }

  return (
    <View style={styles.shortcutWrap}>
      {shortcuts.map((shortcut) => (
        <Pressable
          key={shortcut.target}
          style={styles.shortcutButton}
          onPress={() => void launchTarget(shortcut.target).then(setError)}
        >
          <Text style={styles.shortcutLabel} numberOfLines={1}>
            {shortcut.label}
          </Text>
        </Pressable>
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function MonitorWidget() {
  const { snapshot } = useDevice();
  if (!snapshot) return <Text style={styles.hint}>Lecture du système…</Text>;
  return (
    <View style={styles.monitorGrid}>
      <Text style={styles.monitorLine}>
        Système : {snapshot.osName ?? '—'} {snapshot.osVersion ?? ''}
      </Text>
      <Text style={styles.monitorLine}>Processeur : {snapshot.cpuModel ?? '—'}</Text>
      <Text style={styles.monitorLine}>
        Cœurs : {snapshot.cpuCount ?? '—'} · Mémoire :{' '}
        {snapshot.totalMemoryGb ? `${snapshot.totalMemoryGb} Go` : '—'}
      </Text>
      {snapshot.battery ? (
        <Text style={styles.monitorLine}>
          Batterie : {snapshot.battery.level}%{snapshot.battery.charging ? ' (en charge)' : ''}
        </Text>
      ) : null}
    </View>
  );
}

function CountdownWidget({ widget }: Pick<WidgetCardProps, 'widget'>) {
  const days = useMemo(() => {
    const target = widget.options.date ? new Date(widget.options.date) : null;
    if (!target || Number.isNaN(target.getTime())) return null;
    return Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86_400_000));
  }, [widget.options.date]);

  if (days === null) {
    return <Text style={styles.hint}>Choisissez une date cible dans les options du widget.</Text>;
  }
  return (
    <View>
      <Text style={styles.countdownDays}>{days}</Text>
      <Text style={styles.countdownLabel}>{days > 1 ? 'jours restants' : 'jour restant'}</Text>
    </View>
  );
}

export function WidgetCard({ widget, onOptionsChange }: WidgetCardProps) {
  const now = useClock();
  const meta = WIDGET_KIND_LABELS[widget.kind];

  return (
    <Card style={widget.size === 'wide' ? styles.wide : styles.medium}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialIcons
            name={meta.icon as keyof typeof MaterialIcons.glyphMap}
            size={16}
            color={Colors.primaryLight}
          />
        </View>
        <Text style={styles.title}>{widget.title}</Text>
      </View>
      {widget.kind === 'clock' ? <ClockWidget now={now} /> : null}
      {widget.kind === 'notes' ? <NotesWidget widget={widget} onOptionsChange={onOptionsChange} /> : null}
      {widget.kind === 'shortcuts' ? <ShortcutsWidget widget={widget} /> : null}
      {widget.kind === 'monitor' ? <MonitorWidget /> : null}
      {widget.kind === 'countdown' ? <CountdownWidget widget={widget} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  medium: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  wide: {
    alignSelf: 'stretch',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMid,
    borderRadius: Radius.sm,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  clockTime: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    fontVariant: ['tabular-nums'],
  },
  clockDate: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xs,
    textTransform: 'capitalize',
  },
  noteInput: {
    alignSelf: 'stretch',
    color: Colors.textPrimary,
    fontSize: Typography.sizes.sm,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  hint: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
  },
  error: {
    color: Colors.error,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.xs,
  },
  shortcutWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  shortcutButton: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  shortcutLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.sm,
  },
  monitorGrid: {
    gap: Spacing.xs,
  },
  monitorLine: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.xs,
  },
  countdownDays: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
  },
});
