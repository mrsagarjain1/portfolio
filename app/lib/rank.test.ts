import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { RANKS, RANK_PEAK_AT, rankAt } from "./rank";

describe("rankAt", () => {
  it("starts at Iron 2 and ends at Immortal 1, the owner's peak", () => {
    expect(RANKS[0].name).toBe("Iron 2");
    expect(RANKS[RANKS.length - 1].name).toBe("Immortal 1");

    const top = rankAt(0);
    expect(top.name).toBe("Iron 2");
    expect(top.rr).toBe(0);
    expect(top.isPeak).toBe(false);

    const bottom = rankAt(100);
    expect(bottom.name).toBe("Immortal 1");
    expect(bottom.isPeak).toBe(true);
    expect(bottom.rr).toBe(0);
    expect(bottom.fraction).toBe(1);
  });

  it("reaches the peak exactly at RANK_PEAK_AT and not before", () => {
    expect(rankAt(RANK_PEAK_AT).isPeak).toBe(true);
    expect(rankAt(RANK_PEAK_AT - 0.01).isPeak).toBe(false);
    expect(rankAt(RANK_PEAK_AT - 0.01).name).toBe("Ascendant 2");
  });

  it("moves to the next rank at evenly spaced points", () => {
    const step = RANK_PEAK_AT / (RANKS.length - 1);
    for (let i = 0; i < RANKS.length; i++) {
      // Nudge past the boundary so float rounding cannot land us one rank early.
      expect(rankAt(i * step + 0.001).index).toBe(i);
    }
  });

  it("handles non-finite input without throwing", () => {
    expect(rankAt(Number.NaN).index).toBe(0);
    expect(rankAt(Number.POSITIVE_INFINITY).isPeak).toBe(true);
    expect(rankAt(Number.NEGATIVE_INFINITY).index).toBe(0);
  });

  it("gives every rank a deeper shade of its colour for marks on the light page", () => {
    for (const rank of RANKS) {
      expect(rank.color, rank.name).toMatch(/^#[0-9a-f]{6}$/i);
      expect(rank.bar, rank.name).toMatch(/^#[0-9a-f]{6}$/i);
      expect(rank.bar, rank.name).not.toBe(rank.color);
    }
    expect(rankAt(0).bar).toBe(RANKS[0].bar);
    expect(rankAt(100).bar).toBe(RANKS[RANKS.length - 1].bar);
  });

  // Feature: site-refresh, Property: rank is total and bounded
  it("always returns an in-range rank, rating and fraction", () => {
    fc.assert(
      fc.property(fc.double(), (progress) => {
        const r = rankAt(progress);
        expect(r.index).toBeGreaterThanOrEqual(0);
        expect(r.index).toBeLessThanOrEqual(RANKS.length - 1);
        expect(r.rr).toBeGreaterThanOrEqual(0);
        expect(r.rr).toBeLessThanOrEqual(99);
        expect(r.fraction).toBeGreaterThanOrEqual(0);
        expect(r.fraction).toBeLessThanOrEqual(1);
        expect(r.name).toBe(RANKS[r.index].name);
        expect(r.isPeak).toBe(r.index === RANKS.length - 1);
        if (r.isPeak) expect(r.rr).toBe(0);
      }),
    );
  });

  // Feature: site-refresh, Property: rank never goes down as progress grows
  it("never lowers the rank, or the rating within a rank, as progress grows", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        (a, b) => {
          const lo = rankAt(Math.min(a, b));
          const hi = rankAt(Math.max(a, b));
          expect(hi.index).toBeGreaterThanOrEqual(lo.index);
          if (hi.index === lo.index) {
            expect(hi.rr).toBeGreaterThanOrEqual(lo.rr);
            expect(hi.fraction).toBeGreaterThanOrEqual(lo.fraction);
          }
        },
      ),
    );
  });
});
