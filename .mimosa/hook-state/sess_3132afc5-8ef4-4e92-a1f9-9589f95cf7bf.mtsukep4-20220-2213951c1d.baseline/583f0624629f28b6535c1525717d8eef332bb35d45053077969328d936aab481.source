// Powered by OnSpace.AI — Electron preload bridge
//
// The renderer runs the Expo web bundle with contextIsolation on and node
// integration off. Everything it may ask of the OS goes through this narrow,
// explicitly enumerated surface — see services/platform.ts for the typed view.
const { contextBridge, ipcRenderer } = require('electron');

const UPDATE_CHANNEL = 'updates:event';
const DOCKS_CHANNEL = 'docks:updated';

contextBridge.exposeInMainWorld('systemeDesktop', {
  platform: process.platform,
  appVersion: ipcRenderer.sendSync('app:version'),

  // ── Updates ──────────────────────────────────────────────────────────────
  checkForUpdates: () => ipcRenderer.invoke('updates:check'),
  downloadUpdate: () => ipcRenderer.invoke('updates:download'),
  /** Replaces the installed build with the downloaded one and relaunches. */
  quitAndInstall: () => ipcRenderer.send('updates:install'),
  /** Turns automatic download + install-on-quit on or off. */
  setAutoUpdate: (enabled) => ipcRenderer.send('updates:set-auto', enabled),
  onUpdateEvent: (handler) => {
    const listener = (_event, payload) => handler(payload);
    ipcRenderer.on(UPDATE_CHANNEL, listener);
    return () => ipcRenderer.removeListener(UPDATE_CHANNEL, listener);
  },

  // ── Shell ────────────────────────────────────────────────────────────────
  /** Opens an https URL in the user's real browser. */
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),

  // ── System information (adaptive dashboard) ──────────────────────────────
  systemInfo: () => ipcRenderer.invoke('system:info'),

  // ── Stardocks ────────────────────────────────────────────────────────────
  /** Spawns (or refuses to duplicate) a frameless dock window. */
  openDock: (config) => ipcRenderer.invoke('dock:open', config),
  /** Re-centers / resizes an open dock after its config changed. */
  configureDock: (config) => ipcRenderer.invoke('dock:configure', config),
  /** Closes an open dock window. */
  closeDock: (dockId) => ipcRenderer.invoke('dock:close', dockId),
  /** Launches an app path, folder or URL from a dock item. */
  launchTarget: (target) => ipcRenderer.invoke('dock:launch', target),
  /** Tells every open dock window to reload its config (editor saved). */
  broadcastDocksUpdated: () => ipcRenderer.invoke('docks:broadcast'),
  /** Fires in dock windows when the main window saved a new dock config. */
  onDocksUpdated: (handler) => {
    const listener = () => handler();
    ipcRenderer.on(DOCKS_CHANNEL, listener);
    return () => ipcRenderer.removeListener(DOCKS_CHANNEL, listener);
  },
});
