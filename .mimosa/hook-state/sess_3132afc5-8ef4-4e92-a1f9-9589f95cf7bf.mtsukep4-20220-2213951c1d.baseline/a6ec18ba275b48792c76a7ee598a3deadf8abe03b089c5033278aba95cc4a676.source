// Powered by OnSpace.AI — modes, routines et le moteur qui les applique.
//
// Un mode est un ensemble cohérent de personnalisations ; une routine décide
// quand l'activer (manuellement, au démarrage, ou selon un horaire hebdo).
// Le moteur tourne côté client : chaque minute, il compare l'heure locale aux
// horaires actifs et bascule le mode au bon moment.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { STORAGE_KEYS } from '@/constants/config';
import { loadJson, saveJson, uid } from '@/services/storage';
import type { AppSettings, Mode, ModeSettings, Routine, RoutineTrigger } from '@/types';

// ── Modes fournis : modifiables mais non supprimables ────────────────────────

const defaultSettings: ModeSettings = {
  darkUi: true,
  doNotDisturb: false,
  volume: 70,
  brightness: 80,
  powerSaver: false,
  accentColor: '#7C5CFC',
  note: '',
};

function systemMode(
  id: string,
  name: string,
  icon: string,
  color: string,
  overrides: Partial<ModeSettings>,
): Mode {
  return { id, name, icon, color, settings: { ...defaultSettings, ...overrides }, isSystem: true };
}

export const SYSTEM_MODES: Mode[] = [
  systemMode('mode_night', 'Nuit', 'nightlight', '#7C5CFC', {
    doNotDisturb: true,
    volume: 15,
    brightness: 30,
    accentColor: '#7C5CFC',
    note: 'Lumière tamisée, notifications coupées.',
  }),
  systemMode('mode_work', 'Travail', 'work', '#00CEC9', {
    doNotDisturb: true,
    volume: 40,
    brightness: 90,
    accentColor: '#00CEC9',
    note: 'Concentration : plein jour, alertes réduites.',
  }),
  systemMode('mode_game', 'Jeu', 'sports-esports', '#FF6B6B', {
    doNotDisturb: true,
    volume: 100,
    brightness: 100,
    accentColor: '#FF6B6B',
    note: 'Plein potentiel, aucune interruption.',
  }),
  systemMode('mode_reading', 'Lecture', 'menu-book', '#FDCB6E', {
    volume: 25,
    brightness: 60,
    accentColor: '#FDCB6E',
    note: 'Confort visuel pour les longues lectures.',
  }),
  systemMode('mode_eco', 'Économie', 'eco', '#55EFC4', {
    volume: 30,
    brightness: 50,
    powerSaver: true,
    accentColor: '#55EFC4',
    note: 'Réduit animations et activité de fond.',
  }),
];

const DEFAULT_SETTINGS: AppSettings = {
  activeModeId: null,
  startupRoutinesEnabled: true,
};

interface ModesContextValue {
  modes: Mode[];
  routines: Routine[];
  settings: AppSettings;
  activeMode: Mode | null;
  addMode: (mode: Omit<Mode, 'id' | 'isSystem'>) => Mode;
  updateMode: (id: string, patch: Partial<Omit<Mode, 'id'>>) => void;
  removeMode: (id: string) => void;
  addRoutine: (modeId: string, trigger: RoutineTrigger) => Routine;
  updateRoutine: (id: string, patch: Partial<Omit<Routine, 'id'>>) => void;
  removeRoutine: (id: string) => void;
  activateMode: (id: string | null) => void;
  setStartupRoutinesEnabled: (enabled: boolean) => void;
}

const ModesContext = createContext<ModesContextValue | null>(null);

/** "HH:MM" de l'heure locale, arrondie à la minute. */
function nowKey(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Index du jour : 0 = lundi … 6 = dimanche (cohérent avec RoutineTrigger). */
function dayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function ModesProvider({ children }: { children: ReactNode }) {
  const [customModes, setCustomModes] = useState<Mode[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  // routineId → "YYYY-MM-DD HH:MM" déjà déclenché (évite les doubles départs).
  const firedRef = useRef<Record<string, string>>({});

  // ── Hydratation depuis le stockage local ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [storedModes, storedRoutines, storedSettings] = await Promise.all([
        loadJson<Mode[]>(STORAGE_KEYS.modes, []),
        loadJson<Routine[]>(STORAGE_KEYS.routines, []),
        loadJson<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
      ]);
      if (cancelled) return;
      setCustomModes(storedModes);
      setRoutines(storedRoutines);
      setSettings({ ...DEFAULT_SETTINGS, ...storedSettings });
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveJson(STORAGE_KEYS.modes, customModes);
  }, [customModes, hydrated]);
  useEffect(() => {
    if (hydrated) void saveJson(STORAGE_KEYS.routines, routines);
  }, [routines, hydrated]);
  useEffect(() => {
    if (hydrated) void saveJson(STORAGE_KEYS.settings, settings);
  }, [settings, hydrated]);

  const modes = useMemo(() => [...SYSTEM_MODES, ...customModes], [customModes]);
  const activeMode = useMemo(
    () => modes.find((m) => m.id === settings.activeModeId) ?? null,
    [modes, settings.activeModeId],
  );

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const addMode = useCallback((mode: Omit<Mode, 'id' | 'isSystem'>) => {
    const created: Mode = { ...mode, id: uid('mode'), isSystem: false };
    setCustomModes((prev) => [...prev, created]);
    return created;
  }, []);

  const updateMode = useCallback((id: string, patch: Partial<Omit<Mode, 'id'>>) => {
    // Les modes système ne sont pas modifiables en place : l'éditeur les
    // duplique d'abord en mode personnel (voir mode-editor.tsx).
    setCustomModes((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const removeMode = useCallback((id: string) => {
    setCustomModes((prev) => prev.filter((m) => m.id !== id));
    setRoutines((prev) => prev.filter((r) => r.modeId !== id));
    setSettings((prev) => (prev.activeModeId === id ? { ...prev, activeModeId: null } : prev));
  }, []);

  const addRoutine = useCallback((modeId: string, trigger: RoutineTrigger) => {
    const created: Routine = { id: uid('routine'), modeId, trigger, enabled: true };
    setRoutines((prev) => [...prev, created]);
    return created;
  }, []);

  const updateRoutine = useCallback((id: string, patch: Partial<Omit<Routine, 'id'>>) => {
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const removeRoutine = useCallback((id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const activateMode = useCallback((id: string | null) => {
    setSettings((prev) => ({ ...prev, activeModeId: id }));
  }, []);

  const setStartupRoutinesEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, startupRoutinesEnabled: enabled }));
  }, []);

  // ── Moteur de routines ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!hydrated) return;

    const check = () => {
      const now = new Date();
      const stamp = `${now.toDateString()} ${nowKey(now)}`;

      const fire = (routine: Routine) => {
        // Un mode déjà actif n'a pas besoin d'être réactivé.
        setSettings((prev) =>
          prev.activeModeId === routine.modeId ? prev : { ...prev, activeModeId: routine.modeId },
        );
        firedRef.current[routine.id] = stamp;
      };

      if (settings.startupRoutinesEnabled) {
        for (const routine of routines) {
          if (!routine.enabled || routine.trigger.type !== 'startup') continue;
          if (firedRef.current[routine.id]) continue;
          fire(routine);
        }
      }

      for (const routine of routines) {
        if (!routine.enabled || routine.trigger.type !== 'schedule') continue;
        if (routine.trigger.time !== nowKey(now)) continue;
        if (!routine.trigger.days.includes(dayIndex(now))) continue;
        if (firedRef.current[routine.id] === stamp) continue;
        fire(routine);
      }
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
    // settings.startupRoutinesEnabled est couvert par routines/settings ci-dessous.
  }, [hydrated, routines, settings.startupRoutinesEnabled]);

  const value = useMemo<ModesContextValue>(
    () => ({
      modes,
      routines,
      settings,
      activeMode,
      addMode,
      updateMode,
      removeMode,
      addRoutine,
      updateRoutine,
      removeRoutine,
      activateMode,
      setStartupRoutinesEnabled,
    }),
    [
      modes,
      routines,
      settings,
      activeMode,
      addMode,
      updateMode,
      removeMode,
      addRoutine,
      updateRoutine,
      removeRoutine,
      activateMode,
      setStartupRoutinesEnabled,
    ],
  );

  return <ModesContext.Provider value={value}>{children}</ModesContext.Provider>;
}

export function useModes(): ModesContextValue {
  const context = useContext(ModesContext);
  if (!context) throw new Error('useModes doit être utilisé dans <ModesProvider>');
  return context;
}
