"use client";

/**
 * Reactive reduced-motion flag for the immersive-experience coordination layer.
 *
 * A thin wrapper over {@link useImmersiveContext} that surfaces the provider's
 * live `matchMedia("(prefers-reduced-motion: reduce)")` signal. It updates
 * within a render tick of an OS preference change (well under the 500 ms budget
 * in Req 1.3/1.4) with no page reload.
 *
 * Returns `true` when the visitor prefers **reduced** motion (matching the
 * conventional `useReducedMotion` semantics), i.e. the inverse of the provider's
 * `motionEnabled` flag. Animated components should treat `true` as "render the
 * final visible state / stop continuous loops".
 *
 * _Requirements: 1.1_
 */

import { useImmersiveContext } from "../components/immersive/ImmersiveProvider";

export function useReducedMotion(): boolean {
  return !useImmersiveContext().motionEnabled;
}
