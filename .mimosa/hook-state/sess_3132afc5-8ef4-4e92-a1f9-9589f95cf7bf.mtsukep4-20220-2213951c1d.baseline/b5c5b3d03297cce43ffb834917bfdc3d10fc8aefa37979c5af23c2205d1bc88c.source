// Powered by OnSpace.AI — domain model shared by every layer of the app

// ── Modes : un ensemble cohérent de personnalisations ───────────────────────

export type ModeSettings = {
  /** Interface sombre de l'application. */
  darkUi: boolean;
  /** Ne pas déranger : masque les distractions (bannières, aperçus). */
  doNotDisturb: boolean;
  /** Profil de volume souhaité, en pourcentage. */
  volume: number;
  /** Luminosité suggérée, en pourcentage. */
  brightness: number;
  /** Économie d'énergie : réduit les animations et l'activité de fond. */
  powerSaver: boolean;
  /** Couleur d'accent appliquée à toute l'interface. */
  accentColor: string;
  /** Note libre : piste de fond d'écran, disposition, ambiance… */
  note: string;
};

export type Mode = {
  id: string;
  name: string;
  /** Nom d'icône MaterialIcons. */
  icon: string;
  color: string;
  settings: ModeSettings;
  /** Modes fournis par défaut : non supprimables. */
  isSystem: boolean;
};

export const MODE_COLORS = ['#7C5CFC', '#FF6B6B', '#00CEC9', '#FDCB6E', '#55EFC4', '#74B9FF'];

// ── Routines : ce qui active un mode ────────────────────────────────────────

export type RoutineTrigger =
  { type: 'manual' } | { type: 'startup' } | { type: 'schedule'; days: number[]; time: string };

export const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export type Routine = {
  id: string;
  modeId: string;
  trigger: RoutineTrigger;
  enabled: boolean;
};

// ── Widgets ─────────────────────────────────────────────────────────────────

export type WidgetKind = 'clock' | 'notes' | 'shortcuts' | 'monitor' | 'countdown';

export type WidgetSize = 'small' | 'medium' | 'wide';

export type WidgetConfig = {
  id: string;
  kind: WidgetKind;
  title: string;
  size: WidgetSize;
  /** Options libres selon le type (texte, cible, date…). */
  options: {
    text?: string;
    /** Pour les raccourcis : libellés et cibles séparés par des `;`. */
    targets?: string;
    /** Pour les comptes à rebours : date cible au format ISO. */
    date?: string;
  };
  /** Position dans la grille, 0 en premier. */
  position: number;
};

// ── Stardocks ───────────────────────────────────────────────────────────────

export type DockPosition = 'bottom' | 'top' | 'left' | 'right';

export type DockItemKind = 'app' | 'url' | 'folder';

export type DockItem = {
  id: string;
  label: string;
  /** Nom d'icône MaterialIcons. */
  icon: string;
  color?: string;
  kind: DockItemKind;
  /** Chemin d'exécutable/dossier ou URL https. */
  target: string;
};

export type DockConfig = {
  id: string;
  name: string;
  position: DockPosition;
  /** Taille des icônes, 32 à 96 px. */
  size: number;
  /** Effet loupe au survol des icônes. */
  magnification: boolean;
  /** Le dock se glisse hors de l'écran jusqu'à ce que le curseur l'appelle. */
  autoHide: boolean;
  /** Opacité du plateau, 0.3 à 1. */
  opacity: number;
  accentColor: string;
  items: DockItem[];
};

// ── Réglages globaux ────────────────────────────────────────────────────────

export type AppSettings = {
  /** Identifiant du mode actif, ou null. */
  activeModeId: string | null;
  /** Lance les routines « au démarrage » à l'ouverture de l'app. */
  startupRoutinesEnabled: boolean;
};
