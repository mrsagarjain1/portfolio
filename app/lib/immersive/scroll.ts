/**
 * Pure scroll math for the immersive-experience feature.
 *
 * Framework-free (no React/DOM): every function operates on plain numbers so it
 * can be exercised by property-based tests and reused by the scroll
 * storytelling components (`ScrollProgress`, `ParallaxSection`, `ScrollDepth`).
 *
 * See design.md "Scroll Storytelling Architecture" and Correctness Properties
 * 1 and 2.
 */

import { MAX_PARALLAX_PX } from "./constants";

/** Clamp `value` into the inclusive range [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Compute scroll progress as a percentage of total scrollable height.
 *
 * Returns a finite number clamped to `[0, 100]` for any real inputs, including
 * zero, negative, and very large values. When there is nothing to scroll
 * (`scrollHeight <= clientHeight`, or non-finite dimensions) the progress is `0`.
 *
 * Req 3.2 — bounded to [0, 100].
 */
export function computeScrollProgress(
  scrollY: number,
  scrollHeight: number,
  clientHeight: number
): number {
  const scrollable = scrollHeight - clientHeight;
  // `!(scrollable > 0)` also rejects NaN and non-positive ranges.
  if (!(scrollable > 0)) return 0;

  const raw = (scrollY / scrollable) * 100;
  if (Number.isNaN(raw)) return 0;

  // clamp propagates ±Infinity to the respective bound, keeping the result finite.
  return clamp(raw, 0, 100);
}

/**
 * Compute a parallax/depth translation offset for an element, bounded to
 * `[-max, max]`. The offset scales with the element's distance from the
 * viewport center by `speed`, so elements drift as the page scrolls.
 *
 * The magnitude never exceeds `max` (default `MAX_PARALLAX_PX`). Non-finite
 * combinations resolve to a finite, bounded value.
 *
 * Req 3.3 — bounded to ±MAX_PARALLAX_PX.
 */
export function computeParallaxOffset(
  scrollY: number,
  elementTop: number,
  viewportH: number,
  speed: number,
  max: number = MAX_PARALLAX_PX
): number {
  const bound = Math.abs(max);
  if (!(bound >= 0)) return 0;

  const viewportCenter = scrollY + viewportH / 2;
  const raw = (viewportCenter - elementTop) * speed;
  if (Number.isNaN(raw)) return 0;

  // clamp maps ±Infinity to ±bound, so the result is always within [-bound, bound].
  return clamp(raw, -bound, bound);
}

/**
 * Map a scroll progress value onto a pair of adjacent section indices plus a
 * blend factor `t` in `[0, 1]`, used to interpolate between section topologies.
 *
 * For `sectionCount <= 1` (or non-finite input) there is nothing to blend, so
 * the result collapses to `{ fromIdx: 0, toIdx: 0, t: 0 }`.
 */
export function blendTopology(
  scroll: number,
  sectionCount: number
): { fromIdx: number; toIdx: number; t: number } {
  const n = Number.isFinite(sectionCount) ? Math.floor(sectionCount) : 0;
  if (n <= 1) return { fromIdx: 0, toIdx: 0, t: 0 };

  const segments = n - 1;
  const progress = clamp(Number.isFinite(scroll) ? scroll : 0, 0, 100);
  const pos = (progress / 100) * segments;

  let fromIdx = Math.floor(pos);
  if (fromIdx >= segments) fromIdx = segments - 1;
  const toIdx = fromIdx + 1;
  const t = pos - fromIdx;

  return { fromIdx, toIdx, t };
}
