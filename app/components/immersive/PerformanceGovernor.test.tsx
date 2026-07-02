import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { PerformanceGovernor } from "./PerformanceGovernor";
import {
  ImmersiveProvider,
  useImmersiveContext,
} from "./ImmersiveProvider";
import {
  mockMatchMedia,
  mockRequestAnimationFrame,
  setVisibilityState,
} from "../../../vitest.setup";

/**
 * Component tests for the performance governor (task 9.2).
 *
 * These feed synthetic frames through the shared frame clock and assert that:
 *  - sustained over-budget frames step the performance tier down (Req 7.6);
 *  - a borderline recovery (fraction inside the hysteresis band) holds the tier
 *    and only upgrades once the fraction clears the band (Req 7.6);
 *  - sampling pauses while the tab is hidden and resumes when visible (Req 7.4).
 *
 * This is an example/component test (not a property-based test): the governor's
 * pure math is covered by Properties 9 and 10; here we verify the reactive
 * wiring and pause behavior.
 */

/** Surfaces the provider's live performance tier into the DOM. */
function TierProbe() {
  const { performanceTier } = useImmersiveContext();
  return <span data-testid="tier">{performanceTier}</span>;
}

/** Force a known logical-core count so the initial tier is deterministic. */
function setHardwareConcurrency(cores: number) {
  Object.defineProperty(navigator, "hardwareConcurrency", {
    configurable: true,
    get: () => cores,
  });
}

function renderGovernor() {
  return render(
    <ImmersiveProvider>
      <PerformanceGovernor />
      <TierProbe />
    </ImmersiveProvider>,
  );
}

function tier() {
  return screen.getByTestId("tier").textContent;
}

describe("PerformanceGovernor", () => {
  it("steps the tier down when frames run over budget", () => {
    mockMatchMedia({ matches: false });
    setHardwareConcurrency(12); // > 8 cores => starts at "full"
    const raf = mockRequestAnimationFrame();

    renderGovernor();
    expect(tier()).toBe("full");

    // First frame: a single timestamp is a full-budget (healthy) sample, so the
    // tier stays at full (already the ceiling).
    act(() => raf.flush(0));
    expect(tier()).toBe("full");

    // 100ms since the previous frame is well over the 16.7ms budget => the
    // measured fraction is 0, which is below threshold: step down one level.
    act(() => raf.flush(100));
    expect(tier()).toBe("reduced");

    // Another over-budget frame steps down again to the minimum tier.
    act(() => raf.flush(200));
    expect(tier()).toBe("minimal");
  });

  it("holds the tier in the hysteresis band and only upgrades past it", () => {
    mockMatchMedia({ matches: false });
    setHardwareConcurrency(12);
    const raf = mockRequestAnimationFrame();

    renderGovernor();

    // Drive down to the minimal tier with two over-budget frames.
    act(() => raf.flush(0));
    act(() => raf.flush(100));
    act(() => raf.flush(200));
    expect(tier()).toBe("minimal");

    // Feed within-budget frames spaced 10ms apart. The two earlier slow frames
    // stay in the 5s window, so the fraction climbs as good frames accumulate:
    // fraction = good / (good + 2). At 18 good frames it reaches exactly 0.9 —
    // the bottom of the hysteresis band [0.9, 0.95) — where recovery is held.
    let t = 200;
    for (let i = 0; i < 18; i += 1) {
      t += 10;
      act(() => raf.flush(t));
    }
    // fraction === 18 / 20 === 0.9 (borderline): tier must NOT upgrade.
    expect(tier()).toBe("minimal");

    // Keep feeding good frames until the fraction reaches 0.95 (38 good frames:
    // 38 / 40), which clears the hysteresis band and permits a one-step upgrade.
    for (let i = 18; i < 38; i += 1) {
      t += 10;
      act(() => raf.flush(t));
    }
    // fraction === 38 / 40 === 0.95: recovery past the band upgrades one tier.
    expect(tier()).toBe("reduced");
  });

  it("pauses sampling while the tab is hidden and resumes when visible", () => {
    mockMatchMedia({ matches: false });
    setHardwareConcurrency(12);
    const raf = mockRequestAnimationFrame();

    renderGovernor();

    // Degrade one step so there is a non-ceiling tier to observe.
    act(() => raf.flush(0));
    act(() => raf.flush(100));
    expect(tier()).toBe("reduced");

    // Hide the tab: sampling pauses and the rolling window is cleared.
    act(() => setVisibilityState("hidden"));

    // Feed grossly over-budget frames while hidden — if sampling were active
    // these would degrade the tier to minimal. Because sampling is paused, the
    // tier must remain unchanged.
    act(() => raf.flush(5000));
    act(() => raf.flush(10000));
    act(() => raf.flush(15000));
    expect(tier()).toBe("reduced");

    // Make the tab visible again: sampling resumes with a fresh window. A single
    // healthy frame reports a full-budget fraction, permitting a one-step
    // recovery — proving the governor is sampling again.
    act(() => setVisibilityState("visible"));
    act(() => raf.flush(20000));
    expect(tier()).toBe("full");
  });
});
