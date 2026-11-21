"use client";

/**
 * ImmersiveProvider: the page's motion settings.
 *
 * Owns two live signals that animated components read:
 *  - `motionEnabled`: true when animation may play. The visitor's operating
 *    system "reduce motion" setting turns it off, and the in-page "Motion on /
 *    off" switch overrides the system setting either way.
 *  - `tabVisible`: false while the browser tab is hidden, so loops can pause.
 *
 * Both are read with `useSyncExternalStore`, which gives a safe server value
 * (motion off, so content renders in its final state, tab visible) and switches
 * to the real value on the client without a hydration mismatch.
 */

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/** Manual override for motion, on top of the system preference. */
export type MotionOverride = "auto" | "on" | "off";

export interface ImmersiveContextValue {
  motionEnabled: boolean;
  tabVisible: boolean;
  motionOverride: MotionOverride;
  setMotionOverride: (override: MotionOverride) => void;
}

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const ImmersiveContext = createContext<ImmersiveContextValue | null>(null);

function hasMatchMedia(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

function subscribeToMotionPreference(onChange: () => void): () => void {
  if (!hasMatchMedia()) return () => {};
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True when the system does not ask for reduced motion. */
function readSystemMotionEnabled(): boolean {
  return hasMatchMedia() ? !window.matchMedia(MOTION_QUERY).matches : true;
}

function readServerMotionEnabled(): boolean {
  return false;
}

function subscribeToVisibility(onChange: () => void): () => void {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function readTabVisible(): boolean {
  return document.visibilityState !== "hidden";
}

function readServerTabVisible(): boolean {
  return true;
}

export function ImmersiveProvider({ children }: { children: ReactNode }) {
  const systemMotionEnabled = useSyncExternalStore(
    subscribeToMotionPreference,
    readSystemMotionEnabled,
    readServerMotionEnabled,
  );
  const tabVisible = useSyncExternalStore(
    subscribeToVisibility,
    readTabVisible,
    readServerTabVisible,
  );
  const [motionOverride, setMotionOverride] = useState<MotionOverride>("auto");

  const motionEnabled =
    motionOverride === "auto" ? systemMotionEnabled : motionOverride === "on";

  const value = useMemo<ImmersiveContextValue>(
    () => ({ motionEnabled, tabVisible, motionOverride, setMotionOverride }),
    [motionEnabled, tabVisible, motionOverride],
  );

  return (
    <ImmersiveContext.Provider value={value}>{children}</ImmersiveContext.Provider>
  );
}

/**
 * Access the motion settings. Must be called from within an
 * {@link ImmersiveProvider}; throws otherwise so misuse is caught early.
 */
export function useImmersiveContext(): ImmersiveContextValue {
  const context = useContext(ImmersiveContext);
  if (context === null) {
    throw new Error(
      "useImmersiveContext must be used within an <ImmersiveProvider>",
    );
  }
  return context;
}
