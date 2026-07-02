# Implementation Plan: Immersive Experience

## Overview

This plan implements the immersive-experience feature by building a thin coordination layer (context + hooks) and a framework-free pure-logic module, then refactoring the existing visual components to subscribe to that layer. The work follows a test-driven order: test tooling is stood up first, the pure-logic module and its 13 property-based tests are built next, then the coordination layer, then the component refactors, idle-component activation, and finally the intro rebuild and accessibility pass.

Implementation language is **TypeScript** (Next.js App Router + React), consistent with the design. Property-based tests use **fast-check** (minimum 100 iterations each), component/interaction tests use **Vitest + @testing-library/react**. Each property test is tagged `// Feature: immersive-experience, Property N: {property_text}`.

## Tasks

- [x] 1. Set up test tooling
  - [x] 1.1 Install and configure Vitest, @testing-library/react, and fast-check
    - Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `fast-check`, `jsdom`, and `@vitejs/plugin-react` as dev dependencies with pinned versions
    - Create `vitest.config.ts` with the jsdom environment, React plugin, and a global fast-check `numRuns` of at least 100
    - Create a test setup file (`vitest.setup.ts`) that installs `jest-dom` matchers and provides mock scaffolding for `matchMedia`, `IntersectionObserver`, `requestAnimationFrame`, `document.visibilityState`, and `sessionStorage`
    - Add `test` and `test:run` scripts to `package.json` (use `vitest run` for single-run execution, not watch mode)
    - _Requirements: Testing Strategy (Tooling)_

- [x] 2. Build pure-logic foundation and scroll math
  - [x] 2.1 Create shared types and constants module
    - Create `app/lib/immersive/types.ts` with `Tier`, `PointerType`, `ImmersiveState`, `EffectDesc`, `Ripple`, `RevealState`, `PerfSample`, `GovernorState`, `IntroState`
    - Create `app/lib/immersive/constants.ts` with `MAX_PARALLAX_PX`, `MAX_MAGNETIC_PX`, `MAX_RIPPLES`, `MAX_CONCURRENT_POINTER_EFFECTS`, `FRAME_BUDGET_MS`, `PERF_WINDOW_MS`, `PERF_THRESHOLD`, `INTRO_MAX_MS`, `INTRO_FAILSAFE_MS`, `INTRO_REDUCED_MS`, `SETTLE_MS`
    - _Requirements: Data Models_

  - [x] 2.2 Implement scroll math in `app/lib/immersive/scroll.ts`
    - Implement `computeScrollProgress(scrollY, scrollHeight, clientHeight)` returning a finite value clamped to `[0, 100]`, defined for zero/negative/large inputs
    - Implement `computeParallaxOffset(scrollY, elementTop, viewportH, speed, max=MAX_PARALLAX_PX)` clamped to `[-max, max]`
    - Implement `blendTopology(scroll, sectionCount)` returning `{ fromIdx, toIdx, t }`
    - _Requirements: 3.2, 3.3, 3.5_

  - [x]* 2.3 Write property test for scroll progress bounds
    - **Property 1: Scroll progress is bounded to [0, 100]**
    - **Validates: Requirements 3.2**
    - Generate real values (including zero, negative, very large) for all three inputs; assert result is finite and within `[0, 100]`

  - [x]* 2.4 Write property test for parallax offset bound and reduced-motion zero
    - **Property 2: Scroll translation offset is bounded, and zero under reduced motion**
    - **Validates: Requirements 3.3, 3.5**
    - Assert `|computeParallaxOffset(...)| <= MAX_PARALLAX_PX` for arbitrary inputs, and that the effective applied offset is exactly `0` when motion is disabled

- [x] 3. Implement pointer math
  - [x] 3.1 Implement `app/lib/immersive/pointer.ts`
    - Implement `clampMagneticOffset(dx, dy, max=MAX_MAGNETIC_PX)` returning an offset with Euclidean magnitude `<= max` that preserves direction for non-zero deltas
    - Implement `selectActivePointerEffects(effects, cap, tier)` returning a duplicate-free subset of size `<= cap` and `<=` the tier budget, keeping highest-priority effects first
    - _Requirements: 4.1, 4.3, 4.7, 7.3_

  - [x]* 3.2 Write property test for magnetic offset bound
    - **Property 4: Magnetic offset magnitude never exceeds the bound**
    - **Validates: Requirements 4.3**
    - Assert magnitude `<= MAX_MAGNETIC_PX` for arbitrary deltas and direction preservation when non-zero

  - [x]* 3.3 Write property test for pointer-effect selection cap
    - **Property 5: Active pointer-effect selection never exceeds the cap**
    - **Validates: Requirements 4.1, 4.7, 7.3**
    - For arbitrary effect sets, `cap >= 0`, and any tier, assert the result size `<= cap` and `<=` tier budget, contains no duplicates, and consists of the highest-priority effects

- [x] 4. Implement capped-buffer eviction
  - [x] 4.1 Implement `app/lib/immersive/ripple.ts`
    - Implement `pushWithCap<T>(items, next, cap)` that keeps the newest items in insertion order and evicts oldest first, with result length `<= cap`
    - _Requirements: 4.6_

  - [x]* 4.2 Write property test for capped buffer
    - **Property 3: A capped buffer retains only the newest N items in insertion order**
    - **Validates: Requirements 4.6**
    - Fold arbitrary push sequences with `cap >= 0`; after every push assert length `<= cap`, result equals last `cap` inserted items in insertion order, and evicted items are the oldest

- [x] 5. Implement performance tier and frame math
  - [x] 5.1 Implement `app/lib/immersive/performance.ts`
    - Implement `frameFraction(timestamps, windowMs, budgetMs)` returning `[0, 1]` (defined as `1` when the window contains no frames)
    - Implement `selectTier(currentTier, fraction, threshold=PERF_THRESHOLD)` as a monotone one-step degrade with hysteresis on recovery
    - Implement `computeElementCount(tier, cores, full)` and a `tierFor(cores)` helper giving `<=4`-core devices `<= 50%` of the high-core count
    - _Requirements: 5.5, 7.1, 7.6_

  - [x]* 5.2 Write property test for low-core element count
    - **Property 6: Low-core devices render at most half the element count**
    - **Validates: Requirements 5.5**
    - For arbitrary `full` and cores `low <= 4 < high`, assert `computeElementCount(tierFor(low), low, full) <= 0.5 * computeElementCount(tierFor(high), high, full)`

  - [x]* 5.3 Write property test for frame-fraction measurement
    - **Property 9: Frame-fraction measurement is correct and bounded**
    - **Validates: Requirements 7.1**
    - Assert result in `[0, 1]` equal to (frames within budget in window) / (frames in window), and `1` when the window has no frames

  - [x]* 5.4 Write property test for tier degradation
    - **Property 10: Performance tier degrades (never upgrades) when below threshold**
    - **Validates: Requirements 7.6**
    - For any current tier and `fraction < PERF_THRESHOLD`, assert the returned tier is `<=` current and steps by at most one level

- [x] 6. Implement motion, contrast, reveal, intro, and effect-assignment logic
  - [x] 6.1 Implement `app/lib/immersive/motion.ts`
    - Implement `resolveMotionState(prefReduce)` returning `{ animate, loop }`
    - _Requirements: 1.1, 1.2_

  - [x] 6.2 Implement `app/lib/immersive/contrast.ts`
    - Implement `computeContrastRatio(bodyTextColor, compositedBackground)` and a helper that composites background opacity/brightness within the ambient layer's allowed range
    - _Requirements: 5.2_

  - [x]* 6.3 Write property test for background contrast
    - **Property 8: Background preserves body-text contrast**
    - **Validates: Requirements 5.2**
    - For arbitrary background opacity/brightness within the allowed range, assert `computeContrastRatio(...) >= 4.5`

  - [x] 6.4 Implement reveal-latch reducer in `app/lib/immersive/reveal.ts`
    - Implement a `revealReducer(state, observation)` that flips `revealed` from `false` to `true` and never back
    - _Requirements: 3.6_

  - [x]* 6.5 Write property test for reveal latch monotonicity
    - **Property 7: Section reveal latch is monotone**
    - **Validates: Requirements 3.6**
    - Fold arbitrary boolean observation sequences; assert once `revealed` is `true` it stays `true` for all subsequent observations

  - [x] 6.6 Implement intro session guard in `app/lib/immersive/intro.ts`
    - Implement `shouldShowIntro(sessionStore)` that returns `true` only on the first call with an unset flag and sets the flag; treat a throwing/absent store as "not yet shown" with an in-memory fallback
    - _Requirements: 6.7_

  - [x]* 6.7 Write property test for intro session guard
    - **Property 13: The intro overlay shows only on the first session invocation**
    - **Validates: Requirements 6.7**
    - For arbitrary sequences of calls sharing one session store, assert only the first returns `true` and all subsequent calls return `false`

  - [x] 6.8 Implement effect-assignment config in `app/lib/immersive/effectAssignment.ts`
    - Encode the idle-component activation matrix (Section → component → category) and a `validateEffectAssignment(config)` that checks category counts per Section
    - _Requirements: 2.1, 2.4_

  - [x]* 6.9 Write property test for one-effect-per-category
    - **Property 11: At most one effect per category per Section**
    - **Validates: Requirements 2.4**
    - For any Section in the config, assert the count of assigned components in each category (parallax/depth, reveal, transition) is at most one

- [x] 7. Checkpoint - pure logic complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Build the coordination layer
  - [x] 8.1 Implement `app/components/immersive/ImmersiveProvider.tsx`
    - Create the client provider owning `motionEnabled`, `pointerType`, `tabVisible`, `performanceTier` with live `matchMedia` `change` and `visibilitychange` listeners and safe SSR defaults
    - Implement the pointer broadcaster (single `mousemove`, notify at most once per animation frame) and the shared frame clock (single `requestAnimationFrame` loop), plus `registerPointerEffect(id, priority)` backed by `selectActivePointerEffects`
    - Tear down all listeners/subscriptions on unmount
    - _Requirements: 1.3, 1.4, 4.2, 5.3, 5.4, 7.2, 7.3, 7.4_

  - [x]* 8.2 Write component tests for provider signals
    - Assert `motionEnabled` and `performanceTier`/`pointerType`/`tabVisible` update on mocked `matchMedia` change and `visibilitychange`, and SSR defaults resolve correctly
    - _Requirements: 1.3, 1.4, 5.3, 5.4, 7.4_

  - [x] 8.3 Implement coordination hooks in `app/hooks/`
    - Implement `useReducedMotion`, `usePointerCapability`, `useTabVisibility`, `usePointerBroadcast(handler, opts?)`, `useFrameClock(handler)`, `usePerformanceTier`, and `useSectionReveal(ref)` (one `IntersectionObserver` at threshold ≈ 0.1, backed by `revealReducer`)
    - Each hook returns a cleanup that removes its subscription
    - _Requirements: 1.1, 3.1, 3.6, 4.1, 7.3_

  - [x]* 8.4 Write unit/component tests for hooks
    - Test throttle-to-one-update-per-frame for `usePointerBroadcast`/`useFrameClock`, latched reveal via mocked `IntersectionObserver`, and cleanup on unmount
    - _Requirements: 3.1, 7.3_

- [x] 9. Build the performance governor
  - [x] 9.1 Implement `usePerformanceGovernor` and `app/components/immersive/PerformanceGovernor.tsx`
    - Sample frame timestamps from the shared frame clock into a rolling 5-second window, compute `frameFraction`, drive `selectTier`, and publish the degrade signal to the provider; pause sampling while the tab is hidden
    - _Requirements: 7.1, 7.4, 7.6_

  - [x]* 9.2 Write component test for governor degradation
    - Feed synthetic slow frames and assert the tier steps down below threshold and holds (hysteresis) on borderline recovery; assert sampling pauses when hidden
    - _Requirements: 7.6, 7.4_

- [x] 10. Wire the coordination layer into the app shell
  - [x] 10.1 Wrap the tree in `ImmersiveProvider` and mount `PerformanceGovernor` in `app/layout.tsx`
    - Wrap the body content in `ImmersiveProvider` and mount `PerformanceGovernor` once at the top of the tree, preserving existing mounted components
    - _Requirements: 1.1, 7.1_

- [x] 11. Refactor the ambient background
  - [x] 11.1 Refactor `NeuralMeshBackground` to subscribe to the coordination layer
    - Subscribe to `tabVisible` (pause/resume rAF within budget), `motionEnabled` (render a single static frame under reduced motion), and `performanceTier`; route node count through `computeElementCount`
    - Wrap WebGL/canvas init in `try/catch` that disposes partial resources and returns an empty `aria-hidden` container on failure (dev-only console log); keep `z-index: 0`, `pointer-events: none`, `aria-hidden`
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6, 7.4, 7.5_

  - [x]* 11.2 Write component tests for ambient background
    - Assert visibility pause/resume, static frame under reduced motion, forced-init-failure fallback stays interactive, and decorative stacking/isolation
    - _Requirements: 5.1, 5.3, 5.4, 5.6, 7.4, 7.5_

- [x] 12. Refactor and coordinate pointer components
  - [x] 12.1 Refactor `CustomCursor` and `CursorGlow`
    - Subscribe to the pointer broadcaster and register with the effect registry; render `null` on a coarse pointer; gate continuous motion on `motionEnabled`; keep a visible pointer indication (restore native cursor when the custom cursor is disabled)
    - _Requirements: 4.1, 4.2, 4.7, 4.8, 7.2, 7.3_

  - [x] 12.2 Refactor `MouseTrail` and `SparkTrail`
    - Subscribe to the pointer broadcaster + registry; disable trailing under reduced motion; render `null` on a coarse pointer
    - _Requirements: 4.1, 4.2, 4.7, 7.2, 7.3_

  - [x] 12.3 Refactor `MagneticElements`
    - Route translation through `clampMagneticOffset` (≤20 px) and return elements to rest within `SETTLE_MS` on pointer-leave; gate on `motionEnabled` and pointer capability
    - _Requirements: 4.3, 4.4, 4.7, 7.2_

  - [x] 12.4 Refactor `RippleEffect`
    - Route ripple state through `pushWithCap(..., MAX_RIPPLES)` (oldest-first eviction) and remove each ripple within 1000 ms; exempt from the follower cap
    - _Requirements: 4.5, 4.6_

  - [x]* 12.5 Write component tests for pointer interactivity
    - Assert pointer follow, coarse-pointer omission, cursor visibility, ripple lifecycle, and one-update-per-frame throttling
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.8, 7.2, 7.3_

- [x] 13. Refactor scroll storytelling components
  - [x] 13.1 Refactor `ScrollProgress`
    - Route through `computeScrollProgress` and throttle updates to one per animation frame
    - _Requirements: 3.2, 7.3_

  - [x] 13.2 Refactor `ParallaxSection` and `ScrollDepth`
    - Route offset through `computeParallaxOffset` (±100 px), ease back to resting position on scroll idle, and present final position under reduced motion
    - _Requirements: 3.3, 3.4, 3.5_

  - [x] 13.3 Refactor `SectionTransition` and `ImmersiveText`
    - Use `useSectionReveal` for once-only entrance completing within 1000 ms; render children in final visible state when motion is off; hold final state without replay while in viewport
    - _Requirements: 3.1, 3.5, 3.6_

  - [x]* 13.4 Write component tests for scroll timing
    - Assert entrance-on-intersection and settle-on-idle timing with mocked `IntersectionObserver` and fake timers, bounded scroll-progress output, and throttling
    - _Requirements: 3.1, 3.2, 3.4, 7.3_

- [x] 14. Rebuild the page-load intro lifecycle
  - [x] 14.1 Rebuild `PageIntro` around the intro state machine
    - Implement the phases (checking → skipped/reducedFast/playing → revealed) using `shouldShowIntro`, a reduced-motion fast path (≤500 ms, no animation), a 3500 ms failsafe timeout, focus containment via `inert`/focus trap while visible, and full unmount that restores body scroll on reveal
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x]* 14.2 Write component tests for intro lifecycle
    - Assert overlay presence/removal, timing bounds, focus containment then release, failsafe reveal on stalled animation, and reduced-motion fast path with fake timers
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 15. Activate idle components in the home page
  - [x] 15.1 Wire the activation matrix into `app/page.tsx`
    - Wrap Work in `SectionTransition`, Story heading in `ImmersiveText`, Stack in `ScrollDepth`, Contact in `ParallaxSection`; add `WaveSection` at the Story→Stack boundary; apply `ScrambleText` to eyebrow labels and Hero role text; add a single `aria-hidden` `WaveformBars` accent near the Contact availability indicator
    - Preserve all pre-existing Section content as children of each wrapper; do not activate `ScrollVelocity` (documented exclusion)
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [x]* 15.2 Write property test for wrapper child preservation
    - **Property 12: Wrapper components preserve their children**
    - **Validates: Requirements 2.2, 2.6**
    - For arbitrary child content, assert each activating wrapper (`ParallaxSection`, `ScrollDepth`, `SectionTransition`, `WaveSection`) renders that exact child content in its output

  - [x]* 15.3 Write component tests for idle-component presence and exclusion
    - Render the home page and assert each activated component appears in at least one Section, and that any component rendering no visible content with no interaction is excluded
    - _Requirements: 2.1, 2.5_

- [x] 16. Enforce accessibility invariants across the layer
  - [x] 16.1 Apply decorative isolation and focus guarantees
    - Ensure decorative elements are `aria-hidden` with no role and removed from the tab sequence, overlays use `pointer-events: none`, focus order matches reading order, and focus indicators are not obscured by the immersive layer or custom cursor
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x]* 16.2 Write accessibility component tests
    - Assert decorative isolation, non-interference of overlays, keyboard focus order/operability, visible focus indicator, and preserved semantic structure
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP; core implementation tasks are never marked optional.
- Each of the 13 correctness properties is implemented by exactly one property-based test, tagged `// Feature: immersive-experience, Property N: {property_text}` and run for at least 100 iterations via fast-check.
- Property tests target the pure-logic module `app/lib/immersive/`; rendering, timing, browser-event, and accessibility criteria are covered by example/component tests per the design's Testing Strategy.
- Requirement 7.1's live 90%-frames-in-budget target is not deterministically unit-asserted; its measurement is covered by Property 9 and its reactive degradation by Property 10.
- Each task references the specific requirement clauses or design property it implements for traceability.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "4.1", "5.1", "6.1", "6.2", "6.4", "6.6", "6.8"] },
    { "id": 3, "tasks": ["2.3", "2.4", "3.2", "3.3", "4.2", "5.2", "5.3", "5.4", "6.3", "6.5", "6.7", "6.9"] },
    { "id": 4, "tasks": ["8.1"] },
    { "id": 5, "tasks": ["8.2", "8.3"] },
    { "id": 6, "tasks": ["8.4", "9.1"] },
    { "id": 7, "tasks": ["9.2", "10.1"] },
    { "id": 8, "tasks": ["11.1", "12.1", "12.2", "12.3", "12.4", "13.1", "13.2", "13.3", "14.1"] },
    { "id": 9, "tasks": ["11.2", "12.5", "13.4", "14.2", "15.1", "15.2"] },
    { "id": 10, "tasks": ["15.3", "16.1"] },
    { "id": 11, "tasks": ["16.2"] }
  ]
}
```
