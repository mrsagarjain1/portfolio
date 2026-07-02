import { describe, it, expect } from "vitest";
import fc from "fast-check";

import {
  EFFECT_ASSIGNMENT,
  validateEffectAssignment,
  type EffectAssignment,
  type EffectAssignmentConfig,
  type EffectCategory,
  type Section,
} from "./effectAssignment";

const sections: Section[] = ["Hero", "Work", "Story", "Stack", "Contact"];
const categories: EffectCategory[] = ["parallax-depth", "reveal", "transition"];

/**
 * Independently count, per Section, how many assignments fall into each
 * (non-null) effect category. Returns the maximum such count across all
 * (Section, category) pairs — the invariant is that this is `<= 1`.
 */
function maxCategoryCountPerSection(config: EffectAssignmentConfig): number {
  const counts = new Map<string, number>();
  let max = 0;
  for (const a of config.assignments) {
    if (a.category === null) continue;
    const key = `${a.section}|${a.category}`;
    const next = (counts.get(key) ?? 0) + 1;
    counts.set(key, next);
    if (next > max) max = next;
  }
  return max;
}

const assignmentArb: fc.Arbitrary<EffectAssignment> = fc.record({
  component: fc.string({ minLength: 1, maxLength: 8 }),
  section: fc.constantFrom(...sections),
  category: fc.constantFrom<(EffectCategory | null)[]>(...categories, null),
});

const configArb: fc.Arbitrary<EffectAssignmentConfig> = fc.record({
  assignments: fc.array(assignmentArb, { maxLength: 25 }),
  excluded: fc.constant([]),
});

describe("validateEffectAssignment", () => {
  it("accepts the real activation matrix (at most one category per Section)", () => {
    const result = validateEffectAssignment(EFFECT_ASSIGNMENT);
    expect(result.valid).toBe(true);
    expect(result.violations).toEqual([]);
    expect(maxCategoryCountPerSection(EFFECT_ASSIGNMENT)).toBeLessThanOrEqual(1);
  });

  it("flags a Section that receives two components of the same category", () => {
    const config: EffectAssignmentConfig = {
      assignments: [
        { component: "ScrollDepth", section: "Stack", category: "parallax-depth" },
        { component: "ParallaxSection", section: "Stack", category: "parallax-depth" },
      ],
      excluded: [],
    };
    const result = validateEffectAssignment(config);
    expect(result.valid).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toMatchObject({
      section: "Stack",
      category: "parallax-depth",
    });
  });

  it("allows different categories and null-category accents to coexist in one Section", () => {
    const config: EffectAssignmentConfig = {
      assignments: [
        { component: "ImmersiveText", section: "Story", category: "reveal" },
        { component: "WaveSection", section: "Story", category: "transition" },
        { component: "ScrambleText", section: "Story", category: null },
        { component: "WaveformBars", section: "Story", category: null },
      ],
      excluded: [],
    };
    expect(validateEffectAssignment(config).valid).toBe(true);
  });

  // Feature: immersive-experience, Property 11: At most one effect per category per Section
  it("Property 11: for any Section, each effect category has at most one assigned component", () => {
    fc.assert(
      fc.property(configArb, (config) => {
        const result = validateEffectAssignment(config);
        const invariantHolds = maxCategoryCountPerSection(config) <= 1;

        // The validator agrees with an independent computation of the invariant.
        expect(result.valid).toBe(invariantHolds);

        // When the config is valid, the core property holds directly: no
        // (Section, category) pair has more than one assigned component.
        if (result.valid) {
          const counts = new Map<string, number>();
          for (const a of config.assignments) {
            if (a.category === null) continue;
            const key = `${a.section}|${a.category}`;
            counts.set(key, (counts.get(key) ?? 0) + 1);
          }
          for (const count of counts.values()) {
            expect(count).toBeLessThanOrEqual(1);
          }
        } else {
          // Every reported violation genuinely has more than one component.
          for (const v of result.violations) {
            expect(v.components.length).toBeGreaterThan(1);
          }
        }
      }),
    );
  });
});
