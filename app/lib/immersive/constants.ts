/**
 * Shared numeric constants for the immersive-experience feature.
 *
 * These bound the pure-logic module's behavior (clamping, capping, timing) and
 * are referenced by both the logic functions and the React components. Each
 * constant links to the requirement clause it enforces. See design.md
 * "Data Models" for the source-of-truth values.
 */

/** Maximum absolute parallax/depth translation offset in px. Req 3.3 */
export const MAX_PARALLAX_PX = 100;

/** Maximum magnetic translation magnitude in px. Req 4.3 */
export const MAX_MAGNETIC_PX = 20;

/** Maximum concurrent ripples before oldest-first eviction. Req 4.6 */
export const MAX_RIPPLES = 10;

/** Cap on concurrent continuous pointer-following effects. (user guidance) */
export const MAX_CONCURRENT_POINTER_EFFECTS = 4;

/** Per-frame budget in ms for a 60fps target. Req 7 */
export const FRAME_BUDGET_MS = 16.7;

/** Rolling performance-measurement window in ms. Req 7.1 */
export const PERF_WINDOW_MS = 5000;

/** Fraction-of-frames-in-budget threshold for tier decisions. Req 7.1 / 7.6 */
export const PERF_THRESHOLD = 0.9;

/** Maximum intro animation duration in ms. Req 6.2 */
export const INTRO_MAX_MS = 3000;

/** Independent failsafe reveal timeout in ms. Req 6.6 */
export const INTRO_FAILSAFE_MS = 3500;

/** Reduced-motion intro reveal budget in ms. Req 6.5 */
export const INTRO_REDUCED_MS = 500;

/** Settle-to-rest duration in ms for offsets returning to zero. Req 1.3/1.4, 3.4, 4.4 */
export const SETTLE_MS = 500;
