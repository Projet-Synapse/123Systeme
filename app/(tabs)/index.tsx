// Powered by OnSpace.AI — Accueil : tableau de bord adaptatif. Les cartes et
// colonnes se réorganisent selon la plateforme et la largeur ; les infos
// système sont réelles sur le bureau, indicatives ailleurs. Les sections
// mènent vers l'action : bandeau et compteurs sont cliquables, et les
// mesures indisponibles ne gaspillent plus la place.
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, SectionHeader, StatusCard } from '@/components';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useDevice } from '@/contexts/DeviceContext';
import { useDocks } from '@/contexts/DocksContext';
import { useModes } from '@/contexts/ModesContext';
import { useWidgets } from '@/contexts/WidgetsContext';
import { useAccent } from '@/hooks/useAccent';
import { PLATFORM_LABELS } from '@/services/platform';

function greetingLabel(): string {
  const hour = new Date().getHours();
  if (hour < 5 || hour >= 19) return 'Bonsoir 👋';
  if (hour < 12) return 'Bonjour 👋';
  return 'Bel après-midi 👋';
}

export default function HomeScreen() {
  const router = useRouter();
  const { snapshot, isWide } = useDevice();
  const { activeMode, modes } = useModes();
  const { widgets } = useWidgets();
  const { docks } = useDocks();
  const accent = useAccent();

  // Seules les mesures réellement disponibles occupent l'espace ; sur mobile
  // ou navigateur, on évite une rangée de « Non disponible ».
  const statusCards = [
    snapshot?.cpuModel
      ? {
          icon: 'memory',
          label: 'Processeur',
          value: snapshot.cpuModel,
          hint: snapshot.cpuCount ? `${snapshot.cpuCount} cœurs logiques` : undefined,
        }
      : null,
    snapshot?.totalMemoryGb
      ? { icon: 'sd-storage', label: 'Mémoire', value: `${snapshot.totalMemoryGb} Go` }
      : null,
    snapshot?.battery
      ? {
          icon: 'battery-charging-full',
          label: 'Batterie',
          value: `${snapshot.battery.level}%`,
          hint: snapshot.battery.charging ? 'En charge' : undefined,
          accent: Colors.mint,
        }
      : { icon: 'power', label: 'Alimentation', value: 'Secteur', accent: Colors.mint },
    snapshot?.uptimeHours != null
      ? {
          icon: 'schedule',
          label: 'Allumé depuis',
          value: `${snapshot.uptimeHours} h`,
          accent: Colors.gold,
        }
      : null,
  ].filter((card): card is NonNullable<typeof card> => card !== null);

  const summary = [
    { label: 'modes', count: modes.length, href: '/modes' as const },
    { label: 'widgets', count: widgets.length, href: '/widgets' as const },
    { label: 'docks', count: docks.length, href: '/docks' as const },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>{greetingLabel()}</Text>
      <Text style={styles.deviceName}>{snapshot?.deviceName ?? 'Votre appareil'}</Text>
      <View style={styles.chips}>
        <Chip label={snapshot ? PLATFORM_LABELS[snapshot.platform] : 'Détection…'} color={accent} />
        {snapshot?.online === true ? <Chip label="En ligne" color={Colors.success} /> : null}
        {snapshot?.online === false ? <Chip label="Hors ligne" color={Colors.error} /> : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          activeMode ? `Mode actif : ${activeMode.name}. Changer de mode` : 'Choisir un mode'
        }
        onPress={() => router.push('/modes')}
      >
        {activeMode ? (
          <Card style={styles.modeBanner}>
            <View style={[styles.modeIcon, { backgroundColor: `${activeMode.color}22` }]}>
              <MaterialIcons
                name={activeMode.icon as keyof typeof MaterialIcons.glyphMap}
                size={24}
                color={activeMode.color}
              />
            </View>
            <View style={styles.modeTextWrap}>
              <Text style={styles.modeLabel}>Mode actif</Text>
              <Text style={styles.modeName}>{activeMode.name}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.textMuted} />
          </Card>
        ) : (
          <Card style={styles.modeBanner}>
            <View style={[styles.modeIcon, { backgroundColor: Colors.surfaceMid }]}>
              <MaterialIcons name="tune" size={24} color={Colors.textMuted} />
            </View>
            <View style={styles.modeTextWrap}>
              <Text style={styles.modeLabel}>Aucun mode actif</Text>
              <Text style={styles.modeName}>Choisissez une ambiance dans l'onglet Modes</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.textMuted} />
          </Card>
        )}
      </Pressable>

      <SectionHeader title="Actions rapides" subtitle="Les trois gestes qui personnalisent le plus" />
      <View style={styles.quickRow}>
        <Button
          label="Activer un mode"
          accentColor={accent}
          onPress={() => router.push('/modes')}
          style={styles.quickButton}
        />
        <Button
          label="Ajouter un widget"
          variant="secondary"
          onPress={() => router.push('/widgets')}
          style={styles.quickButton}
        />
        <Button
          label="Créer un dock"
          variant="secondary"
          onPress={() => router.push('/docks')}
          style={styles.quickButton}
        />
      </View>

      {statusCards.length > 0 ? (
        <>
          <SectionHeader title="Votre appareil" subtitle="Informations adaptées à cette plateforme" />
          <View style={isWide ? styles.gridWide : styles.gridNarrow}>
            {statusCards.map((card) => (
              <StatusCard
                key={card.label}
                icon={card.icon}
                label={card.label}
                value={card.value}
                hint={card.hint}
                accent={card.accent}
              />
            ))}
          </View>
        </>
      ) : null}

      <SectionHeader title="Votre personnalisation" subtitle="Touchez un compteur pour y aller" />
      <View style={styles.summaryRow}>
        {summary.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={`${item.count} ${item.label} — ouvrir`}
            onPress={() => router.push(item.href)}
            style={({ pressed }) => [styles.summaryItem, pressed && styles.pressed]}
          >
            <Text style={[styles.summaryValue, { color: accent }]}>{item.count}</Text>
            <Text style={styles.summaryLabel}>{item.label}</Text>
          </Pressable>
        ))}
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
  greeting: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.base,
  },
  deviceName: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  modeBanner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  modeIcon: {
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  modeTextWrap: {
    flex: 1,
  },
  modeLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    textTransform: 'uppercase',
  },
  modeName: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickButton: {
    flexGrow: 1,
    flexBasis: 160,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridNarrow: {
    gap: Spacing.md,
  },
  summaryRow: {
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
  },
  summaryItem: {
    alignItems: 'center',
    borderRadius: Radius.md,
    flex: 1,
    paddingVertical: Spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  summaryValue: {
    color: Colors.primaryLight,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
  },
});
