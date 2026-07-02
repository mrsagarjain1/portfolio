/**
 * Latched section-reveal reducer for the immersive-experience feature.
 *
 * `revealReducer` is the framework-free primitive behind `useSectionReveal`
 * (Req 3.6). It folds a stream of intersection observations (each a boolean
 * representing an enter/exit event) into a monotone `revealed` flag: once a
 * section has been revealed it stays revealed for every subsequent observation,
 * so the entrance animation never replays while the section remains mounted.
 *
 * See design.md "Correctness Properties" Property 7 and "Data Models"
 * (`RevealState`).
 */

import type { RevealState } from "./types";

/** The initial, not-yet-revealed state. */
export const initialRevealState: RevealState = { revealed: false };

/**
 * Fold a single intersection observation into the reveal state.
 *
 * The latch is monotone: `revealed` transitions `false -> true` the first time
 * an intersecting observation (`true`) arrives and never transitions back to
 * `false`, regardless of later exit observations. Once revealed, the same state
 * reference is returned so referential-equality checks can short-circuit.
 *
 * @param state       the current reveal state
 * @param observation `true` when the section is intersecting the viewport
 * @returns the next reveal state (latched once `revealed` is `true`)
 */
export function revealReducer(
  state: RevealState,
  observation: boolean,
): RevealState {
  // Already latched: never revert to hidden, preserve the reference.
  if (state.revealed) return state;

  // First intersecting observation flips the latch on.
  if (observation) return { revealed: true };

  // Still hidden and not yet intersecting.
  return state;
}
