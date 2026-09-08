// Powered by OnSpace.AI — Stardocks : la collection de docks personnalisés.
// Sur le bureau, « Ouvrir » spawn la vraie fenêtre Electron ; ailleurs, la
// configuration reste éditable et l'aperçu montre le rendu.
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Chip, DockPreview, EmptyState, SectionHeader } from '@/components';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useDocks } from '@/contexts/DocksContext';

const POSITION_LABELS: Record<string, string> = {
  bottom: 'Bas',
  top: 'Haut',
  left: 'Gauche',
  right: 'Droite',
};

export default function DocksScreen() {
  const router = useRouter();
  const { docks, desktopReady, addDock, openOnDesktop, closeOnDesktop, removeDock } = useDocks();

  const createAndEdit = () => {
    const dock = addDock();
    router.push({ pathname: '/dock-editor', params: { id: dock.id } });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Stardocks</Text>
      <Text style={styles.subtitle}>
        Vos propres docks, façon Stardock, mais gratuits et à votre goût : position, taille, transparence,
        auto-masquage, icônes qui lancent de vraies applications.
      </Text>

      {!desktopReady ? (
        <Card style={styles.notice}>
          <Text style={styles.noticeText}>
            💡 Les fenêtres de dock flottantes se lancent depuis l'application bureau (Windows, macOS, Linux).
            Ici, vous pouvez déjà tout configurer.
          </Text>
        </Card>
      ) : null}

      {docks.length === 0 ? (
        <EmptyState
          icon="space-dashboard"
          title="Aucun dock"
          subtitle="Créez votre premier dock : il apparaîtra sur le bord de l'écran que vous choisirez."
        >
          <Button label="+ Créer mon premier dock" onPress={createAndEdit} />
        </EmptyState>
      ) : (
        docks.map((dock) => (
          <Card key={dock.id} style={styles.dockCard}>
            <View style={styles.dockHeader}>
              <View style={styles.dockTitleWrap}>
                <Text style={styles.dockName}>{dock.name}</Text>
                <View style={styles.dockChips}>
                  <Chip label={`${POSITION_LABELS[dock.position]} de l'écran`} color={dock.accentColor} />
                  <Chip label={`${dock.items.length} icône${dock.items.length > 1 ? 's' : ''}`} />
                  {dock.autoHide ? <Chip label="Auto-masquage" color={Colors.gold} /> : null}
                </View>
              </View>
            </View>

            <DockPreview dock={dock} />

            <View style={styles.dockActions}>
              {desktopReady ? (
                <>
                  <Button
                    label="Ouvrir"
                    onPress={() => void openOnDesktop(dock.id)}
                    style={styles.actionButton}
                  />
                  <Button
                    label="Fermer"
                    variant="secondary"
                    onPress={() => void closeOnDesktop(dock.id)}
                    style={styles.actionButton}
                  />
                </>
              ) : null}
              <Button
                label="Modifier"
                variant="secondary"
                onPress={() => router.push({ pathname: '/dock-editor', params: { id: dock.id } })}
                style={styles.actionButton}
              />
              <Button
                label="Supprimer"
                variant="danger"
                onPress={() => removeDock(dock.id)}
                style={styles.actionButton}
              />
            </View>
          </Card>
        ))
      )}

      {docks.length > 0 ? (
        <>
          <SectionHeader title="Nouveau" />
          <Button label="+ Créer un dock" onPress={createAndEdit} />
        </>
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
    lineHeight: 22,
    marginTop: Spacing.xs,
  },
  notice: {
    marginTop: Spacing.lg,
  },
  noticeText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  dockCard: {
    marginTop: Spacing.lg,
  },
  dockHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  dockTitleWrap: {
    flex: 1,
  },
  dockName: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  dockChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  dockActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    minWidth: 110,
  },
});
