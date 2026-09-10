// Powered by OnSpace.AI — retour tactile léger pour les actions notables.
// No-op sur le web où expo-haptics n'a pas d'équivalent.
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function notifyHaptic(): void {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
    // Appareil sans moteur : le retour visuel suffit.
  });
}
