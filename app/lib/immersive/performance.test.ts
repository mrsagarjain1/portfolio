import { describe, it, expect } from "vitest";
import fc from "fast-check";

import {
  frameFraction,
  selectTier,
  tierFor,
  computeElementCount,
} from "./performance";
import { FRAME_BUDGET_MS, PERF_THRESHOLD } from "./constants";
import type { Tier } from "./types";

const TIERS: Tier[] = ["minimal", "reduced", "full"];
const tierLevel = (t: Tier) => TIERS.indexOf(t);

// ---------------------------------------------------------------------------
// Unit tests: concrete examples and edge cases
// ---------------------------------------------------------------------------

describe("frameFraction", () => {
  it("returns 1 when there are fewer than two timestamps", () => {
    expect(frameFraction([], 5000, FRAME_BUDGET_MS)).toBe(1);
    expect(frameFraction([100], 5000, FRAME_BUDGET_MS)).toBe(1);
  });

  it("returns 1 when no frame ends inside the window", () => {
    // Two frames far in the past relative to the trailing window.
    expect(frameFraction([0, 10], 5, FRAME_BUDGET_MS)).toBe(1);
  });

  it("counts the fraction of in-budget frames within the window", () => {
    // Timestamps -> frame durations: 10, 20, 10, 30 (budget 16.7 => 2 of 4 ok).
    const ts = [0, 10, 30, 40, 70];
    expect(frameFraction(ts, 5000, FRAME_BUDGET_MS)).toBeCloseTo(2 / 4, 10);
  });

  it("only considers frames ending within the trailing window", () => {
    // now = 100, window 25 => windowStart 75. Frames ending at 80 (dur 30) and
    // 100 (dur 20): both in window, none within a 16.7ms budget => 0.
    expect(frameFraction([0, 50, 80, 100], 25, FRAME_BUDGET_MS)).toBe(0);
  });
});

describe("selectTier", () => {
  it("degrades one step when below threshold", () => {
    expect(selectTier("full", 0.5)).toBe("reduced");
    expect(selectTier("reduced", 0.5)).toBe("minimal");
  });

  it("never degrades below minimal", () => {
    expect(selectTier("minimal", 0)).toBe("minimal");
  });

  it("holds within the hysteresis band just above threshold", () => {
    // threshold 0.9, recovery 0.95 => 0.92 holds.
    expect(selectTier("reduced", 0.92)).toBe("reduced");
  });

  it("upgrades one step once comfortably above threshold", () => {
    expect(selectTier("minimal", 0.99)).toBe("reduced");
    expect(selectTier("reduced", 0.99)).toBe("full");
    expect(selectTier("full", 0.99)).toBe("full");
  });
});

describe("tierFor / computeElementCount", () => {
  it("maps low core counts to minimal and high to full", () => {
    expect(tierFor(2)).toBe("minimal");
    expect(tierFor(4)).toBe("minimal");
    expect(tierFor(8)).toBe("reduced");
    expect(tierFor(16)).toBe("full");
  });

  it("scales element count by tier and never exceeds full", () => {
    expect(computeElementCount("full", 16, 100)).toBe(100);
    expect(computeElementCount("reduced", 8, 100)).toBe(50);
    expect(computeElementCount("minimal", 2, 100)).toBe(25);
    expect(computeElementCount("full", 16, 0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Property-based tests
// ---------------------------------------------------------------------------

// Feature: immersive-experience, Property 6: Low-core devices render at most half the element count
// Validates: Requirements 5.5
describe("Property 6: low-core devices render at most half the element count", () => {
  it("computeElementCount(tierFor(low)) <= 0.5 * computeElementCount(tierFor(high))", () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 100_000 }), // full element count
        fc.integer({ min: 0, max: 4 }), // low: <= 4 cores
        fc.integer({ min: 5, max: 256 }), // high: > 4 cores
        (full, low, high) => {
          const lowCount = computeElementCount(tierFor(low), low, full);
          const highCount = computeElementCount(tierFor(high), high, full);
          expect(lowCount).toBeLessThanOrEqual(0.5 * highCount);
        },
      ),
    );
  });
});

// Feature: immersive-experience, Property 9: Frame-fraction measurement is correct and bounded
// Validates: Requirements 7.1
describe("Property 9: frame-fraction measurement is correct and bounded", () => {
  it("returns a value in [0,1] equal to in-budget/in-window frames, or 1 when empty", () => {
    fc.assert(
      fc.property(
        // Monotonic frame timestamps built from a base plus positive gaps.
        fc.double({ min: 0, max: 1_000_000, noNaN: true }),
        fc.array(fc.double({ min: 0.001, max: 200, noNaN: true }), {
          maxLength: 200,
        }),
        fc.double({ min: 0, max: 10_000, noNaN: true }), // windowMs
        fc.double({ min: 0.001, max: 100, noNaN: true }), // budgetMs
        (base, gaps, windowMs, budgetMs) => {
          const timestamps: number[] = [base];
          for (const gap of gaps) {
            timestamps.push(timestamps[timestamps.length - 1] + gap);
          }

          const result = frameFraction(timestamps, windowMs, budgetMs);

          // Bounded and finite.
          expect(Number.isFinite(result)).toBe(true);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(1);

          // Independent reference computation of the same formula.
          const now = timestamps[timestamps.length - 1];
          const windowStart = now - Math.max(0, windowMs);
          let inWindow = 0;
          let withinBudget = 0;
          for (let i = 1; i < timestamps.length; i += 1) {
            if (timestamps[i] < windowStart) continue;
            inWindow += 1;
            if (timestamps[i] - timestamps[i - 1] <= budgetMs) withinBudget += 1;
          }
          const expected = inWindow === 0 ? 1 : withinBudget / inWindow;
          expect(result).toBeCloseTo(expected, 10);
        },
      ),
    );
  });
});

// Feature: immersive-experience, Property 10: Performance tier degrades (never upgrades) when below threshold
// Validates: Requirements 7.6
describe("Property 10: performance tier degrades, never upgrades, below threshold", () => {
  it("returns a tier <= current and steps by at most one level when fraction < threshold", () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Tier>(...TIERS),
        // fraction strictly below PERF_THRESHOLD
        fc.double({ min: 0, max: PERF_THRESHOLD, noNaN: true }),
        (current, rawFraction) => {
          const fraction = Math.min(
            rawFraction,
            PERF_THRESHOLD - Number.EPSILON,
          );
          fc.pre(fraction < PERF_THRESHOLD);

          const next = selectTier(current, fraction);
          const currentLevel = tierLevel(current);
          const nextLevel = tierLevel(next);

          // Never upgrades.
          expect(nextLevel).toBeLessThanOrEqual(currentLevel);
          // Steps by at most one level.
          expect(currentLevel - nextLevel).toBeLessThanOrEqual(1);
        },
      ),
    );
  });
});
