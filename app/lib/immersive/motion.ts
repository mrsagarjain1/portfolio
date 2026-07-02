/**
 * Reduced-motion resolution for the immersive-experience feature.
 *
 * This framework-free helper translates the user's reduced-motion preference
 * into a simple, declarative motion state that animated components read to
 * decide whether to run entrance animations (`animate`) and continuous looping
 * effects (`loop`). Keeping this as pure logic lets components delegate the
 * on/off decision to a single source of truth. See design.md
 * "Reduced-Motion Strategy" and "Components and Interfaces" (motion.ts).
 *
 * Requirements: 1.1 (disable continuous loops under reduced motion),
 * 1.2 (render final visible state without reveal animations).
 */

/** Motion state derived from the user's reduced-motion preference. */
export interface MotionState {
  /** Whether motion-based reveal/entrance animations should run. */
  animate: boolean;
  /** Whether continuous looping animations should run. */
  loop: boolean;
}

/**
 * Resolve the effective motion state from the reduced-motion preference.
 *
 * When `prefReduce` is `true` (the user prefers reduced motion), both `animate`
 * and `loop` are `false`, so components render their final visible state and run
 * no continuous loops. When `prefReduce` is `false`, both are `true`.
 *
 * @param prefReduce `true` when `prefers-reduced-motion: reduce` is active.
 */
export function resolveMotionState(prefReduce: boolean): MotionState {
  const enabled = !prefReduce;
  return { animate: enabled, loop: enabled };
}
