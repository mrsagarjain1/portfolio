/**
 * Pure pointer math for the immersive-experience feature.
 *
 * Framework-free helpers that back the pointer-coordination layer:
 *  - `clampMagneticOffset` bounds a magnetic pull so an element never moves more
 *    than `MAX_MAGNETIC_PX` from rest while preserving the pull direction.
 *  - `selectActivePointerEffects` enforces the concurrent-pointer-effect cap and
 *    the per-tier budget, keeping the highest-priority effects.
 *
 * See design.md "Pointer Coordination and Capping" and Properties 4 & 5.
 */

import { MAX_MAGNETIC_PX, MAX_CONCURRENT_POINTER_EFFECTS } from "./constants";
import type { EffectDesc, Tier } from "./types";

/**
 * Clamp a magnetic pull `(dx, dy)` to a maximum Euclidean magnitude.
 *
 * The returned offset always has magnitude `<= max`. When the input delta is
 * non-zero the direction is preserved exactly (the vector is scaled by a
 * positive factor). Non-finite inputs are treated as `0`, and a non-positive
 * `max` collapses the offset to the origin.
 *
 * Req 4.3 — magnetic translation bounded to at most `MAX_MAGNETIC_PX` (20 px).
 */
export function clampMagneticOffset(
  dx: number,
  dy: number,
  max: number = MAX_MAGNETIC_PX,
): { x: number; y: number } {
  const sx = Number.isFinite(dx) ? dx : 0;
  const sy = Number.isFinite(dy) ? dy : 0;
  const magnitude = Math.hypot(sx, sy);

  if (magnitude === 0 || max <= 0) {
    return { x: 0, y: 0 };
  }
  if (magnitude <= max) {
    return { x: sx, y: sy };
  }

  const scale = max / magnitude;
  return { x: sx * scale, y: sy * scale };
}

/**
 * The maximum number of concurrent continuous pointer effects allowed for a
 * given performance tier. Lower tiers shed the costliest followers first, but
 * `minimal` still retains a single slot so the highest-priority effect (the
 * primary custom cursor) is never culled — otherwise a low-core or degraded
 * device would be left with no pointer indication at all.
 */
export function tierBudget(tier: Tier): number {
  switch (tier) {
    case "full":
      return MAX_CONCURRENT_POINTER_EFFECTS;
    case "reduced":
      return 2;
    case "minimal":
      return 1;
    default:
      return 0;
  }
}

/**
 * Select the active continuous pointer effects, keeping the highest-priority
 * effects first and never exceeding either the caller's `cap` or the tier
 * budget. The result is duplicate-free (deduplicated by `id`, retaining the
 * highest-priority occurrence of each id).
 *
 * Req 4.1 / 4.7 / 7.3 — coordinate and cap concurrent pointer followers.
 */
export function selectActivePointerEffects(
  effects: EffectDesc[],
  cap: number,
  tier: Tier,
): string[] {
  const budget = Math.max(0, Math.min(cap, tierBudget(tier)));
  if (budget === 0) {
    return [];
  }

  // Deduplicate by id, keeping the highest-priority descriptor per id.
  const byId = new Map<string, EffectDesc>();
  for (const effect of effects) {
    const existing = byId.get(effect.id);
    if (!existing || effect.priority > existing.priority) {
      byId.set(effect.id, effect);
    }
  }

  return [...byId.values()]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, budget)
    .map((effect) => effect.id);
}
