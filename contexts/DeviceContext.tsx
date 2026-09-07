// Powered by OnSpace.AI — vue d'ensemble de l'appareil, adaptée à la plateforme.
// Sur le bureau, les informations viennent du processus Electron (OS réel,
// processeur, mémoire, batterie) ; sur mobile, d'expo-device et expo-network.
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';
import { currentPlatform, desktop, isDesktop, type AppPlatform, type SystemInfo } from '@/services/platform';

export type DeviceSnapshot = {
  platform: AppPlatform;
  /** Nom commercial : modèle mobile, ou nom d'hôte sur le bureau. */
  deviceName: string | null;
  osName: string | null;
  osVersion: string | null;
  cpuModel: string | null;
  cpuCount: number | null;
  totalMemoryGb: number | null;
  uptimeHours: number | null;
  battery: { level: number; charging: boolean } | null;
  online: boolean | null;
};

interface DeviceContextValue {
  snapshot: DeviceSnapshot | null;
  /** Largeur d'écran, pour adapter les grilles et colonnes. */
  width: number;
  isWide: boolean;
  refresh: () => Promise<void>;
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

async function buildSnapshot(): Promise<DeviceSnapshot> {
  const bridge = desktop();
  let online: boolean | null = null;
  try {
    const state = await Network.getNetworkStateAsync();
    online = state.isInternetReachable ?? state.isConnected ?? null;
  } catch {
    online = null;
  }

  if (bridge) {
    let info: SystemInfo | null = null;
    try {
      info = await bridge.systemInfo();
    } catch {
      info = null;
    }
    if (info) {
      return {
        platform: currentPlatform(),
        deviceName: info.hostname,
        osName: info.platform === 'win32' ? 'Windows' : info.platform === 'darwin' ? 'macOS' : 'Linux',
        osVersion: info.osRelease,
        cpuModel: info.cpuModel ?? null,
        cpuCount: info.cpuCount,
        totalMemoryGb: info.totalMemoryGb,
        uptimeHours: info.uptimeHours,
        battery: info.battery ?? null,
        online,
      };
    }
  }

  return {
    platform: currentPlatform(),
    deviceName: Device.modelName ?? Device.deviceName,
    osName: Device.osName,
    osVersion: Device.osVersion,
    cpuModel: null,
    cpuCount: null,
    totalMemoryGb: null,
    uptimeHours: null,
    battery: null,
    online,
  };
}

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<DeviceSnapshot | null>(null);
  const { width } = useWindowDimensions();

  const refresh = useCallback(async () => {
    setSnapshot(await buildSnapshot());
  }, []);

  useEffect(() => {
    void refresh();
    // L'uptime et la batterie bougent : un rafraîchissement périodique suffit,
    // inutile de surveiller en continu.
    const interval = setInterval(() => void refresh(), 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const value = useMemo<DeviceContextValue>(
    () => ({
      snapshot,
      width,
      isWide: width >= (isDesktop() ? 720 : 480),
      refresh,
    }),
    [snapshot, width, refresh],
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDevice(): DeviceContextValue {
  const context = useContext(DeviceContext);
  if (!context) throw new Error('useDevice doit être utilisé dans <DeviceProvider>');
  return context;
}
