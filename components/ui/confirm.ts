// Powered by OnSpace.AI — confirmation avant les actions destructives
// (suppression d'un mode, widget, dock ou routine). Sur le web, Alert est
// mappé nativement par react-native-web : pas de dépendance à ajouter.
import { Alert } from 'react-native';

export function confirmDelete(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'Supprimer',
): void {
  Alert.alert(title, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
