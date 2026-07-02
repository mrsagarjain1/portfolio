"use client";

/**
 * Latched, once-only section-reveal hook.
 *
 * Observes the referenced element with a single `IntersectionObserver` at a
 * threshold of ≈0.1 (the section's top edge crossing 10% into the viewport,
 * Req 3.1) and folds each observation through the framework-free
 * {@link revealReducer}. The returned `revealed` flag is monotone: once `true`
 * it never returns to `false`, so the entrance animation completes once and is
 * never replayed while the section stays mounted (Req 3.6).
 *
 * Once revealed, the observer is disconnected — there is nothing left to watch.
 * When `IntersectionObserver` is unavailable (SSR / unsupported), the section
 * reveals immediately so content is never left hidden. The effect cleanup
 * disconnects the observer on unmount.
 *
 * _Requirements: 3.1, 3.6_
 */

import { useEffect, useReducer, type RefObject } from "react";

import { initialRevealState, revealReducer } from "../lib/immersive/reveal";

/** Fraction of the target element that must be visible to reveal it. */
const REVEAL_THRESHOLD = 0.1;

export function useSectionReveal<T extends Element>(
  ref: RefObject<T | null>,
): boolean {
  const [state, observe] = useReducer(revealReducer, initialRevealState);

  useEffect(() => {
    // Already latched: nothing left to observe.
    if (state.revealed) return;

    const element = ref.current;
    if (!element) return;

    // SSR / unsupported: reveal immediately so content is never hidden.
    if (typeof IntersectionObserver === "undefined") {
      observe(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          observe(entry.isIntersecting);
        }
      },
      { threshold: REVEAL_THRESHOLD },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, state.revealed]);

  return state.revealed;
}
