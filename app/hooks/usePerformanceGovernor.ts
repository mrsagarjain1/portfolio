"use client";

/**
 * Performance governor for the immersive-experience coordination layer.
 *
 * Samples frame timestamps from the shared frame clock into a rolling
 * `PERF_WINDOW_MS` (5-second) window, computes the fraction of frames that
 * rendered within `FRAME_BUDGET_MS` via {@link frameFraction}, and drives
 * {@link selectTier} from the provider's current `performanceTier`. When the
 * selected tier differs from the current tier it publishes the change through
 * `setPerformanceTier`, so the background, pointer, and scroll layers shed (or,
 * with hysteresis, restore) fidelity as the frame budget is missed or met.
 *
 * Sampling pauses while the tab is hidden: no timestamps are recorded and no
 * tier decision is made. The rolling window is also cleared when the tab
 * becomes hidden so a long background gap is never counted as a slow frame when
 * the tab becomes visible again.
 *
 * _Requirements: 7.1, 7.4, 7.6_
 */

import { useEffect, useRef } from "react";

import { useImmersiveContext } from "../components/immersive/ImmersiveProvider";
import {
  FRAME_BUDGET_MS,
  PERF_WINDOW_MS,
} from "../lib/immersive/constants";
import { frameFraction, selectTier } from "../lib/immersive/performance";
import { useFrameClock } from "./useFrameClock";

export function usePerformanceGovernor(): void {
  const { performanceTier, tabVisible, setPerformanceTier } =
    useImmersiveContext();

  // Rolling window of recent frame timestamps (ms). Kept in a ref so sampling
  // never triggers a re-render; only an actual tier change does.
  const timestampsRef = useRef<number[]>([]);

  // Clear the window whenever the tab becomes hidden so the gap spanning the
  // hidden period is not counted as a slow frame once the tab is visible again.
  useEffect(() => {
    if (!tabVisible) {
      timestampsRef.current = [];
    }
  }, [tabVisible]);

  useFrameClock((timestamp) => {
    // Pause sampling while the tab is hidden (Req 7.4).
    if (!tabVisible) return;

    const timestamps = timestampsRef.current;
    timestamps.push(timestamp);

    // Drop timestamps that have aged out of the rolling window.
    const windowStart = timestamp - PERF_WINDOW_MS;
    while (timestamps.length > 0 && timestamps[0] < windowStart) {
      timestamps.shift();
    }

    const fraction = frameFraction(timestamps, PERF_WINDOW_MS, FRAME_BUDGET_MS);
    const nextTier = selectTier(performanceTier, fraction);
    if (nextTier !== performanceTier) {
      setPerformanceTier(nextTier);
    }
  });
}
