import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import fc from "fast-check";

// Global fast-check configuration: run every property at least 100 iterations.
fc.configureGlobal({ numRuns: 100 });

/**
 * Mock scaffolding for browser APIs that jsdom does not implement (or implements
 * incompletely). Each factory is exported so individual tests can override the
 * default behavior (e.g. simulate a `change` event or a hidden tab).
 */

interface MatchMediaOptions {
  matches?: boolean;
}

/**
 * Installs a controllable `window.matchMedia` mock. Returns a helper that
 * dispatches a `change` event to all registered listeners so tests can simulate
 * a live media-query change (e.g. prefers-reduced-motion flipping).
 */
export function mockMatchMedia({ matches = false }: MatchMediaOptions = {}) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  let currentMatches = matches;

  const mql = {
    get matches() {
      return currentMatches;
    },
    media: "",
    onchange: null,
    addEventListener: vi.fn(
      (_type: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.add(cb);
      },
    ),
    removeEventListener: vi.fn(
      (_type: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.delete(cb);
      },
    ),
    // Deprecated APIs kept for components that still use them.
    addListener: vi.fn((cb: (e: MediaQueryListEvent) => void) => {
      listeners.add(cb);
    }),
    removeListener: vi.fn((cb: (e: MediaQueryListEvent) => void) => {
      listeners.delete(cb);
    }),
    dispatchEvent: vi.fn(),
  };

  const matchMedia = vi.fn((query: string) => {
    (mql as unknown as { media: string }).media = query;
    return mql as unknown as MediaQueryList;
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: matchMedia,
  });

  return {
    matchMedia,
    mql,
    /** Simulate a live media-query change. */
    setMatches(next: boolean) {
      currentMatches = next;
      const event = { matches: next } as MediaQueryListEvent;
      listeners.forEach((cb) => cb(event));
    },
  };
}

/**
 * Installs a controllable `IntersectionObserver` mock. Returns a helper that
 * triggers intersection callbacks so tests can simulate elements entering or
 * leaving the viewport.
 */
export function mockIntersectionObserver() {
  const instances: Array<{
    callback: IntersectionObserverCallback;
    observe: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  }> = [];

  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    callback: IntersectionObserverCallback;
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      instances.push({
        callback,
        observe: this.observe,
        unobserve: this.unobserve,
        disconnect: this.disconnect,
      });
    }
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

  return {
    instances,
    /** Fire an intersection change for the most recently created observer. */
    trigger(isIntersecting: boolean, intersectionRatio = isIntersecting ? 1 : 0) {
      const latest = instances[instances.length - 1];
      if (!latest) return;
      latest.callback(
        [{ isIntersecting, intersectionRatio } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    },
  };
}

/**
 * Installs a deterministic `requestAnimationFrame`/`cancelAnimationFrame` pair
 * driven by a manual queue. Returns a `flush` helper that runs pending frames
 * so tests can advance the shared frame clock without real timers.
 */
export function mockRequestAnimationFrame() {
  let id = 0;
  const callbacks = new Map<number, FrameRequestCallback>();

  const raf = vi.fn((cb: FrameRequestCallback) => {
    id += 1;
    callbacks.set(id, cb);
    return id;
  });

  const caf = vi.fn((handle: number) => {
    callbacks.delete(handle);
  });

  vi.stubGlobal("requestAnimationFrame", raf);
  vi.stubGlobal("cancelAnimationFrame", caf);

  return {
    raf,
    caf,
    /** Run all currently-queued frame callbacks once with the given timestamp. */
    flush(time = performance.now()) {
      const pending = [...callbacks.entries()];
      callbacks.clear();
      pending.forEach(([, cb]) => cb(time));
    },
    get pending() {
      return callbacks.size;
    },
  };
}

/**
 * Sets `document.visibilityState` and dispatches a `visibilitychange` event so
 * tests can simulate the tab being hidden or shown.
 */
export function setVisibilityState(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
  Object.defineProperty(document, "hidden", {
    configurable: true,
    get: () => state === "hidden",
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

/**
 * Installs an in-memory `sessionStorage` mock. Pass `throwOnAccess` to simulate
 * a blocked/unavailable store (e.g. private browsing).
 */
export function mockSessionStorage({ throwOnAccess = false } = {}) {
  const store = new Map<string, string>();

  const storage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => {
      if (throwOnAccess) throw new Error("sessionStorage unavailable");
      return store.has(key) ? store.get(key)! : null;
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      if (throwOnAccess) throw new Error("sessionStorage unavailable");
      store.set(key, String(value));
    },
  };

  Object.defineProperty(window, "sessionStorage", {
    configurable: true,
    writable: true,
    value: storage,
  });

  return { storage, store };
}

// Ensure React Testing Library unmounts components between tests.
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
