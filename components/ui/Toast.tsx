// Powered by OnSpace.AI — retour éphémère pour les actions silencieuses
// (activation de mode, déplacements…). Apparaît en bas, s'efface seul.
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

interface ToastProps {
  message: string | null;
  onDone?: () => void;
  /** Durée d'affichage en ms. */
  duration?: number;
}

export function Toast({ message, onDone, duration = 2200 }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) {
      opacity.setValue(0);
      return;
    }
    Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 260, useNativeDriver: true }).start(({ finished }) => {
        if (finished) onDone?.();
      });
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, opacity, onDone]);

  if (!message) return null;

  return (
    <Animated.View accessibilityLiveRegion="polite" pointerEvents="none" style={[styles.toast, { opacity }]}>
      <Animated.Text style={styles.text} numberOfLines={2}>
        {message}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'center',
    backgroundColor: Colors.surfaceMid,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    borderWidth: 1,
    bottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    position: 'absolute',
    maxWidth: 480,
  },
  text: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
});
