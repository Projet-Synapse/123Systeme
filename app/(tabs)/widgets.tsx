// Powered by OnSpace.AI — Widgets : grille adaptative, chaque widget rendu
// réellement (horloge vivante, note, raccourcis, moniteur, compte à rebours).
// Un widget ajouté ouvre directement ses options : pas de chasse à l'écran.
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  EmptyState,
  Input,
  SectionHeader,
  Stepper,
  WidgetCard,
  confirmDelete,
} from '@/components';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useDevice } from '@/contexts/DeviceContext';
import { useWidgets, WIDGET_KIND_LABELS } from '@/contexts/WidgetsContext';
import type { WidgetKind } from '@/types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default function WidgetsScreen() {
  const { widgets, addWidget, updateWidget, removeWidget, moveWidget } = useWidgets();
  const { isWide } = useDevice();
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = useMemo(() => [...widgets].sort((a, b) => a.position - b.position), [widgets]);
  const editing = widgets.find((w) => w.id === editingId) ?? null;

  const dateInvalid =
    editing?.kind === 'countdown' &&
    (editing.options.date ?? '').trim() !== '' &&
    !DATE_PATTERN.test((editing.options.date ?? '').trim());

  const createWidget = (kind: WidgetKind) => {
    const widget = addWidget(kind);
    setEditingId(widget.id);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Widgets</Text>
      <Text style={styles.subtitle}>Des blocs vivants, adaptés à votre appareil.</Text>

      <View style={styles.kindRow}>
        {(Object.keys(WIDGET_KIND_LABELS) as WidgetKind[]).map((kind) => (
          <Pressable
            key={kind}
            style={styles.kindButton}
            onPress={() => createWidget(kind)}
            accessibilityRole="button"
            accessibilityLabel={`Ajouter un widget ${WIDGET_KIND_LABELS[kind].title}`}
          >
            <Text style={styles.kindLabel}>+ {WIDGET_KIND_LABELS[kind].title}</Text>
          </Pressable>
        ))}
      </View>

      {sorted.length === 0 ? (
        <EmptyState
          icon="grid-view"
          title="Aucun widget"
          subtitle="Ajoutez une horloge, une note, des raccourcis, un moniteur ou un compte à rebours."
        />
      ) : (
        <View style={isWide ? styles.grid : styles.gridNarrow}>
          {sorted.map((widget) => (
            <Pressable
              key={widget.id}
              onPress={() => setEditingId(widget.id === editingId ? null : widget.id)}
              accessibilityRole="button"
              accessibilityLabel={`${widget.title} — options`}
            >
              <WidgetCard
                widget={widget}
                onOptionsChange={(options) => updateWidget(widget.id, { options })}
              />
            </Pressable>
          ))}
        </View>
      )}

      {editing ? (
        <Card style={styles.editor}>
          <SectionHeader
            title={`Options — ${WIDGET_KIND_LABELS[editing.kind].title}`}
            action="Fermer"
            onAction={() => setEditingId(null)}
          />
          <Input
            label="Titre"
            value={editing.title}
            onChangeText={(title) => updateWidget(editing.id, { title })}
          />
          <Stepper
            label="Largeur"
            value={editing.size === 'wide' ? 2 : 1}
            min={1}
            max={2}
            step={1}
            onChange={(value) => updateWidget(editing.id, { size: value === 2 ? 'wide' : 'medium' })}
            format={(value) => (value === 2 ? 'Pleine largeur' : 'Demi-largeur')}
          />
          {editing.kind === 'countdown' ? (
            <>
              <Input
                label="Date cible (AAAA-MM-JJ)"
                placeholder="2027-01-01"
                value={editing.options.date ?? ''}
                onChangeText={(date) => updateWidget(editing.id, { options: { ...editing.options, date } })}
                inputMode="numeric"
              />
              {dateInvalid ? <Text style={styles.error}>Format attendu : AAAA-MM-JJ.</Text> : null}
            </>
          ) : null}
          {editing.kind === 'shortcuts' ? (
            <Input
              label="Raccourcis"
              placeholder="Mail|https://mail.google.com ; Notes|notepad.exe"
              value={editing.options.targets ?? ''}
              onChangeText={(targets) =>
                updateWidget(editing.id, { options: { ...editing.options, targets } })
              }
              hint="Séparés par « ; », libellé et cible par « | ». Fonctionne dans l'app bureau."
            />
          ) : null}
          <View style={styles.editorActions}>
            <Button
              label="↑ Monter"
              variant="ghost"
              onPress={() => moveWidget(editing.id, true)}
              style={styles.moveButton}
            />
            <Button
              label="↓ Descendre"
              variant="ghost"
              onPress={() => moveWidget(editing.id, false)}
              style={styles.moveButton}
            />
            <Button
              label="Supprimer"
              variant="danger"
              onPress={() =>
                confirmDelete(
                  'Supprimer ce widget ?',
                  `« ${editing.title} » disparaîtra de la grille.`,
                  () => {
                    removeWidget(editing.id);
                    setEditingId(null);
                  },
                )
              }
            />
          </View>
        </Card>
      ) : null}

      <SectionHeader title="Astuce" />
      <Text style={styles.hint}>
        Touchez un widget pour ouvrir ses options. La grille passe automatiquement en deux colonnes sur les
        grands écrans ; le moniteur affiche les vraies mesures dans l'app bureau.
      </Text>
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
  kindRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  kindButton: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  kindLabel: {
    color: Colors.primaryLight,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  gridNarrow: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  editor: {
    marginTop: Spacing.xl,
  },
  editorActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  moveButton: {
    flexGrow: 1,
    flexBasis: 120,
  },
  error: {
    color: Colors.error,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.xs,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
});
