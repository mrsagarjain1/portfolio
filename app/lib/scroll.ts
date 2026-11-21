/**
 * Scroll math. Framework-free (plain numbers in, plain numbers out) so it can
 * be covered by property-based tests.
 */

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
 */
export function computeScrollProgress(
  scrollY: number,
  scrollHeight: number,
  clientHeight: number,
): number {
  const scrollable = scrollHeight - clientHeight;
  // `!(scrollable > 0)` also rejects NaN and non-positive ranges.
  if (!(scrollable > 0)) return 0;

  const raw = (scrollY / scrollable) * 100;
  if (Number.isNaN(raw)) return 0;

  // clamp propagates ±Infinity to the respective bound, keeping the result finite.
  return clamp(raw, 0, 100);
}
