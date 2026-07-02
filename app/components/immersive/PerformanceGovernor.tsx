"use client";

/**
 * PerformanceGovernor — a headless client component that mounts the
 * {@link usePerformanceGovernor} hook once near the top of the app shell. It
 * renders nothing; its only job is to run the frame-budget sampling loop and
 * publish performance-tier changes to the {@link ImmersiveProvider} so the
 * immersive layer degrades (and recovers, with hysteresis) as frames are missed
 * or met.
 *
 * Mount this once inside the provider (see task 10.1); it must not be mounted
 * multiple times, or the tier would be driven by several competing samplers.
 *
 * _Requirements: 7.1, 7.4, 7.6_
 */

import { usePerformanceGovernor } from "../../hooks/usePerformanceGovernor";

export function PerformanceGovernor(): null {
  usePerformanceGovernor();
  return null;
}

export default PerformanceGovernor;
