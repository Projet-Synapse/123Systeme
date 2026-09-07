// Powered by OnSpace.AI
/** Where the update tracker sends users whose platform cannot self-install. */
export const RELEASES_URL = 'https://github.com/Projet-Synapse/123Systeme/releases/latest';

/** Clés de persistance locale — un préfixe commun, une clé par domaine. */
export const STORAGE_KEYS = {
  modes: 'systeme.modes',
  routines: 'systeme.routines',
  widgets: 'systeme.widgets',
  docks: 'systeme.docks',
  settings: 'systeme.settings',
} as const;
