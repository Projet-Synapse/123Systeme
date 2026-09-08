// Powered by OnSpace.AI — Electron main process (Linux / macOS / Windows)
//
// The renderer is the same Expo web bundle the browser build uses. In
// production it is served over a custom `app://` scheme rather than file://,
// because expo-router's client-side routing needs absolute paths and a real
// origin (localStorage, which holds the dock and mode configurations, is
// per-origin).
//
// On top of the main window, the app can spawn frameless dock windows — the
// "Stardocks". Each dock is identified by its dockId and renders the /dock
// route; everything it may ask of the OS (launching an app, repositioning,
// auto-hiding) goes through narrow IPC channels.
const { app, BrowserWindow, ipcMain, screen, shell, protocol, net, powerMonitor } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

const APP_SCHEME = 'app';
const RENDERER_DIR = path.join(__dirname, 'renderer');
const DEV_SERVER_URL = process.env.SYSTEME_DEV_SERVER_URL || 'http://localhost:8081';
const isDev = !app.isPackaged;

// Dock geometry: padding around the icon row and gap between icons. The
// renderer sizes icons itself; the window just needs to fit them.
const DOCK_PADDING = 10;
const DOCK_GAP = 8;
const DOCK_MARGIN = 8;
// How close (px) the cursor must get to the screen edge for an auto-hidden
// dock to slide back in.
const AUTO_HIDE_TRIGGER = 4;
const AUTO_HIDE_POLL_MS = 150;

log.transports.file.level = 'info';
autoUpdater.logger = log;
// Default to a fully manual pipeline so the user is never surprised by a
// restart; see `updates:download` / `updates:install` below. The settings
// screen can flip both flags via `updates:set-auto`.
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

// Le nom de l'app contient un « è », qui se retrouve dans le User-Agent.
// Les requêtes du renderer passées à protocol.handle voient leurs en-têtes
// reconstitués par undici, qui exige des ByteString (octets ≤ 255) : le « è »
// y arrive re-décodé en U+FFFD (65533) et la conversion lève une TypeError —
// chaque requête de ressource échouait, d'où la page blanche au lancement.
// On force l'ASCII dans l'User-Agent uniquement ; le nom accentué reste
// utilisé partout ailleurs (installeur, barre de titre, menus).
app.userAgentFallback = String(app.userAgentFallback || '').replaceAll('123Système', '123Systeme');

// The preload reads this synchronously; registered at module load so it is
// always answered before the first window is created.
ipcMain.on('app:version', (event) => {
  event.returnValue = app.getVersion();
});

let mainWindow = null;

// dockId → { win, autoHideTimer, hidden }
const docks = new Map();

// The custom scheme must be registered before `app.whenReady()`.
protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
  },
]);

// ── Single instance: a second launch just focuses the existing one ──────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function resolveRendererFile(pathname) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html';
  const resolved = path.resolve(RENDERER_DIR, relative);

  // Never serve anything outside the renderer directory.
  if (resolved !== RENDERER_DIR && !resolved.startsWith(RENDERER_DIR + path.sep)) return null;

  const candidates = path.extname(resolved)
    ? [resolved]
    : // `expo export` emits one .html per route (dock → dock.html), so a
      // reload deep in the app should land on that route's own document.
      [`${resolved}.html`, path.join(resolved, 'index.html'), resolved];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function registerAppProtocol() {
  protocol.handle(APP_SCHEME, async (request) => {
    const { pathname } = new URL(request.url);
    const file = resolveRendererFile(pathname);

    if (file) return net.fetch(pathToFileURL(file).toString());

    // Unknown path: hand it to expo-router, which resolves it client-side.
    const fallback = path.join(RENDERER_DIR, 'index.html');
    if (fs.existsSync(fallback)) return net.fetch(pathToFileURL(fallback).toString());
    return new Response('Not found', { status: 404 });
  });
}

function rendererUrlFor(route) {
  return isDev ? `${DEV_SERVER_URL}${route}` : `${APP_SCHEME}://local${route}`;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: '#0F0E17',
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Anything that tries to open a new window goes to the real browser instead.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.loadURL(DEV_SERVER_URL);
  } else {
    mainWindow.loadURL(`${APP_SCHEME}://local/index.html`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── Stardocks: frameless dock windows ───────────────────────────────────────

/** Window size that fits the dock's icon grid for its current config. */
function dockWindowSize(config) {
  const icon = Math.min(Math.max(Number(config.size) || 56, 32), 96);
  const count = Math.max(Array.isArray(config.items) ? config.items.length : 0, 1);
  const vertical = config.position === 'left' || config.position === 'right';
  const iconsSpan = count * icon + (count - 1) * DOCK_GAP + 2 * DOCK_PADDING;
  const thickness = icon + 2 * DOCK_PADDING;
  return vertical ? { width: thickness, height: iconsSpan } : { width: iconsSpan, height: thickness };
}

/** Where the dock sits on the primary display for its position. */
function dockBounds(config) {
  const { width, height } = dockWindowSize(config);
  const workArea = screen.getPrimaryDisplay().workArea;
  const centerX = workArea.x + Math.round((workArea.width - width) / 2);
  const centerY = workArea.y + Math.round((workArea.height - height) / 2);

  switch (config.position) {
    case 'top':
      return { x: centerX, y: workArea.y + DOCK_MARGIN, width, height };
    case 'left':
      return { x: workArea.x + DOCK_MARGIN, y: centerY, width, height };
    case 'right':
      return { x: workArea.x + workArea.width - width - DOCK_MARGIN, y: centerY, width, height };
    case 'bottom':
    default:
      return { x: centerX, y: workArea.y + workArea.height - height - DOCK_MARGIN, width, height };
  }
}

/** Offscreen rectangle the dock slides to when auto-hidden. */
function hiddenBounds(config) {
  const bounds = dockBounds(config);
  switch (config.position) {
    case 'top':
      return { ...bounds, y: bounds.y - bounds.height - DOCK_MARGIN };
    case 'left':
      return { ...bounds, x: bounds.x - bounds.width - DOCK_MARGIN };
    case 'right':
      return { ...bounds, x: bounds.x + bounds.width + DOCK_MARGIN };
    case 'bottom':
    default:
      return { ...bounds, y: bounds.y + bounds.height + DOCK_MARGIN };
  }
}

function isCursorInTriggerZone(config) {
  const point = screen.getCursorScreenPoint();
  const workArea = screen.getPrimaryDisplay().workArea;

  switch (config.position) {
    case 'top':
      return point.y >= workArea.y && point.y <= workArea.y + AUTO_HIDE_TRIGGER;
    case 'left':
      return point.x >= workArea.x && point.x <= workArea.x + AUTO_HIDE_TRIGGER;
    case 'right':
      return (
        point.x <= workArea.x + workArea.width && point.x >= workArea.x + workArea.width - AUTO_HIDE_TRIGGER
      );
    case 'bottom':
    default:
      return (
        point.y <= workArea.y + workArea.height && point.y >= workArea.y + workArea.height - AUTO_HIDE_TRIGGER
      );
  }
}

function startAutoHide(dockId, config) {
  stopAutoHide(dockId);

  const entry = docks.get(dockId);
  if (!entry || !config.autoHide) return;

  entry.autoHideTimer = setInterval(() => {
    const current = docks.get(dockId);
    if (!current || current.win.isDestroyed()) return stopAutoHide(dockId);

    const shouldShow = isCursorInTriggerZone(config);
    if (shouldShow === !current.hidden) return;

    current.hidden = !shouldShow;
    const bounds = shouldShow ? dockBounds(config) : hiddenBounds(config);
    current.win.setBounds(bounds);
  }, AUTO_HIDE_POLL_MS);
}

function stopAutoHide(dockId) {
  const entry = docks.get(dockId);
  if (entry?.autoHideTimer) {
    clearInterval(entry.autoHideTimer);
    entry.autoHideTimer = null;
  }
}

function sanitizeDockConfig(config) {
  return {
    id: String(config?.id ?? ''),
    position: ['bottom', 'top', 'left', 'right'].includes(config?.position) ? config.position : 'bottom',
    size: Number(config?.size) || 56,
    autoHide: Boolean(config?.autoHide),
    items: Array.isArray(config?.items) ? config.items : [],
  };
}

function createDockWindow(rawConfig) {
  const config = sanitizeDockConfig(rawConfig);
  if (!config.id || docks.has(config.id)) return { ok: false, error: 'Dock déjà ouvert' };

  const win = new BrowserWindow({
    ...dockBounds(config),
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Float above everything, like a real dock; 'screen-saver' beats normal
  // always-on-top windows such as fullscreen apps.
  win.setAlwaysOnTop(true, 'screen-saver');

  docks.set(config.id, { win, autoHideTimer: null, hidden: false });

  win.once('ready-to-show', () => {
    win.showInactive();
    if (config.autoHide) {
      // Start tucked away; the cursor reaching the edge reveals it.
      const entry = docks.get(config.id);
      if (entry) entry.hidden = true;
      win.setBounds(hiddenBounds(config));
    }
  });

  win.on('closed', () => {
    stopAutoHide(config.id);
    docks.delete(config.id);
  });

  win.loadURL(`${rendererUrlFor('/dock')}?dockId=${encodeURIComponent(config.id)}`);
  startAutoHide(config.id, config);
  return { ok: true };
}

ipcMain.handle('dock:open', (_event, config) => createDockWindow(config));

ipcMain.handle('dock:configure', (_event, rawConfig) => {
  const config = sanitizeDockConfig(rawConfig);
  const entry = docks.get(config.id);
  if (!entry || entry.win.isDestroyed()) return { ok: false, error: 'Dock non ouvert' };

  entry.win.setBounds(dockBounds(config));
  entry.hidden = false;
  startAutoHide(config.id, config);
  return { ok: true };
});

ipcMain.handle('dock:close', (_event, dockId) => {
  const entry = docks.get(String(dockId));
  if (!entry) return { ok: false, error: 'Dock non ouvert' };
  stopAutoHide(String(dockId));
  entry.win.close();
  return { ok: true };
});

// The editor saved new docks: every open dock window reloads its config from
// the shared localStorage origin.
ipcMain.handle('docks:broadcast', () => {
  for (const entry of docks.values()) {
    if (!entry.win.isDestroyed()) entry.win.webContents.send('docks:updated');
  }
  return { ok: true };
});

ipcMain.handle('dock:launch', async (_event, target) => {
  if (typeof target !== 'string' || target.length === 0 || target.length > 2048) {
    return { ok: false, error: 'Cible invalide' };
  }
  try {
    if (/^https?:\/\//i.test(target)) {
      await shell.openExternal(target);
    } else {
      const errorMessage = await shell.openPath(target);
      if (errorMessage) return { ok: false, error: errorMessage };
    }
    return { ok: true };
  } catch (error) {
    log.error('[dock] launch failed', error);
    return { ok: false, error: String(error?.message ?? error) };
  }
});

// ── System information for the adaptive dashboard ───────────────────────────
ipcMain.handle('system:info', () => {
  const cpus = os.cpus();
  let battery;
  try {
    const state = powerMonitor.getSystemBatteryState();
    // -1 means "no battery" (desktop PC) — surface null instead.
    if (state.percent >= 0) {
      battery = { level: Math.round(state.percent), charging: state.charging ?? false };
    }
  } catch {
    // powerMonitor needs the app ready; the renderer retries anyway.
  }

  return {
    platform: process.platform,
    osRelease: os.release(),
    hostname: os.hostname(),
    cpuModel: cpus.length > 0 ? cpus[0].model : undefined,
    cpuCount: cpus.length,
    totalMemoryGb: Math.round(os.totalmem() / 1024 ** 3),
    uptimeHours: Math.round(os.uptime() / 3600),
    battery,
  };
});

// ── Update pipeline ─────────────────────────────────────────────────────────
function send(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updates:event', payload);
  }
}

autoUpdater.on('checking-for-update', () => send({ type: 'checking' }));
autoUpdater.on('update-available', (info) =>
  send({ type: 'available', version: info.version, releaseNotes: stringifyNotes(info.releaseNotes) }),
);
autoUpdater.on('update-not-available', (info) => send({ type: 'not-available', version: info.version }));
autoUpdater.on('download-progress', (p) =>
  send({
    type: 'progress',
    percent: Math.round(p.percent),
    transferred: p.transferred,
    total: p.total,
  }),
);
autoUpdater.on('update-downloaded', (info) => send({ type: 'downloaded', version: info.version }));
autoUpdater.on('error', (err) => send({ type: 'error', message: String(err?.message ?? err) }));

function stringifyNotes(notes) {
  if (!notes) return undefined;
  if (typeof notes === 'string') return notes;
  return notes
    .map((n) => n.note)
    .filter(Boolean)
    .join('\n\n');
}

ipcMain.handle('updates:check', async () => {
  if (isDev) return { updateAvailable: false, error: 'Mises à jour désactivées en développement' };
  try {
    const result = await autoUpdater.checkForUpdates();
    const version = result?.updateInfo?.version;
    return { updateAvailable: version !== app.getVersion(), version };
  } catch (error) {
    log.error('[updates] check failed', error);
    return { updateAvailable: false, error: String(error?.message ?? error) };
  }
});

ipcMain.handle('updates:download', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { ok: true };
  } catch (error) {
    log.error('[updates] download failed', error);
    return { ok: false, error: String(error?.message ?? error) };
  }
});

// Quits the app, lets the installer replace the currently installed build, and
// relaunches it — the "désinstalle puis redémarre" step of the update flow.
ipcMain.on('updates:install', () => {
  setImmediate(() => autoUpdater.quitAndInstall(false, true));
});

// With automatic updates on, a found update downloads by itself and the
// installer replaces the build silently the next time the app quits.
ipcMain.on('updates:set-auto', (_event, enabled) => {
  autoUpdater.autoDownload = !!enabled;
  autoUpdater.autoInstallOnAppQuit = !!enabled;
  log.info(`[updates] automatic updates ${enabled ? 'enabled' : 'disabled'}`);
});

ipcMain.handle('shell:open-external', async (_event, url) => {
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return { ok: false };
  await shell.openExternal(url);
  return { ok: true };
});

// ── Lifecycle ───────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  if (!isDev) registerAppProtocol();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  for (const dockId of [...docks.keys()]) {
    stopAutoHide(dockId);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
