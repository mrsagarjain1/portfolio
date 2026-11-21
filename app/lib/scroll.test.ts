import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { computeScrollProgress } from "./scroll";

describe("computeScrollProgress", () => {
  it("returns 0 when there is nothing to scroll", () => {
    expect(computeScrollProgress(0, 800, 800)).toBe(0);
    expect(computeScrollProgress(500, 600, 900)).toBe(0);
  });

  it("returns 100 at the bottom of the scroll range", () => {
    // scrollable = 2000 - 800 = 1200
    expect(computeScrollProgress(1200, 2000, 800)).toBe(100);
  });

  it("returns 50 at the midpoint", () => {
    expect(computeScrollProgress(600, 2000, 800)).toBe(50);
  });

  it("clamps negative scroll to 0 and overshoot to 100", () => {
    expect(computeScrollProgress(-500, 2000, 800)).toBe(0);
    expect(computeScrollProgress(99999, 2000, 800)).toBe(100);
  });
});

// Property: scroll progress is bounded to [0, 100] for any real inputs.
describe("scroll progress is bounded", () => {
  it("returns a finite value within [0, 100] for any real inputs", () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true }),
        fc.double({ noNaN: true }),
        fc.double({ noNaN: true }),
        (scrollY, scrollHeight, clientHeight) => {
          const progress = computeScrollProgress(scrollY, scrollHeight, clientHeight);
          expect(Number.isFinite(progress)).toBe(true);
          expect(progress).toBeGreaterThanOrEqual(0);
          expect(progress).toBeLessThanOrEqual(100);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("never goes down as the scroll position grows", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1e6, noNaN: true }),
        fc.double({ min: 0, max: 1e6, noNaN: true }),
        fc.double({ min: 1, max: 1e6, noNaN: true }),
        fc.double({ min: 1, max: 1e6, noNaN: true }),
        (a, b, scrollHeight, clientHeight) => {
          const lo = computeScrollProgress(Math.min(a, b), scrollHeight, clientHeight);
          const hi = computeScrollProgress(Math.max(a, b), scrollHeight, clientHeight);
          expect(hi).toBeGreaterThanOrEqual(lo);
        },
      ),
      { numRuns: 100 },
    );
  });
});
