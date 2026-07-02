/**
 * Performance tier selection and frame-budget math for the immersive layer.
 *
 * This module is framework-free (plain numbers only) so it can be unit- and
 * property-tested in isolation and consumed by both the performance governor
 * hook and the ambient/pointer components. See design.md "Performance Governor"
 * and "Correctness Properties" (Properties 6, 9, 10).
 */

import { FRAME_BUDGET_MS, PERF_THRESHOLD } from "./constants";
import type { Tier } from "./types";

/**
 * Tier ordering from lowest to highest fidelity. The index doubles as the
 * fidelity "level" used for one-step degrade/upgrade math.
 */
const TIER_ORDER: readonly Tier[] = ["minimal", "reduced", "full"] as const;

/** Fraction of the `full` element budget rendered at each tier. */
const TIER_ELEMENT_FRACTION: Record<Tier, number> = {
  full: 1,
  reduced: 0.5,
  minimal: 0.25,
};

/** Numeric fidelity level of a tier (higher = more fidelity). */
function tierLevel(tier: Tier): number {
  const idx = TIER_ORDER.indexOf(tier);
  // Unknown tiers are treated as the lowest fidelity for safety.
  return idx === -1 ? 0 : idx;
}

/**
 * Fraction of frames that rendered within `budgetMs` over the most recent
 * `windowMs`, computed from a list of frame timestamps (ms).
 *
 * A "frame" is the interval between two consecutive timestamps; its duration is
 * the difference between them. Only frames whose end timestamp falls within the
 * trailing window (`[now - windowMs, now]`, where `now` is the latest
 * timestamp) are counted. The result is the count of in-window frames whose
 * duration is `<= budgetMs` divided by the count of in-window frames.
 *
 * Returns `1` when the window contains no frames (fewer than two timestamps, or
 * no frame ending inside the window), so an idle site is never treated as slow.
 * The result is always a finite number in the closed interval `[0, 1]`.
 */
export function frameFraction(
  timestamps: number[],
  windowMs: number,
  budgetMs: number = FRAME_BUDGET_MS,
): number {
  if (!Array.isArray(timestamps) || timestamps.length < 2) return 1;

  const sorted = timestamps
    .filter((t) => Number.isFinite(t))
    .sort((a, b) => a - b);
  if (sorted.length < 2) return 1;

  const now = sorted[sorted.length - 1];
  const windowStart = now - Math.max(0, windowMs);

  let inWindow = 0;
  let withinBudget = 0;
  for (let i = 1; i < sorted.length; i += 1) {
    const end = sorted[i];
    if (end < windowStart) continue;
    inWindow += 1;
    const frameMs = sorted[i] - sorted[i - 1];
    if (frameMs <= budgetMs) withinBudget += 1;
  }

  if (inWindow === 0) return 1;
  return withinBudget / inWindow;
}

/**
 * Choose the next performance tier from the current tier and the measured
 * fraction of in-budget frames.
 *
 * Behavior:
 * - Below `threshold`: degrade by exactly one level (never below `minimal`).
 *   The result is always `<=` the current tier and steps by at most one level.
 * - Comfortably above `threshold` (past the hysteresis band): upgrade by at
 *   most one level (never above `full`).
 * - Within the hysteresis band (`[threshold, recoveryThreshold)`): hold the
 *   current tier to avoid oscillation on borderline frame rates.
 */
export function selectTier(
  currentTier: Tier,
  fraction: number,
  threshold: number = PERF_THRESHOLD,
): Tier {
  const level = tierLevel(currentTier);

  // Below budget: shed one level of fidelity (monotone, one step at a time).
  if (!(fraction >= threshold)) {
    return TIER_ORDER[Math.max(0, level - 1)];
  }

  // Recovery requires clearing a hysteresis band above the threshold so the
  // tier does not flap up and down around the boundary.
  const recoveryThreshold = threshold + (1 - threshold) / 2;
  if (fraction >= recoveryThreshold) {
    return TIER_ORDER[Math.min(TIER_ORDER.length - 1, level + 1)];
  }

  return currentTier;
}

/**
 * Map a device's logical-core count to a starting performance tier. Devices
 * reporting four or fewer cores (or an unknown count) start at `minimal`, so
 * they receive at most half the element budget of higher-core devices.
 */
export function tierFor(cores: number): Tier {
  if (!Number.isFinite(cores) || cores <= 4) return "minimal";
  if (cores <= 8) return "reduced";
  return "full";
}

/**
 * Number of ambient elements to render for a given tier. Capability is captured
 * by the `tier` (typically derived via {@link tierFor}); `cores` is accepted for
 * API symmetry and possible future scaling. The result is a non-negative integer
 * that never exceeds `full`.
 */
export function computeElementCount(
  tier: Tier,
  cores: number,
  full: number,
): number {
  void cores; // capability is already encoded in `tier`; kept for API symmetry
  const base = Number.isFinite(full) ? Math.max(0, full) : 0;
  return Math.floor(base * TIER_ELEMENT_FRACTION[tier]);
}
