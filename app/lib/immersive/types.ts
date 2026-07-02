/**
 * Shared type definitions for the immersive-experience coordination layer and
 * pure-logic module. These types are framework-free (no React/DOM dependencies)
 * so they can be consumed by both the pure logic in `app/lib/immersive/` and the
 * React components/hooks that subscribe to the coordination layer.
 *
 * See design.md "Data Models" for the source-of-truth shapes.
 */

/** Performance capability tier, highest to lowest fidelity. */
export type Tier = "full" | "reduced" | "minimal";

/** Pointer capability of the current device. */
export type PointerType = "fine" | "coarse";

/** Reactive capability state owned by the ImmersiveProvider. */
export interface ImmersiveState {
  /** `false` => reduced motion is preferred. */
  motionEnabled: boolean;
  pointerType: PointerType;
  tabVisible: boolean;
  performanceTier: Tier;
}

/** A registered continuous pointer-following effect. */
export interface EffectDesc {
  id: string;
  /** Higher priority effects are kept first when capping. */
  priority: number;
  category: "cursor" | "trail" | "magnetic" | "glow";
}

/** A single ripple in the discrete pointer-down ripple effect. */
export interface Ripple {
  x: number;
  y: number;
  r: number;
  life: number;
}

/** Latched reveal state: transitions `false` -> `true` only. */
export interface RevealState {
  revealed: boolean;
}

/** A single performance sample from the shared frame clock. */
export interface PerfSample {
  t: number;
  frameMs: number;
}

/** Rolling-window state for the performance governor. */
export interface GovernorState {
  window: PerfSample[];
  tier: Tier;
}

/** Page-load intro lifecycle state machine. */
export interface IntroState {
  phase: "checking" | "playing" | "reducedFast" | "revealed" | "skipped";
  startedAt: number;
}
