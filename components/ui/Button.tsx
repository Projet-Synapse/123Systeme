// Powered by OnSpace.AI
import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { Colors, Radius, Typography } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  /** Accent du mode actif : colore le variant primaire. */
  accentColor?: string;
  style?: ViewStyle;
}

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: Colors.primary, fg: Colors.textInverse },
  secondary: { bg: Colors.surfaceMid, fg: Colors.textPrimary, border: Colors.border },
  ghost: { bg: 'transparent', fg: Colors.primaryLight, border: Colors.border },
  danger: { bg: 'transparent', fg: Colors.error, border: Colors.error },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  accentColor,
  style,
}: ButtonProps) {
  const theme = VARIANTS[variant];
  const background = variant === 'primary' && accentColor ? accentColor : theme.bg;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background, borderColor: theme.border ?? 'transparent' },
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.fg} />
      ) : (
        <Text style={[styles.label, { color: theme.fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 46,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
