import { describe, it, expect } from "vitest";
import fc from "fast-check";

import { clampMagneticOffset, selectActivePointerEffects, tierBudget } from "./pointer";
import { MAX_MAGNETIC_PX } from "./constants";
import type { EffectDesc, Tier } from "./types";

const EPSILON = 1e-9;

describe("clampMagneticOffset", () => {
  it("returns the origin for a zero delta", () => {
    expect(clampMagneticOffset(0, 0)).toEqual({ x: 0, y: 0 });
  });

  it("passes through deltas already within the bound", () => {
    expect(clampMagneticOffset(3, 4)).toEqual({ x: 3, y: 4 });
  });

  it("scales an over-long delta down to the bound", () => {
    const { x, y } = clampMagneticOffset(30, 40); // magnitude 50
    expect(Math.hypot(x, y)).toBeCloseTo(MAX_MAGNETIC_PX, 6);
    // direction preserved: original was (0.6, 0.8) unit vector
    expect(x / y).toBeCloseTo(30 / 40, 6);
  });

  // Feature: immersive-experience, Property 4: Magnetic offset magnitude never exceeds the bound
  it("Property 4: magnitude never exceeds the bound and direction is preserved when non-zero", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        (dx, dy) => {
          const { x, y } = clampMagneticOffset(dx, dy);
          const magnitude = Math.hypot(x, y);

          // Magnitude bound holds for all inputs.
          expect(magnitude).toBeLessThanOrEqual(MAX_MAGNETIC_PX + EPSILON);

          // Direction preservation for non-zero deltas: the clamped vector is a
          // non-negative scalar multiple of the original (cross product ~ 0 and
          // dot product >= 0).
          if (Math.hypot(dx, dy) > 0) {
            const cross = dx * y - dy * x;
            const dot = dx * x + dy * y;
            const scaleRef = Math.max(1, Math.hypot(dx, dy) * magnitude);
            expect(Math.abs(cross) / scaleRef).toBeLessThan(1e-6);
            expect(dot).toBeGreaterThanOrEqual(-EPSILON);
          }
        },
      ),
    );
  });
});

const categories: EffectDesc["category"][] = ["cursor", "trail", "magnetic", "glow"];
const tiers: Tier[] = ["full", "reduced", "minimal"];

const effectArb: fc.Arbitrary<EffectDesc> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 6 }),
  priority: fc.integer({ min: -100, max: 100 }),
  category: fc.constantFrom(...categories),
});

describe("selectActivePointerEffects", () => {
  it("keeps the highest-priority effects first", () => {
    const effects: EffectDesc[] = [
      { id: "cursor", priority: 5, category: "cursor" },
      { id: "glow", priority: 4, category: "glow" },
      { id: "magnetic", priority: 3, category: "magnetic" },
      { id: "trail", priority: 2, category: "trail" },
      { id: "spark", priority: 1, category: "trail" },
    ];
    expect(selectActivePointerEffects(effects, 4, "full")).toEqual([
      "cursor",
      "glow",
      "magnetic",
      "trail",
    ]);
  });

  it("retains only the single highest-priority effect at the minimal tier", () => {
    const effects: EffectDesc[] = [
      { id: "cursor", priority: 5, category: "cursor" },
      { id: "glow", priority: 4, category: "glow" },
      { id: "trail", priority: 2, category: "trail" },
    ];
    // The minimal tier keeps one slot so the primary cursor is never culled.
    expect(selectActivePointerEffects(effects, 4, "minimal")).toEqual(["cursor"]);
  });

  // Feature: immersive-experience, Property 5: Active pointer-effect selection never exceeds the cap
  it("Property 5: result respects cap and tier budget, is duplicate-free, and keeps highest priority", () => {
    fc.assert(
      fc.property(
        fc.array(effectArb, { maxLength: 20 }),
        fc.integer({ min: -3, max: 12 }),
        fc.constantFrom(...tiers),
        (effects, cap, tier) => {
          const result = selectActivePointerEffects(effects, cap, tier);
          const effectiveBudget = Math.max(0, Math.min(cap, tierBudget(tier)));

          // Size bounds: at most the cap and at most the tier budget.
          expect(result.length).toBeLessThanOrEqual(effectiveBudget);
          if (cap >= 0) expect(result.length).toBeLessThanOrEqual(cap);
          expect(result.length).toBeLessThanOrEqual(tierBudget(tier));

          // Duplicate-free.
          expect(new Set(result).size).toBe(result.length);

          // Consists of the highest-priority effects: build the expected ranking
          // by deduplicating on id (keeping the max priority) and sorting.
          const byId = new Map<string, number>();
          for (const e of effects) {
            const prev = byId.get(e.id);
            if (prev === undefined || e.priority > prev) byId.set(e.id, e.priority);
          }
          const rankedIds = [...byId.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([id]) => id);

          // Every returned id is a real id.
          for (const id of result) expect(byId.has(id)).toBe(true);

          // The result priorities are the top-`length` priorities available: the
          // minimum selected priority is >= the priority of any unselected id.
          const selected = new Set(result);
          const selectedPriorities = result.map((id) => byId.get(id)!);
          const minSelected = selectedPriorities.length
            ? Math.min(...selectedPriorities)
            : Infinity;
          for (const id of rankedIds) {
            if (!selected.has(id)) {
              expect(byId.get(id)!).toBeLessThanOrEqual(minSelected);
            }
          }
        },
      ),
    );
  });
});
