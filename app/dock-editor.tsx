// Powered by OnSpace.AI — éditeur de Stardock : apparence, comportement et
// icônes. L'aperçu reflète exactement ce que fera la fenêtre réelle.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  DockPreview,
  IconPicker,
  Input,
  Row,
  SectionHeader,
  Stepper,
  Toggle,
  confirmDelete,
} from '@/components';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useDocks } from '@/contexts/DocksContext';
import { MODE_COLORS, type DockItem, type DockPosition } from '@/types';

const POSITIONS: { value: DockPosition; label: string; icon: string }[] = [
  { value: 'bottom', label: 'Bas', icon: 'south' },
  { value: 'top', label: 'Haut', icon: 'north' },
  { value: 'left', label: 'Gauche', icon: 'west' },
  { value: 'right', label: 'Droite', icon: 'east' },
];

const ITEM_KINDS: { value: DockItem['kind']; label: string; hint: string }[] = [
  { value: 'app', label: 'Application', hint: "Chemin de l'exécutable" },
  { value: 'folder', label: 'Dossier', hint: 'Chemin du dossier' },
  { value: 'url', label: 'Site web', hint: 'URL https://' },
];

export default function DockEditorScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { docks, updateDock, addItem, removeItem, openOnDesktop } = useDocks();
  const dock = docks.find((d) => d.id === params.id) ?? null;

  const [itemKind, setItemKind] = useState<DockItem['kind']>('url');
  const [itemLabel, setItemLabel] = useState('');
  const [itemTarget, setItemTarget] = useState('');
  const [itemIcon, setItemIcon] = useState('public');
  const [addError, setAddError] = useState<string | null>(null);

  if (!dock) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Dock introuvable.</Text>
        <Button label="Retour" onPress={router.back} />
      </View>
    );
  }

  const addItemClicked = () => {
    const target = itemTarget.trim();
    if (!target) {
      setAddError('Indiquez une cible (URL, chemin…).');
      return;
    }
    if (itemKind === 'url' && !/^https?:\/\//i.test(target)) {
      setAddError('Une cible « Site web » doit commencer par https://');
      return;
    }
    addItem(dock.id, {
      label: itemLabel.trim() || target,
      icon: itemIcon,
      kind: itemKind,
      target,
    });
    setItemLabel('');
    setItemTarget('');
    setAddError(null);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Éditer le dock</Text>
      <Card style={styles.section}>
        <Input label="Nom" value={dock.name} onChangeText={(name) => updateDock(dock.id, { name })} />
      </Card>

      <SectionHeader title="Apparence" subtitle="Où il se pose et comment il se montre" />
      <Card>
        <Text style={styles.label}>Position à l'écran</Text>
        <View style={styles.positions}>
          {POSITIONS.map(({ value, label, icon }) => (
            <Pressable
              key={value}
              style={[styles.position, dock.position === value && styles.positionOn]}
              onPress={() => updateDock(dock.id, { position: value })}
              accessibilityRole="button"
              accessibilityLabel={`Position ${label}`}
              accessibilityState={{ selected: dock.position === value }}
            >
              <Text style={styles.positionIcon}>
                {icon === 'south' ? '↓' : icon === 'north' ? '↑' : icon === 'west' ? '←' : '→'}
              </Text>
              <Text style={[styles.positionLabel, dock.position === value && styles.positionLabelOn]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Stepper
          label="Taille des icônes"
          value={dock.size}
          min={32}
          max={96}
          step={8}
          onChange={(size) => updateDock(dock.id, { size })}
          format={(v) => `${v} px`}
        />
        <Stepper
          label="Transparence du plateau"
          value={Math.round(dock.opacity * 100)}
          min={30}
          max={100}
          step={5}
          onChange={(value) => updateDock(dock.id, { opacity: value / 100 })}
          format={(v) => `${v} %`}
        />
        <Text style={styles.label}>Couleur d'accent</Text>
        <View style={styles.swatches}>
          {MODE_COLORS.map((color) => (
            <Pressable
              key={color}
              onPress={() => updateDock(dock.id, { accentColor: color })}
              style={[
                styles.swatch,
                { backgroundColor: color },
                dock.accentColor === color && styles.swatchSelected,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Couleur ${color}`}
              accessibilityState={{ selected: dock.accentColor === color }}
            />
          ))}
        </View>
      </Card>

      <SectionHeader title="Comportement" />
      <Card>
        <Toggle
          label="Effet loupe"
          description="Les icônes grossissent au survol (bureau)."
          value={dock.magnification}
          onChange={(magnification) => updateDock(dock.id, { magnification })}
          accentColor={dock.accentColor}
        />
        <Toggle
          label="Auto-masquage"
          description="Le dock se cache et réapparaît quand le curseur touche le bord."
          value={dock.autoHide}
          onChange={(autoHide) => updateDock(dock.id, { autoHide })}
          accentColor={dock.accentColor}
        />
      </Card>

      <SectionHeader title="Aperçu" subtitle="Le rendu exact de la fenêtre réelle" />
      <DockPreview dock={dock} iconSize={Math.max(20, Math.min(dock.size, 48) / 2)} />

      <SectionHeader title="Icônes" subtitle={`${dock.items.length} élément(s) dans le plateau`} />
      {dock.items.map((item) => (
        <Row
          key={item.id}
          icon={item.icon}
          iconColor={dock.accentColor}
          title={item.label}
          subtitle={`${ITEM_KINDS.find((k) => k.value === item.kind)?.label ?? item.kind} · ${item.target}`}
          right="Retirer"
          onPress={() =>
            confirmDelete(
              'Retirer cette icône ?',
              `« ${item.label} » quittera le dock.`,
              () => removeItem(dock.id, item.id),
              'Retirer',
            )
          }
        />
      ))}

      <Card style={styles.section}>
        <Text style={styles.label}>Ajouter une icône</Text>
        <View style={styles.kindRow}>
          {ITEM_KINDS.map(({ value, label }) => (
            <Pressable
              key={value}
              style={[styles.kindButton, itemKind === value && styles.kindButtonOn]}
              onPress={() => setItemKind(value)}
              accessibilityRole="button"
              accessibilityState={{ selected: itemKind === value }}
            >
              <Text style={[styles.kindLabel, itemKind === value && styles.kindLabelOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Input
          label="Libellé"
          placeholder="Ex. GitHub, Musique…"
          value={itemLabel}
          onChangeText={setItemLabel}
        />
        <View style={styles.spacing} />
        <Input
          label={ITEM_KINDS.find((k) => k.value === itemKind)?.hint ?? 'Cible'}
          placeholder={itemKind === 'url' ? 'https://…' : 'C:\\… ou ~/…'}
          value={itemTarget}
          onChangeText={setItemTarget}
        />
        <View style={styles.spacing} />
        <IconPicker label="Icône" value={itemIcon} onChange={setItemIcon} />
        {addError ? <Text style={styles.error}>{addError}</Text> : null}
        <View style={styles.spacing} />
        <Button label="+ Ajouter au dock" variant="secondary" onPress={addItemClicked} />
      </Card>

      <View style={styles.footer}>
        <Button
          label="Ouvrir ce dock maintenant"
          onPress={async () => {
            const error = await openOnDesktop(dock.id);
            if (error) setAddError(error);
          }}
        />
        <Button label="Terminé" variant="ghost" onPress={router.back} />
      </View>

      <View style={styles.chipsRow}>
        <Chip label="Astuce : l'auto-masquage garde le bureau épuré" />
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
  positions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  position: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: Spacing.md,
  },
  positionOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  positionIcon: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.lg,
  },
  positionLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.xs,
  },
  positionLabelOn: {
    color: Colors.textInverse,
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
  kindRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kindButton: {
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  kindButtonOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  kindLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
  kindLabelOn: {
    color: Colors.textInverse,
    fontWeight: Typography.weights.semibold,
  },
  error: {
    color: Colors.error,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.sm,
  },
  footer: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  chipsRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
  missing: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    flex: 1,
    gap: Spacing.lg,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  missingText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.lg,
  },
});
