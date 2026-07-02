/**
 * Idle-component activation matrix for the immersive-experience feature.
 *
 * This framework-free module encodes which idle components are activated, the
 * Section each is anchored to, and the visual-effect category each contributes
 * (design.md "Idle Component Activation Plan"). It also provides
 * `validateEffectAssignment`, which enforces the "at most one component per
 * effect category per Section" rule (Req 2.4).
 *
 * Effect categories (Req 2.4):
 *   - "parallax-depth": parallax or depth translation      (A)
 *   - "reveal":         scroll-driven reveal               (B)
 *   - "transition":     transition / divider animation     (C)
 *
 * Hover accents (e.g. `ScrambleText`) and purely decorative components
 * (e.g. `WaveformBars`) belong to no category (`null`) and may freely coexist
 * with categorized effects in the same Section.
 *
 * See design.md and Property 11.
 */

/** A top-level content region on the home page. */
export type Section = "Hero" | "Work" | "Story" | "Stack" | "Contact";

/** The visual-effect categories that are mutually exclusive per Section (Req 2.4). */
export type EffectCategory = "parallax-depth" | "reveal" | "transition";

/** A single activated idle component and where/how it is applied. */
export interface EffectAssignment {
  /** The idle component being activated. */
  component: string;
  /** The Section the component is anchored to. */
  section: Section;
  /**
   * The visual-effect category this component contributes to its Section, or
   * `null` for hover accents / decorative components that belong to no
   * category (and therefore never conflict with categorized effects).
   */
  category: EffectCategory | null;
  /** Human-readable placement / rationale note. */
  note?: string;
}

/** An idle component that is intentionally not activated, with rationale (Req 2.5). */
export interface ExcludedComponent {
  component: string;
  reason: string;
}

/** The full idle-component activation configuration. */
export interface EffectAssignmentConfig {
  assignments: EffectAssignment[];
  excluded: ExcludedComponent[];
}

/** A per-Section, per-category rule violation (more than one component in a category). */
export interface CategoryViolation {
  section: Section;
  category: EffectCategory;
  components: string[];
}

/** The result of validating an {@link EffectAssignmentConfig}. */
export interface ValidationResult {
  valid: boolean;
  violations: CategoryViolation[];
}

/**
 * The idle-component activation matrix, encoded exactly as specified in
 * design.md's "Idle Component Activation Plan" table.
 *
 * `WaveSection` sits at the Story → Stack boundary; it is anchored to `Story`
 * (the Section it follows) as a transition/divider accent. Because `Story`'s
 * only other assignment is a reveal (`ImmersiveText`), the two categories do
 * not collide.
 */
export const EFFECT_ASSIGNMENT: EffectAssignmentConfig = {
  assignments: [
    {
      component: "SectionTransition",
      section: "Work",
      category: "transition",
      note: "Entrance transition for the Work grid; Work has no existing reveal wrapper.",
    },
    {
      component: "ImmersiveText",
      section: "Story",
      category: "reveal",
      note: "Character-stagger reveal on the narrative heading (distinct from Story body reveal).",
    },
    {
      component: "ScrollDepth",
      section: "Stack",
      category: "parallax-depth",
      note: "Subtle depth tilt on the crystalline Stack grid; no existing translation wrapper.",
    },
    {
      component: "ParallaxSection",
      section: "Contact",
      category: "parallax-depth",
      note: "Gentle parallax lift on the Contact block; Contact has no existing translation.",
    },
    {
      component: "WaveSection",
      section: "Story",
      category: "transition",
      note: "Animated wave divider at the Story → Stack boundary, complementing GeometryConnector.",
    },
    {
      component: "ScrambleText",
      section: "Hero",
      category: null,
      note: "Hover accent on Hero role text and Section eyebrow labels; not applied to body copy.",
    },
    {
      component: "WaveformBars",
      section: "Contact",
      category: null,
      note: "Single aria-hidden decorative accent near the Contact availability indicator.",
    },
  ],
  excluded: [
    {
      component: "ScrollVelocity",
      reason:
        "Infinite opacity pulse keyed to scroll velocity duplicates the mounted ScrollVelocityBlur effect and fights the calm aesthetic; adds a continuous loop with no distinct value.",
    },
  ],
};

/**
 * Validate that no Section receives more than one component in any single
 * effect category (Req 2.4). Assignments with a `null` category are ignored
 * because hover accents and decorative components belong to no category.
 *
 * Returns `valid: true` when every (Section, category) pair has at most one
 * assigned component; otherwise `valid: false` with the offending groups.
 */
export function validateEffectAssignment(
  config: EffectAssignmentConfig,
): ValidationResult {
  // Group categorized components by "section\u0000category".
  const groups = new Map<string, { section: Section; category: EffectCategory; components: string[] }>();

  for (const assignment of config.assignments) {
    if (assignment.category === null) {
      continue;
    }
    const key = `${assignment.section}\u0000${assignment.category}`;
    let group = groups.get(key);
    if (!group) {
      group = { section: assignment.section, category: assignment.category, components: [] };
      groups.set(key, group);
    }
    group.components.push(assignment.component);
  }

  const violations: CategoryViolation[] = [];
  for (const group of groups.values()) {
    if (group.components.length > 1) {
      violations.push({
        section: group.section,
        category: group.category,
        components: group.components,
      });
    }
  }

  return { valid: violations.length === 0, violations };
}
