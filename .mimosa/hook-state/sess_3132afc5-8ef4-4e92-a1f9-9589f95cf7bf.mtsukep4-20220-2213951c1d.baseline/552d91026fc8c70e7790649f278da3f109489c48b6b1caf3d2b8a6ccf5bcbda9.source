// Powered by OnSpace.AI — Runtime platform detection (mobile / web / desktop)
import { Platform } from 'react-native';
import type { DockConfig } from '@/types';

/** Informations système réelles, servies par le processus Electron. */
export interface SystemInfo {
  platform: 'linux' | 'darwin' | 'win32';
  osRelease: string;
  hostname: string;
  cpuModel?: string;
  cpuCount: number;
  totalMemoryGb: number;
  uptimeHours: number;
  battery?: { level: number; charging: boolean };
}

/** Bridge injected by desktop/preload.js when running inside the Electron shell. */
export interface DesktopBridge {
  platform: 'linux' | 'darwin' | 'win32';
  appVersion: string;
  checkForUpdates: () => Promise<{ updateAvailable: boolean; version?: string; error?: string }>;
  downloadUpdate: () => Promise<{ ok: boolean; error?: string }>;
  /** Quits the app, replaces the installed build, then relaunches. */
  quitAndInstall: () => void;
  /** Turns automatic download + install-on-quit on or off. */
  setAutoUpdate: (enabled: boolean) => void;
  onUpdateEvent: (handler: (event: DesktopUpdateEvent) => void) => () => void;
  /** Opens an https URL in the user's real browser. */
  openExternal: (url: string) => Promise<{ ok: boolean }>;
  systemInfo: () => Promise<SystemInfo>;
  openDock: (config: DockConfig) => Promise<{ ok: boolean; error?: string }>;
  configureDock: (config: DockConfig) => Promise<{ ok: boolean; error?: string }>;
  closeDock: (dockId: string) => Promise<{ ok: boolean; error?: string }>;
  launchTarget: (target: string) => Promise<{ ok: boolean; error?: string }>;
  broadcastDocksUpdated: () => Promise<{ ok: boolean }>;
  onDocksUpdated: (handler: () => void) => () => void;
}

export type DesktopUpdateEvent =
  | { type: 'checking' }
  | { type: 'available'; version: string; releaseNotes?: string }
  | { type: 'not-available'; version: string }
  | { type: 'progress'; percent: number; transferred: number; total: number }
  | { type: 'downloaded'; version: string }
  | { type: 'error'; message: string };

declare global {
  var systemeDesktop: DesktopBridge | undefined;
}

function getBridge(): DesktopBridge | undefined {
  if (typeof globalThis === 'undefined') return undefined;
  return globalThis.systemeDesktop;
}

/** True when the web bundle is running inside the Electron desktop shell. */
export const isDesktop = (): boolean => Platform.OS === 'web' && getBridge() !== undefined;

/** True on a plain browser (not the desktop shell). */
export const isBrowser = (): boolean => Platform.OS === 'web' && !isDesktop();

/** True on iOS or Android. */
export const isNative = (): boolean => Platform.OS === 'ios' || Platform.OS === 'android';

export const desktop = getBridge;

export type AppPlatform = 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'linux';

/** Human-facing platform key, used across the adaptive dashboard. */
export function currentPlatform(): AppPlatform {
  const bridge = getBridge();
  if (bridge) {
    if (bridge.platform === 'darwin') return 'macos';
    if (bridge.platform === 'win32') return 'windows';
    return 'linux';
  }
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
}

export const PLATFORM_LABELS: Record<AppPlatform, string> = {
  ios: 'iPhone / iPad',
  android: 'Android',
  web: 'Navigateur',
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
};
