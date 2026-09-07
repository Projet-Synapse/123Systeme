// Powered by OnSpace.AI — Réglages globaux de l'app + informations système.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, SectionHeader, Toggle } from '@/components';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useDevice } from '@/contexts/DeviceContext';
import { useModes } from '@/contexts/ModesContext';
import { PLATFORM_LABELS } from '@/services/platform';

export default function ReglagesScreen() {
  const { snapshot } = useDevice();
  const { settings, setStartupRoutinesEnabled, activateMode } = useModes();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Réglages</Text>
      <Text style={styles.subtitle}>Le comportement global de 123Système sur cet appareil.</Text>

      <SectionHeader title="Routines" subtitle="Déclenchement automatique des modes" />
      <Card>
        <Toggle
          label="Routines au démarrage"
          description="Appliquer les routines « au démarrage de l'app » à l'ouverture."
          value={settings.startupRoutinesEnabled}
          onChange={setStartupRoutinesEnabled}
        />
        <Toggle
          label="Aucun mode par défaut"
          description="Repartir sans mode actif à chaque ouverture."
          value={settings.activeModeId === null}
          onChange={(value) => {
            if (value) activateMode(null);
          }}
        />
      </Card>

      <SectionHeader title="Mode actif" />
      <Card style={styles.activeCard}>
        <Text style={styles.activeText}>
          {settings.activeModeId
            ? "Un mode est actuellement actif : il colore toute l'interface."
            : 'Aucun mode actif.'}
        </Text>
        {settings.activeModeId ? (
          <Button label="Désactiver le mode" variant="secondary" onPress={() => activateMode(null)} />
        ) : null}
      </Card>

      <SectionHeader title="Appareil" subtitle="Ce que 123Système a détecté" />
      <Card style={styles.deviceCard}>
        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>Plateforme</Text>
          <Chip label={snapshot ? PLATFORM_LABELS[snapshot.platform] : '—'} color={Colors.primary} />
        </View>
        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>Appareil</Text>
          <Text style={styles.deviceValue}>{snapshot?.deviceName ?? '—'}</Text>
        </View>
        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>Système</Text>
          <Text style={styles.deviceValue}>
            {snapshot ? `${snapshot.osName ?? '—'} ${snapshot.osVersion ?? ''}` : '—'}
          </Text>
        </View>
        <View style={styles.deviceRow}>
          <Text style={styles.deviceLabel}>Réseau</Text>
          <Text style={styles.deviceValue}>
            {snapshot?.online === true ? 'En ligne' : snapshot?.online === false ? 'Hors ligne' : '—'}
          </Text>
        </View>
      </Card>

      <SectionHeader title="À propos" />
      <Text style={styles.about}>
        123Système fait partie du projet Synapse. Toutes vos personnalisations restent sur votre appareil :
        aucun compte, aucun serveur, aucune donnée envoyée.
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
  activeCard: {
    gap: Spacing.md,
  },
  activeText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  deviceCard: {
    gap: Spacing.md,
  },
  deviceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deviceLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
  },
  deviceValue: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    maxWidth: 220,
    textAlign: 'right',
  },
  about: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
});
