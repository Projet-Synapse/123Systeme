// Powered by OnSpace.AI — couleur d'accent offerte par le mode actif. Un mode
// actif colore l'interface (promesse du modèle de données) ; sans mode, la
// palette Synapse par défaut reste de mise.
import { useModes } from '@/contexts/ModesContext';
import { Colors } from '@/constants/theme';

export function useAccent(): string {
  const { activeMode } = useModes();
  return activeMode?.settings.accentColor ?? activeMode?.color ?? Colors.primary;
}
