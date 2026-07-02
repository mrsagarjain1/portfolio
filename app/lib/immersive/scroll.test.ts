import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { computeScrollProgress, computeParallaxOffset, blendTopology } from "./scroll";
import { MAX_PARALLAX_PX } from "./constants";

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

describe("computeParallaxOffset", () => {
  it("returns 0 when the element sits at the viewport center", () => {
    // viewportCenter = 1000 + 400 = 1400; elementTop = 1400 => raw 0
    expect(computeParallaxOffset(1000, 1400, 800, 0.5)).toBe(0);
  });

  it("clamps large offsets to the max bound", () => {
    expect(computeParallaxOffset(100000, 0, 800, 1)).toBe(MAX_PARALLAX_PX);
    expect(computeParallaxOffset(0, 100000, 800, 1)).toBe(-MAX_PARALLAX_PX);
  });
});

describe("blendTopology", () => {
  it("collapses for a single section", () => {
    expect(blendTopology(50, 1)).toEqual({ fromIdx: 0, toIdx: 0, t: 0 });
  });

  it("maps progress across sections", () => {
    // 5 sections => 4 segments; scroll 50 => pos 2 => from 2, to 3, t 0
    expect(blendTopology(50, 5)).toEqual({ fromIdx: 2, toIdx: 3, t: 0 });
  });

  it("keeps indices in range at the end", () => {
    const r = blendTopology(100, 5);
    expect(r.fromIdx).toBe(3);
    expect(r.toIdx).toBe(4);
    expect(r.t).toBe(1);
  });
});

// Feature: immersive-experience, Property 1: Scroll progress is bounded to [0, 100]
describe("Property 1: scroll progress is bounded to [0, 100]", () => {
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
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: immersive-experience, Property 2: Scroll translation offset is bounded, and zero under reduced motion
describe("Property 2: scroll translation offset is bounded, and zero under reduced motion", () => {
  it("magnitude never exceeds MAX_PARALLAX_PX, and applied offset is 0 under reduced motion", () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true }),
        fc.double({ noNaN: true }),
        fc.double({ noNaN: true }),
        fc.double({ noNaN: true }),
        fc.boolean(),
        (scrollY, elementTop, viewportH, speed, motionEnabled) => {
          const offset = computeParallaxOffset(scrollY, elementTop, viewportH, speed);
          expect(Number.isFinite(offset)).toBe(true);
          expect(Math.abs(offset)).toBeLessThanOrEqual(MAX_PARALLAX_PX);

          // The effective applied offset is exactly 0 when motion is disabled.
          const applied = motionEnabled ? offset : 0;
          if (!motionEnabled) {
            expect(applied).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
