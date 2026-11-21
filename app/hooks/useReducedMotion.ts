"use client";

/**
 * True when the visitor prefers reduced motion: either the system setting asks
 * for it or the in-page "Motion off" switch is on. Animated components treat
 * `true` as "show the final state, run no loops".
 */

import { useImmersiveContext } from "../components/immersive/ImmersiveProvider";

export function useReducedMotion(): boolean {
  return !useImmersiveContext().motionEnabled;
}
