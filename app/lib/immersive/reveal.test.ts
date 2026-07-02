import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { initialRevealState, revealReducer } from "./reveal";

// Feature: immersive-experience, Property 7: Section reveal latch is monotone
//
// For any sequence of intersection observations (booleans representing enter/exit
// events), once the reveal state derived by folding useSectionReveal's reducer
// becomes true it remains true for every subsequent observation.
// Validates: Requirements 3.6
describe("revealReducer", () => {
  it("Property 7: once revealed is true it stays true for all subsequent observations", () => {
    fc.assert(
      fc.property(fc.array(fc.boolean()), (observations) => {
        let state = initialRevealState;
        let hasRevealed = false;

        for (const observation of observations) {
          state = revealReducer(state, observation);

          // Track whether the latch has ever turned on.
          if (state.revealed) hasRevealed = true;

          // Monotonicity: once revealed, it can never revert to false.
          if (hasRevealed) {
            expect(state.revealed).toBe(true);
          }
        }

        // The latch is on iff at least one intersecting observation was seen.
        expect(state.revealed).toBe(observations.some((o) => o));
      }),
    );
  });
});
