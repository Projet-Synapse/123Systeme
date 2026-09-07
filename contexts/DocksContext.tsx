// Powered by OnSpace.AI — configuration des Stardocks et pont vers les vraies
// fenêtres Electron. Sur mobile / navigateur, la collection reste éditable ;
// seules les fenêtres réelles sont réservées au bureau.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '@/constants/config';
import { desktop, isDesktop } from '@/services/platform';
import { loadJson, saveJson, uid } from '@/services/storage';
import type { DockConfig, DockItem } from '@/types';

interface DocksContextValue {
  docks: DockConfig[];
  /** true quand au moins une fenêtre de dock est ouverte côté Electron. */
  desktopReady: boolean;
  addDock: (dock?: Partial<DockConfig>) => DockConfig;
  updateDock: (id: string, patch: Partial<Omit<DockConfig, 'id'>>) => void;
  removeDock: (id: string) => void;
  addItem: (dockId: string, item: Omit<DockItem, 'id'>) => void;
  updateItem: (dockId: string, itemId: string, patch: Partial<Omit<DockItem, 'id'>>) => void;
  removeItem: (dockId: string, itemId: string) => void;
  /** Ouvre (ou met à jour) la fenêtre réelle, puis prévient les autres. */
  openOnDesktop: (dockId: string) => Promise<string | null>;
  closeOnDesktop: (dockId: string) => Promise<void>;
  launchTarget: (target: string) => Promise<string | null>;
}

const DocksContext = createContext<DocksContextValue | null>(null);

/** Raccourcis de départ selon l'OS : des cibles qui existent vraiment. */
function starterItems(platform: 'linux' | 'darwin' | 'win32' | undefined): DockItem[] {
  const base: DockItem[] = [
    {
      id: uid('item'),
      label: 'Navigateur',
      icon: 'public',
      kind: 'url',
      target: 'https://github.com/Projet-Synapse',
    },
  ];
  if (platform === 'win32') {
    base.push(
      { id: uid('item'), label: 'Explorateur', icon: 'folder', kind: 'folder', target: 'C:\\' },
      { id: uid('item'), label: 'Terminal', icon: 'terminal', kind: 'app', target: 'cmd.exe' },
      { id: uid('item'), label: 'Bloc-notes', icon: 'edit-note', kind: 'app', target: 'notepad.exe' },
    );
  } else if (platform === 'darwin') {
    base.push(
      { id: uid('item'), label: 'Finder', icon: 'folder', kind: 'folder', target: '/' },
      {
        id: uid('item'),
        label: 'Terminal',
        icon: 'terminal',
        kind: 'app',
        target: '/System/Applications/Utilities/Terminal.app',
      },
    );
  } else if (platform === 'linux') {
    base.push(
      { id: uid('item'), label: 'Dossier perso', icon: 'folder', kind: 'folder', target: '~' },
      { id: uid('item'), label: 'Terminal', icon: 'terminal', kind: 'app', target: 'x-terminal-emulator' },
    );
  }
  return base;
}

export function DocksProvider({ children }: { children: ReactNode }) {
  const [docks, setDocks] = useState<DockConfig[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadJson<DockConfig[]>(STORAGE_KEYS.docks, []);
      if (!cancelled) {
        setDocks(stored);
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveJson(STORAGE_KEYS.docks, docks);
  }, [docks, hydrated]);

  // ── CRUD docks ─────────────────────────────────────────────────────────────
  const addDock = useCallback((dock?: Partial<DockConfig>) => {
    const created: DockConfig = {
      id: uid('dock'),
      name: dock?.name ?? 'Nouveau dock',
      position: dock?.position ?? 'bottom',
      size: dock?.size ?? 56,
      magnification: dock?.magnification ?? true,
      autoHide: dock?.autoHide ?? false,
      opacity: dock?.opacity ?? 0.92,
      accentColor: dock?.accentColor ?? '#7C5CFC',
      items: dock?.items ?? starterItems(desktop()?.platform),
    };
    setDocks((prev) => [...prev, created]);
    return created;
  }, []);

  const updateDock = useCallback((id: string, patch: Partial<Omit<DockConfig, 'id'>>) => {
    setDocks((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const removeDock = useCallback((id: string) => {
    setDocks((prev) => prev.filter((d) => d.id !== id));
    const bridge = desktop();
    if (bridge) void bridge.closeDock(id);
  }, []);

  // ── CRUD éléments ──────────────────────────────────────────────────────────
  const addItem = useCallback((dockId: string, item: Omit<DockItem, 'id'>) => {
    setDocks((prev) =>
      prev.map((d) => (d.id === dockId ? { ...d, items: [...d.items, { ...item, id: uid('item') }] } : d)),
    );
  }, []);

  const updateItem = useCallback((dockId: string, itemId: string, patch: Partial<Omit<DockItem, 'id'>>) => {
    setDocks((prev) =>
      prev.map((d) =>
        d.id === dockId
          ? { ...d, items: d.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
          : d,
      ),
    );
  }, []);

  const removeItem = useCallback((dockId: string, itemId: string) => {
    setDocks((prev) =>
      prev.map((d) => (d.id === dockId ? { ...d, items: d.items.filter((it) => it.id !== itemId) } : d)),
    );
  }, []);

  // ── Fenêtres réelles (bureau uniquement) ───────────────────────────────────
  const openOnDesktop = useCallback(
    async (dockId: string): Promise<string | null> => {
      const bridge = desktop();
      if (!bridge) return 'Les fenêtres de dock sont disponibles dans la version bureau.';
      const config = docks.find((d) => d.id === dockId);
      if (!config) return 'Dock introuvable.';
      const opened = await bridge.openDock(config);
      if (!opened.ok) return opened.error ?? 'Impossible d’ouvrir le dock.';
      await bridge.broadcastDocksUpdated();
      return null;
    },
    [docks],
  );

  const closeOnDesktop = useCallback(async (dockId: string): Promise<void> => {
    const bridge = desktop();
    if (bridge) await bridge.closeDock(dockId);
  }, []);

  const launchTarget = useCallback(async (target: string): Promise<string | null> => {
    const bridge = desktop();
    if (!bridge) return 'Lancement disponible dans la version bureau.';
    const result = await bridge.launchTarget(target);
    return result.ok ? null : (result.error ?? 'Lancement impossible.');
  }, []);

  const value = useMemo<DocksContextValue>(
    () => ({
      docks,
      desktopReady: isDesktop(),
      addDock,
      updateDock,
      removeDock,
      addItem,
      updateItem,
      removeItem,
      openOnDesktop,
      closeOnDesktop,
      launchTarget,
    }),
    [
      docks,
      addDock,
      updateDock,
      removeDock,
      addItem,
      updateItem,
      removeItem,
      openOnDesktop,
      closeOnDesktop,
      launchTarget,
    ],
  );

  return <DocksContext.Provider value={value}>{children}</DocksContext.Provider>;
}

export function useDocks(): DocksContextValue {
  const context = useContext(DocksContext);
  if (!context) throw new Error('useDocks doit être utilisé dans <DocksProvider>');
  return context;
}
