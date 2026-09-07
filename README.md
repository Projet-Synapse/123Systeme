# 123Système

Personnalisez votre appareil au-delà des réglages classiques, construit avec
**Expo / React Native**. Un seul code source pour **iOS, Android, Web** et le
**bureau (Linux, macOS, Windows)** via Electron. Tout est **local d'abord** :
aucun compte, aucun serveur, les configurations vivent sur l'appareil.

## Ce que fait l'app

- **Modes & routines** — des ambiances complètes (Nuit, Travail, Jeu, Lecture,
  Économie…) activées en un appui, ou automatiquement par routine : au
  démarrage de l'app, ou selon un horaire hebdomadaire. Chaque mode règle
  volume, luminosité, ne-pas-déranger, économie d'énergie et couleur d'accent.
- **Widgets** — horloge vivante, note, raccourcis lançables, moniteur système
  (mesures réelles sur le bureau) et compte à rebours, dans une grille qui
  s'adapte à la plateforme et à la largeur d'écran.
- **Stardocks** — la pièce maîtresse : vos propres docks de bureau, gratuits
  et entièrement personnalisables, là où les alternatives connues sont
  payantes ou limitées. Position (bas, haut, gauche, droite), taille des
  icônes, transparence, effet loupe, auto-masquage au bord de l'écran, et des
  icônes qui lancent de vraies applications, dossiers ou sites web. Sur le
  bureau, chaque dock est une **vraie fenêtre Electron** sans chrome, flottante
  au-dessus de tout.

## 1. Démarrage

```bash
pnpm install
pnpm start                 # serveur de développement Expo
```

| Commande                           | Effet                                               |
| ---------------------------------- | --------------------------------------------------- |
| `pnpm start`                       | Serveur Expo (QR code, choix de la plateforme)      |
| `pnpm run android` / `ios` / `web` | Lance directement sur une plateforme                |
| `pnpm run desktop:dev`             | Expo web + fenêtre Electron en rechargement à chaud |
| `pnpm run verify`                  | `typecheck` + `lint` + `format:check` avant commit  |

## 2. Qualité de code

ESLint en _flat config_ ([eslint.config.js](eslint.config.js)) au-dessus de
`eslint-config-expo`, avec Prettier branché en fin de chaîne.

```bash
pnpm run lint          # 0 erreur attendue
pnpm run lint:fix
pnpm run format        # Prettier sur tout le dépôt
pnpm run typecheck     # tsc --noEmit
pnpm run verify        # typecheck + lint + format:check
```

Points de configuration notables :

- `desktop/` et `scripts/` sont traités comme du CommonJS Node, pas du TypeScript.
- `react/no-unescaped-entities` est désactivé : l'interface est en français et les
  apostrophes dans les textes sont normales.
- Les avertissements `react-hooks/exhaustive-deps` restent en `warn`.

Le workflow [`ci.yml`](.github/workflows/ci.yml) rejoue `typecheck`, `lint` et
`format:check` sur chaque push et PR. Les hooks Husky (`.husky/`) rejouent la
même vérification en local : `lint-staged` au commit, vérification complète au
push.

## 3. Desktop (Electron)

Le bundle web Expo est servi au processus Electron via `scripts/build-desktop.js`,
avec un schéma `app://` en production (voir `desktop/main.js`). Les docks sont
des fenêtres indépendantes (`transparent`, `frameless`, `alwaysOnTop`) pilotées
par IPC : `dock:open`, `dock:configure`, `dock:close`, `dock:launch`,
`docks:broadcast`.

```bash
pnpm run desktop:build          # build de la plateforme courante
pnpm run desktop:build:win      # Windows uniquement (nsis)
pnpm run desktop:release        # build + publication GitHub Releases
```

## 4. Releases

Taguer un commit (`git tag v0.1.0 && git push --tags`) déclenche le workflow
[`release-desktop.yml`](.github/workflows/release-desktop.yml) : vérification,
puis installateurs Linux (AppImage/deb), macOS (dmg, non signé sans
certificat) et Windows (NSIS), publiés sur GitHub Releases. Les mises à jour
in-app (electron-updater) lisent ce même flux.

## 5. Architecture

```
app/            Écrans expo-router : (tabs)/, mode-editor, dock-editor, dock
components/     ui/ (primitives) + feature/ (cartes métier)
contexts/       Device, Modes (moteur de routines), Widgets, Docks
services/       platform.ts (pont Electron typé), storage.ts (AsyncStorage)
constants/      theme.ts (palette Synapse), config.ts
desktop/        Processus principal + preload Electron
types/          Modèle de données partagé
```

Données persistées en local (`AsyncStorage`) : `systeme.modes`,
`systeme.routines`, `systeme.widgets`, `systeme.docks`, `systeme.settings`.
