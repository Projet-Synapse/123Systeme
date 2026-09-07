// Powered by OnSpace.AI — widgets de l'utilisateur : ajout, édition, ordre.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '@/constants/config';
import { loadJson, saveJson, uid } from '@/services/storage';
import type { WidgetConfig, WidgetKind } from '@/types';

export const WIDGET_KIND_LABELS: Record<WidgetKind, { title: string; icon: string; hint: string }> = {
  clock: { title: 'Horloge', icon: 'schedule', hint: 'Heure et date en direct' },
  notes: { title: 'Note', icon: 'sticky-note-2', hint: 'Pense-bête éditable' },
  shortcuts: { title: 'Raccourcis', icon: 'grid-view', hint: 'Lancements rapides' },
  monitor: { title: 'Moniteur', icon: 'monitor', hint: "Système en un coup d'œil" },
  countdown: { title: 'Compte à rebours', icon: 'hourglass-top', hint: 'Jours avant une échéance' },
};

interface WidgetsContextValue {
  widgets: WidgetConfig[];
  addWidget: (kind: WidgetKind) => WidgetConfig;
  updateWidget: (id: string, patch: Partial<Omit<WidgetConfig, 'id' | 'kind'>>) => void;
  removeWidget: (id: string) => void;
  /** Déplace un widget d'un cran vers le haut (versHaut = true) ou le bas. */
  moveWidget: (id: string, up: boolean) => void;
}

const WidgetsContext = createContext<WidgetsContextValue | null>(null);

function defaultTitle(kind: WidgetKind): string {
  return WIDGET_KIND_LABELS[kind].title;
}

export function WidgetsProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadJson<WidgetConfig[]>(STORAGE_KEYS.widgets, []);
      if (!cancelled) {
        setWidgets(stored);
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveJson(STORAGE_KEYS.widgets, widgets);
  }, [widgets, hydrated]);

  const addWidget = useCallback((kind: WidgetKind) => {
    const widget: WidgetConfig = {
      id: uid('widget'),
      kind,
      title: defaultTitle(kind),
      size: 'medium',
      options: kind === 'notes' ? { text: '' } : {},
      position: 0,
    };
    setWidgets((prev) => [widget, ...prev.map((w) => ({ ...w, position: w.position + 1 }))]);
    return widget;
  }, []);

  const updateWidget = useCallback((id: string, patch: Partial<Omit<WidgetConfig, 'id' | 'kind'>>) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const moveWidget = useCallback((id: string, up: boolean) => {
    setWidgets((prev) => {
      const sorted = [...prev].sort((a, b) => a.position - b.position);
      const index = sorted.findIndex((w) => w.id === id);
      const swapWith = up ? index - 1 : index + 1;
      if (index === -1 || swapWith < 0 || swapWith >= sorted.length) return prev;
      [sorted[index], sorted[swapWith]] = [sorted[swapWith], sorted[index]];
      return sorted.map((w, i) => ({ ...w, position: i }));
    });
  }, []);

  const value = useMemo<WidgetsContextValue>(
    () => ({ widgets, addWidget, updateWidget, removeWidget, moveWidget }),
    [widgets, addWidget, updateWidget, removeWidget, moveWidget],
  );

  return <WidgetsContext.Provider value={value}>{children}</WidgetsContext.Provider>;
}

export function useWidgets(): WidgetsContextValue {
  const context = useContext(WidgetsContext);
  if (!context) throw new Error('useWidgets doit être utilisé dans <WidgetsProvider>');
  return context;
}
