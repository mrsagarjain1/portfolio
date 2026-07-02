"use client";

/**
 * Reactive performance-tier signal for the immersive-experience coordination
 * layer.
 *
 * A thin wrapper over {@link useImmersiveContext} that surfaces the provider's
 * current `performanceTier` (`full` | `reduced` | `minimal`). It is seeded from
 * `navigator.hardwareConcurrency` on mount and updated live by the performance
 * governor as it sheds/restores fidelity (Req 5.5, 7.6). Background, pointer,
 * and scroll effects read this to scale element counts and effect density.
 *
 * _Requirements: 7.3_
 */

import { useImmersiveContext } from "../components/immersive/ImmersiveProvider";
import type { Tier } from "../lib/immersive/types";

export function usePerformanceTier(): Tier {
  return useImmersiveContext().performanceTier;
}
