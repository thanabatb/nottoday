"use client";

import { createContext, startTransition, useContext, useSyncExternalStore } from "react";
import {
  APP_STATE_KEY,
  createFullSession,
  createQuickSession,
  defaultAppState,
  getDerivedStats,
  restoreAppState,
} from "@/lib/session-logic";
import type { AppState, FullSessionInput, Preferences } from "@/lib/types";

interface AppStateContextValue {
  appState: AppState;
  hydrated: boolean;
  stats: ReturnType<typeof getDerivedStats>;
  logQuickCheckIn: (moodId: Parameters<typeof createQuickSession>[0]) => void;
  saveResetSession: (input: FullSessionInput) => ReturnType<typeof createFullSession>;
  updatePreferences: (patch: Partial<Preferences>) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

const APP_STATE_EVENT = "nottoday:state-updated";
let cachedStorageValue: string | null = null;
let cachedAppState = defaultAppState;

function getSnapshot() {
  if (typeof window === "undefined") {
    return defaultAppState;
  }

  const rawState = window.localStorage.getItem(APP_STATE_KEY);

  if (rawState === cachedStorageValue) {
    return cachedAppState;
  }

  cachedStorageValue = rawState;
  cachedAppState = restoreAppState(rawState);
  return cachedAppState;
}

function getServerSnapshot() {
  return defaultAppState;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== APP_STATE_KEY) {
      return;
    }

    onStoreChange();
  };
  const handleAppStateUpdate = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(APP_STATE_EVENT, handleAppStateUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(APP_STATE_EVENT, handleAppStateUpdate);
  };
}

function writeState(updater: (current: AppState) => AppState) {
  const nextState = updater(getSnapshot());
  const serializedState = JSON.stringify(nextState);

  cachedStorageValue = serializedState;
  cachedAppState = nextState;
  window.localStorage.setItem(APP_STATE_KEY, serializedState);
  window.dispatchEvent(new Event(APP_STATE_EVENT));
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const appState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const stats = getDerivedStats(appState, appState.preferences.locale);

  const logQuickCheckIn: AppStateContextValue["logQuickCheckIn"] = (moodId) => {
    const session = createQuickSession(moodId);

    startTransition(() => {
      writeState((current) => ({
        ...current,
        sessions: [session, ...current.sessions],
      }));
    });
  };

  const saveResetSession: AppStateContextValue["saveResetSession"] = (input) => {
    const session = createFullSession(input, appState.preferences.locale);

    startTransition(() => {
      writeState((current) => ({
        ...current,
        sessions: [session, ...current.sessions],
      }));
    });

    return session;
  };

  const updatePreferences: AppStateContextValue["updatePreferences"] = (patch) => {
    startTransition(() => {
      writeState((current) => ({
        ...current,
        preferences: {
          ...current.preferences,
          ...patch,
        },
      }));
    });
  };

  return (
    <AppStateContext.Provider
      value={{
        appState,
        hydrated,
        stats,
        logQuickCheckIn,
        saveResetSession,
        updatePreferences,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
}
