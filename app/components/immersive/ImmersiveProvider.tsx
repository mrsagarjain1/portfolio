"use client";

/**
 * ImmersiveProvider — the single coordination layer for the immersive-experience
 * feature. Mounted once near the top of the app shell, it owns the reactive
 * capability signals every animated component reads (`motionEnabled`,
 * `pointerType`, `tabVisible`, `performanceTier`) and provides the shared
 * broadcasters that replace dozens of duplicated `window` listeners and rAF
 * loops:
 *
 *  - a **pointer broadcaster**: one `mousemove` listener updates a shared
 *    position ref and notifies subscribers at most once per animation frame;
 *  - a **shared frame clock**: a single `requestAnimationFrame` loop drives all
 *    frame subscribers so the governor can pause/throttle everything centrally;
 *  - a **pointer-effect registry** backed by `selectActivePointerEffects`, which
 *    caps the number of concurrent continuous pointer followers by priority and
 *    performance tier.
 *
 * The provider resolves every browser-only signal to a safe SSR default (motion
 * disabled so content renders in its final visible state, coarse pointer, tab
 * visible, `minimal` tier) and hydrates the real values on mount. All listeners,
 * subscriptions, and the rAF loop are torn down on unmount.
 *
 * See design.md "Coordination Layer" and "Error Handling".
 * _Requirements: 1.3, 1.4, 4.2, 5.3, 5.4, 7.2, 7.3, 7.4_
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { MAX_CONCURRENT_POINTER_EFFECTS } from "../../lib/immersive/constants";
import { selectActivePointerEffects } from "../../lib/immersive/pointer";
import { tierFor } from "../../lib/immersive/performance";
import type {
  EffectDesc,
  ImmersiveState,
  PointerType,
  Tier,
} from "../../lib/immersive/types";

/** A pointer position broadcast to pointer subscribers. */
export interface PointerPosition {
  x: number;
  y: number;
}

/** Handler invoked (at most once per frame) with the latest pointer position. */
export type PointerSubscriber = (position: PointerPosition) => void;

/** Handler invoked once per shared frame-clock tick with the frame timestamp. */
export type FrameSubscriber = (timestamp: number) => void;

/** Options for {@link ImmersiveContextValue.subscribePointer}. */
export interface PointerSubscribeOptions {
  /** Higher-priority subscribers are notified first within a frame. */
  priority?: number;
}

/**
 * The full context value: the reactive {@link ImmersiveState} plus the shared
 * broadcasters, the pointer-effect registry, and the governor's degrade signal.
 */
export interface ImmersiveContextValue extends ImmersiveState {
  /**
   * Subscribe to throttled pointer positions. The handler fires at most once
   * per animation frame with the most recent position. Returns an unsubscribe
   * function.
   */
  subscribePointer: (
    handler: PointerSubscriber,
    options?: PointerSubscribeOptions,
  ) => () => void;
  /**
   * Subscribe to the shared frame clock. The handler fires once per animation
   * frame with the frame timestamp. Returns an unsubscribe function.
   */
  subscribeFrame: (handler: FrameSubscriber) => () => void;
  /**
   * Register a continuous pointer-following effect so the registry can cap the
   * number active at once by priority and performance tier. Returns a function
   * that unregisters the effect.
   */
  registerPointerEffect: (
    id: string,
    priority: number,
    category?: EffectDesc["category"],
  ) => () => void;
  /** The ids of the pointer effects currently active under the cap/tier. */
  activePointerEffects: string[];
  /** Whether a registered pointer effect is currently active. */
  isPointerEffectActive: (id: string) => boolean;
  /**
   * Push a performance-tier signal (used by the performance governor to degrade
   * — or recover — the immersive layer's fidelity).
   */
  setPerformanceTier: (tier: Tier) => void;
  /**
   * The visitor's manual motion preference: `auto` follows the OS
   * `prefers-reduced-motion` setting, while `on`/`off` explicitly force the
   * immersive motion layer regardless of the OS setting.
   */
  motionOverride: MotionOverride;
  /** Set the manual motion preference (see {@link ImmersiveContextValue.motionOverride}). */
  setMotionOverride: (override: MotionOverride) => void;
}

/** Manual override for the motion layer, on top of the OS preference. */
export type MotionOverride = "auto" | "on" | "off";

/** Safe SSR defaults per design.md "Error Handling". */
const SSR_DEFAULTS: ImmersiveState = {
  motionEnabled: false, // render final visible state during SSR
  pointerType: "coarse",
  tabVisible: true,
  performanceTier: "minimal",
};

const ImmersiveContext = createContext<ImmersiveContextValue | null>(null);

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const POINTER_FINE_QUERY = "(pointer: fine)";
const HOVER_QUERY = "(hover: hover)";

/** Read a media query's current match, guarding for SSR/unsupported. */
function queryMatches(query: string): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(query).matches;
}

export function ImmersiveProvider({ children }: { children: ReactNode }) {
  // --- Reactive capability signals (SSR-safe defaults, hydrated on mount) ---
  // `osMotionEnabled` reflects the OS `prefers-reduced-motion` setting; the
  // effective `motionEnabled` below folds in the visitor's manual override.
  const [osMotionEnabled, setOsMotionEnabled] = useState(
    SSR_DEFAULTS.motionEnabled,
  );
  const [motionOverride, setMotionOverride] = useState<MotionOverride>("auto");
  const motionEnabled =
    motionOverride === "auto" ? osMotionEnabled : motionOverride === "on";
  const [pointerType, setPointerType] = useState<PointerType>(
    SSR_DEFAULTS.pointerType,
  );
  const [tabVisible, setTabVisible] = useState(SSR_DEFAULTS.tabVisible);
  const [performanceTier, setPerformanceTierState] = useState<Tier>(
    SSR_DEFAULTS.performanceTier,
  );

  // --- Pointer broadcaster state (refs so subscribe/notify never re-render) ---
  const pointerSubscribers = useRef(
    new Set<{ handler: PointerSubscriber; priority: number }>(),
  );
  const pointerPosition = useRef<PointerPosition>({ x: 0, y: 0 });
  const pointerFrameScheduled = useRef(false);
  const pointerFrameId = useRef<number | null>(null);

  // --- Shared frame-clock state ---
  const frameSubscribers = useRef(new Set<FrameSubscriber>());
  const frameLoopId = useRef<number | null>(null);
  const frameTick = useRef<(timestamp: number) => void>(() => {});

  // --- Pointer-effect registry ---
  const pointerEffects = useRef(new Map<string, EffectDesc>());
  const [registryVersion, setRegistryVersion] = useState(0);

  // -------------------------------------------------------------------------
  // Hydrate real capability values and attach live listeners on mount.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Resolve the true initial values now that we are on the client.
    setOsMotionEnabled(!queryMatches(MOTION_QUERY));
    setPointerType(
      queryMatches(POINTER_FINE_QUERY) || queryMatches(HOVER_QUERY)
        ? "fine"
        : "coarse",
    );
    setTabVisible(document.visibilityState !== "hidden");
    const cores =
      typeof navigator !== "undefined" ? navigator.hardwareConcurrency : 0;
    setPerformanceTierState(tierFor(cores ?? 0));

    const supportsMatchMedia = typeof window.matchMedia === "function";

    const motionMql = supportsMatchMedia
      ? window.matchMedia(MOTION_QUERY)
      : null;
    const pointerMql = supportsMatchMedia
      ? window.matchMedia(POINTER_FINE_QUERY)
      : null;
    const hoverMql = supportsMatchMedia ? window.matchMedia(HOVER_QUERY) : null;

    const onMotionChange = (event: MediaQueryListEvent) => {
      setOsMotionEnabled(!event.matches);
    };
    const onPointerChange = () => {
      setPointerType(
        (pointerMql?.matches ?? false) || (hoverMql?.matches ?? false)
          ? "fine"
          : "coarse",
      );
    };
    const onVisibilityChange = () => {
      setTabVisible(document.visibilityState !== "hidden");
    };

    motionMql?.addEventListener("change", onMotionChange);
    pointerMql?.addEventListener("change", onPointerChange);
    hoverMql?.addEventListener("change", onPointerChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      motionMql?.removeEventListener("change", onMotionChange);
      pointerMql?.removeEventListener("change", onPointerChange);
      hoverMql?.removeEventListener("change", onPointerChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Pointer broadcaster: single mousemove listener, notify once per frame.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const flush = () => {
      pointerFrameScheduled.current = false;
      pointerFrameId.current = null;
      const position = pointerPosition.current;
      // Notify highest-priority subscribers first.
      const ordered = [...pointerSubscribers.current].sort(
        (a, b) => b.priority - a.priority,
      );
      for (const subscriber of ordered) {
        subscriber.handler(position);
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      pointerPosition.current = { x: event.clientX, y: event.clientY };
      if (!pointerFrameScheduled.current) {
        pointerFrameScheduled.current = true;
        pointerFrameId.current = requestAnimationFrame(flush);
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (pointerFrameId.current !== null) {
        cancelAnimationFrame(pointerFrameId.current);
        pointerFrameId.current = null;
      }
      pointerFrameScheduled.current = false;
    };
  }, []);

  const subscribePointer = useCallback(
    (handler: PointerSubscriber, options?: PointerSubscribeOptions) => {
      const entry = { handler, priority: options?.priority ?? 0 };
      pointerSubscribers.current.add(entry);
      return () => {
        pointerSubscribers.current.delete(entry);
      };
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Shared frame clock: a single rAF loop that drives all frame subscribers.
  // -------------------------------------------------------------------------
  frameTick.current = (timestamp: number) => {
    for (const handler of frameSubscribers.current) {
      handler(timestamp);
    }
    if (frameSubscribers.current.size > 0) {
      frameLoopId.current = requestAnimationFrame((t) => frameTick.current(t));
    } else {
      frameLoopId.current = null;
    }
  };

  const subscribeFrame = useCallback((handler: FrameSubscriber) => {
    frameSubscribers.current.add(handler);
    if (
      frameLoopId.current === null &&
      typeof requestAnimationFrame === "function"
    ) {
      frameLoopId.current = requestAnimationFrame((t) => frameTick.current(t));
    }
    return () => {
      frameSubscribers.current.delete(handler);
    };
  }, []);

  // Cancel the shared rAF loop on unmount.
  useEffect(() => {
    return () => {
      if (
        frameLoopId.current !== null &&
        typeof cancelAnimationFrame === "function"
      ) {
        cancelAnimationFrame(frameLoopId.current);
        frameLoopId.current = null;
      }
      frameSubscribers.current.clear();
    };
  }, []);

  // -------------------------------------------------------------------------
  // Pointer-effect registry.
  // -------------------------------------------------------------------------
  const registerPointerEffect = useCallback(
    (
      id: string,
      priority: number,
      category: EffectDesc["category"] = "cursor",
    ) => {
      pointerEffects.current.set(id, { id, priority, category });
      setRegistryVersion((version) => version + 1);
      return () => {
        pointerEffects.current.delete(id);
        setRegistryVersion((version) => version + 1);
      };
    },
    [],
  );

  const activePointerEffects = useMemo(
    () =>
      selectActivePointerEffects(
        [...pointerEffects.current.values()],
        MAX_CONCURRENT_POINTER_EFFECTS,
        performanceTier,
      ),
    // `registryVersion` bumps whenever the registry mutates.
    [registryVersion, performanceTier],
  );

  const isPointerEffectActive = useCallback(
    (id: string) => activePointerEffects.includes(id),
    [activePointerEffects],
  );

  // Governor degrade/recover signal.
  const setPerformanceTier = useCallback((tier: Tier) => {
    setPerformanceTierState(tier);
  }, []);

  const value = useMemo<ImmersiveContextValue>(
    () => ({
      motionEnabled,
      pointerType,
      tabVisible,
      performanceTier,
      subscribePointer,
      subscribeFrame,
      registerPointerEffect,
      activePointerEffects,
      isPointerEffectActive,
      setPerformanceTier,
      motionOverride,
      setMotionOverride,
    }),
    [
      motionEnabled,
      pointerType,
      tabVisible,
      performanceTier,
      subscribePointer,
      subscribeFrame,
      registerPointerEffect,
      activePointerEffects,
      isPointerEffectActive,
      setPerformanceTier,
      motionOverride,
    ],
  );

  return (
    <ImmersiveContext.Provider value={value}>
      {children}
    </ImmersiveContext.Provider>
  );
}

/**
 * Access the immersive coordination context. Must be called from within an
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

export { ImmersiveContext };
