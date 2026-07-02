/**
 * Capped-buffer eviction for the immersive-experience feature.
 *
 * `pushWithCap` is the shared primitive behind the discrete ripple limit
 * (Req 4.6, `MAX_RIPPLES`) and any other fixed-size, newest-wins buffer such as
 * trail particles. It is framework-free (plain arrays) so it can be exercised by
 * property-based tests and reused across components.
 *
 * See design.md "Correctness Properties" Property 3.
 */

/**
 * Append `next` to `items`, keeping the newest items in insertion order and
 * evicting the oldest first so the result length never exceeds `cap`.
 *
 * - The input array is never mutated; a new array is returned.
 * - When `cap <= 0` the buffer cannot hold anything, so an empty array is
 *   returned (nothing is retained, including `next`).
 * - When adding `next` would exceed `cap`, the oldest leading items are dropped
 *   until the length equals `cap`, preserving the relative order of survivors.
 *
 * @param items the current buffer contents (oldest first)
 * @param next  the item to push onto the buffer
 * @param cap   the maximum number of items to retain (`>= 0`)
 * @returns a new array of at most `cap` items ending with `next`
 */
export function pushWithCap<T>(items: T[], next: T, cap: number): T[] {
  if (cap <= 0) return [];

  const appended = [...items, next];
  if (appended.length <= cap) return appended;

  // Evict oldest-first: keep the last `cap` inserted items in insertion order.
  return appended.slice(appended.length - cap);
}
