/**
 * Page-load intro session guard for the immersive-experience feature.
 *
 * `shouldShowIntro` decides whether the cinematic intro overlay should play on a
 * given invocation. The intro is shown at most once per browser session: the
 * first call with an unset flag returns `true` (and records that it was shown),
 * and every subsequent call returns `false`.
 *
 * The `sessionStore` argument is a thin abstraction over `sessionStorage` whose
 * `getItem`/`setItem` methods may throw (private-browsing modes, blocked
 * storage) or be absent entirely (SSR). Per the design's Error Handling section,
 * a throwing or absent store is treated as "not yet shown" and the guard falls
 * back to an in-memory flag so the intro still shows exactly once for the
 * session. The in-memory fallback is scoped to the specific store instance (via
 * a WeakMap) so independent stores do not interfere with one another.
 *
 * See design.md "Page-Load Intro Lifecycle", "Error Handling", and
 * "Correctness Properties" Property 13.
 *
 * Requirements: 6.7 (intro shows only once per browser session).
 */

/** Storage key used to persist the "intro already shown" flag. */
export const INTRO_SHOWN_KEY = "immersive:introShown";

/**
 * Minimal `sessionStorage`-like contract. Both methods may throw when storage
 * is unavailable or blocked.
 */
export interface IntroSessionStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Per-store in-memory fallback used when the underlying store throws. Keyed on
 * the store instance so distinct stores keep independent state and can be
 * garbage-collected with their store.
 */
const inMemoryShownByStore = new WeakMap<IntroSessionStore, boolean>();

/** Module-level fallback used when no store is provided at all. */
let inMemoryShownNoStore = false;

/**
 * Determine whether the intro overlay should be shown on this invocation.
 *
 * Returns `true` only on the first invocation for a session (when the flag is
 * unset) and records the "shown" state so all later calls return `false`.
 *
 * @param sessionStore a `sessionStorage`-like store; may be `null`/`undefined`
 *   (SSR) or throw from its methods (blocked storage), in which case an
 *   in-memory fallback preserves the once-per-session guarantee.
 * @returns `true` if the intro should play now, otherwise `false`.
 */
export function shouldShowIntro(
  sessionStore?: IntroSessionStore | null,
): boolean {
  // No store available (e.g. SSR): fall back to a module-level flag.
  if (!sessionStore) {
    if (inMemoryShownNoStore) return false;
    inMemoryShownNoStore = true;
    return true;
  }

  // Attempt to read the persisted flag from the real store.
  try {
    const alreadyShown = sessionStore.getItem(INTRO_SHOWN_KEY) != null;
    if (alreadyShown) return false;

    // Not shown yet — persist the flag and show the intro.
    sessionStore.setItem(INTRO_SHOWN_KEY, "1");
    return true;
  } catch {
    // The store threw (read or write). Fall back to an in-memory flag scoped
    // to this store instance so the intro still shows exactly once.
    if (inMemoryShownByStore.get(sessionStore)) return false;
    inMemoryShownByStore.set(sessionStore, true);
    return true;
  }
}
