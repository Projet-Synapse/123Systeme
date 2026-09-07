// Powered by OnSpace.AI — tuile d'information du tableau de bord adaptatif.
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

interface StatusCardProps {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}

export function StatusCard({ icon, label, value, hint, accent = Colors.primary }: StatusCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
        <MaterialIcons name={icon as keyof typeof MaterialIcons.glyphMap} size={18} color={accent} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.value} numberOfLines={2}>
        {value}
      </Text>
      {hint ? (
        <Text style={styles.hint} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    borderWidth: 1,
    flex: 1,
    gap: Spacing.xs,
    minWidth: 140,
    padding: Spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: Radius.sm,
    height: 34,
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    width: 34,
  },
  label: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    textTransform: 'uppercase',
  },
  value: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.xs,
  },
});
