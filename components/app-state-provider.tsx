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

function getSnapshot() {
  if (typeof window === "undefined") {
    return defaultAppState;
  }

  return restoreAppState(window.localStorage.getItem(APP_STATE_KEY));
}

function getServerSnapshot() {
  return defaultAppState;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = () => onStoreChange();

  window.addEventListener("storage", listener);
  window.addEventListener(APP_STATE_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(APP_STATE_EVENT, listener);
  };
}

function writeState(updater: (current: AppState) => AppState) {
  const nextState = updater(getSnapshot());

  window.localStorage.setItem(APP_STATE_KEY, JSON.stringify(nextState));
  window.dispatchEvent(new Event(APP_STATE_EVENT));
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const appState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const stats = getDerivedStats(appState);

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
    const session = createFullSession(input);

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
