// Powered by OnSpace.AI — Accueil : tableau de bord adaptatif. Les cartes et
// colonnes se réorganisent selon la plateforme et la largeur ; les infos
// système sont réelles sur le bureau, indicatives ailleurs.
import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Chip, SectionHeader, StatusCard } from '@/components';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useDevice } from '@/contexts/DeviceContext';
import { useDocks } from '@/contexts/DocksContext';
import { useModes } from '@/contexts/ModesContext';
import { useWidgets } from '@/contexts/WidgetsContext';
import { PLATFORM_LABELS } from '@/services/platform';

export default function HomeScreen() {
  const { snapshot, isWide } = useDevice();
  const { activeMode, modes } = useModes();
  const { widgets } = useWidgets();
  const { docks } = useDocks();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>Bonjour 👋</Text>
      <Text style={styles.deviceName}>{snapshot?.deviceName ?? 'Votre appareil'}</Text>
      <View style={styles.chips}>
        <Chip label={snapshot ? PLATFORM_LABELS[snapshot.platform] : 'Détection…'} color={Colors.primary} />
        {snapshot?.online === true ? <Chip label="En ligne" color={Colors.success} /> : null}
        {snapshot?.online === false ? <Chip label="Hors ligne" color={Colors.error} /> : null}
      </View>

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
        </Card>
      )}

      <SectionHeader title="Votre appareil" subtitle="Informations adaptées à cette plateforme" />
      <View style={isWide ? styles.gridWide : styles.gridNarrow}>
        <StatusCard
          icon="memory"
          label="Processeur"
          value={snapshot?.cpuModel ?? 'Non disponible'}
          hint={snapshot?.cpuCount ? `${snapshot.cpuCount} cœurs logiques` : undefined}
        />
        <StatusCard
          icon="sd-storage"
          label="Mémoire"
          value={snapshot?.totalMemoryGb ? `${snapshot.totalMemoryGb} Go` : 'Non disponible'}
        />
        <StatusCard
          icon="battery-charging-full"
          label="Batterie"
          value={snapshot?.battery ? `${snapshot.battery.level}%` : 'Secteur'}
          hint={snapshot?.battery?.charging ? 'En charge' : undefined}
          accent={Colors.mint}
        />
        <StatusCard
          icon="schedule"
          label="Allumé depuis"
          value={snapshot?.uptimeHours != null ? `${snapshot.uptimeHours} h` : 'Non disponible'}
          accent={Colors.gold}
        />
      </View>

      <SectionHeader
        title="Votre personnalisation"
        subtitle={`${modes.length} modes · ${widgets.length} widgets · ${docks.length} Stardock${docks.length > 1 ? 's' : ''}`}
      />
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{modes.length}</Text>
          <Text style={styles.summaryLabel}>modes</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{widgets.length}</Text>
          <Text style={styles.summaryLabel}>widgets</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{docks.length}</Text>
          <Text style={styles.summaryLabel}>docks</Text>
        </View>
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
    flex: 1,
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
