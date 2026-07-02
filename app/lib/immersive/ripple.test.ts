import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { pushWithCap } from "./ripple";

// Feature: immersive-experience, Property 3: A capped buffer retains only the newest N items in insertion order
//
// For any initial list and any sequence of pushes through pushWithCap(items, next, cap)
// with cap >= 0, after every push the result length is at most cap, the result equals
// the last cap inserted items in insertion order, and the oldest items are evicted first.
// Validates: Requirements 4.6
describe("pushWithCap", () => {
  it("Property 3: retains only the newest cap items in insertion order after every push", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        fc.array(fc.integer()),
        fc.nat(50),
        (initial, pushes, cap) => {
          // Fold the push sequence, asserting invariants after every push.
          // `history` tracks the full insertion order (initial items first, then
          // every pushed item) to derive the expected retained window.
          let buffer = [...initial];
          const history = [...initial];

          for (const next of pushes) {
            buffer = pushWithCap(buffer, next, cap);
            history.push(next);

            // Invariant 1: length never exceeds the cap.
            expect(buffer.length).toBeLessThanOrEqual(cap);

            // Invariant 2 + 3: result equals the last `cap` inserted items in
            // insertion order (so the oldest are the ones evicted).
            const expected = cap === 0 ? [] : history.slice(-cap);
            expect(buffer).toEqual(expected);
          }
        },
      ),
    );
  });
});
