import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

// Spy on the pure scroll-progress math while keeping the real implementation,
// so ScrollProgress's bounded output and per-frame throttling can be asserted
// without depending on how framer-motion commits transforms inside jsdom.
vi.mock("../lib/immersive/scroll", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/immersive/scroll")>();
  return {
    ...actual,
    computeScrollProgress: vi.fn(actual.computeScrollProgress),
  };
});

import { ScrollProgress } from "./ScrollProgress";
import { ParallaxSection } from "./ParallaxSection";
import { ScrollDepth } from "./ScrollDepth";
import { SectionTransition } from "./SectionTransition";
import { ImmersiveText } from "./ImmersiveText";
import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { SETTLE_MS } from "../lib/immersive/constants";
import { computeScrollProgress } from "../lib/immersive/scroll";
import {
  mockIntersectionObserver,
  mockMatchMedia,
  mockRequestAnimationFrame,
} from "../../vitest.setup";

/**
 * Component tests for scroll storytelling timing (task 13.4).
 *
 * Cover, with the shared browser mocks:
 *  - entrance-on-intersection: `SectionTransition` / `ImmersiveText` reveal when
 *    the mocked IntersectionObserver reports intersection and hold once-only
 *    after a later exit (Req 3.1, 3.6);
 *  - settle-on-idle: `ParallaxSection` / `ScrollDepth` ease back toward their
 *    resting position within `SETTLE_MS` once no scroll event has occurred for
 *    >100 ms (Req 3.4);
 *  - bounded scroll-progress output and one-update-per-animation-frame
 *    throttling for `ScrollProgress` (Req 3.2, 7.3).
 *
 * _Requirements: 3.1, 3.2, 3.4, 7.3_
 */

const progressSpy = vi.mocked(computeScrollProgress);

function withProvider(children: ReactNode) {
  return <ImmersiveProvider>{children}</ImmersiveProvider>;
}

/** The ease-to-rest transition applied by the parallax/depth wrappers. */
const SETTLE_TRANSITION = `transform ${SETTLE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

/** Redefine `window.scrollY` (a read-only getter in jsdom) for a test. */
function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    get: () => value,
  });
}

/** Fix the document's scrollable dimensions so progress is computable. */
function setScrollDimensions(scrollHeight: number, clientHeight: number) {
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    get: () => scrollHeight,
  });
  Object.defineProperty(document.documentElement, "clientHeight", {
    configurable: true,
    get: () => clientHeight,
  });
}

/** Parse the `rotateX(...)` degrees from a depth wrapper's transform. */
function readRotateX(el: HTMLElement): number {
  const match = /rotateX\((-?[\d.]+)deg\)/.exec(el.style.transform);
  if (!match) {
    throw new Error(`no rotateX in transform: "${el.style.transform}"`);
  }
  return Number(match[1]);
}

beforeEach(() => {
  progressSpy.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ScrollProgress — bounded output and per-frame throttling", () => {
  it("computes progress bounded to [0, 100] percent for the current scroll (Req 3.2)", () => {
    mockMatchMedia({ matches: false });
    const raf = mockRequestAnimationFrame();
    // scrollable height = 2000 - 1000 = 1000px.
    setScrollDimensions(2000, 1000);

    render(withProvider(<ScrollProgress />));

    // Half-scrolled -> 50%.
    setScrollY(500);
    act(() => raf.flush());
    expect(progressSpy).toHaveLastReturnedWith(50);

    // Scrolled far past the bottom -> clamped to 100%.
    setScrollY(999_999);
    act(() => raf.flush());
    expect(progressSpy).toHaveLastReturnedWith(100);

    // Negative scroll position -> clamped to 0%.
    setScrollY(-500);
    act(() => raf.flush());
    expect(progressSpy).toHaveLastReturnedWith(0);

    // Every value ever fed to the indicator stayed within [0, 100].
    for (const result of progressSpy.mock.results) {
      expect(result.type).toBe("return");
      expect(result.value as number).toBeGreaterThanOrEqual(0);
      expect(result.value as number).toBeLessThanOrEqual(100);
    }
  });

  it("recomputes at most once per animation frame (Req 7.3)", () => {
    mockMatchMedia({ matches: false });
    const raf = mockRequestAnimationFrame();
    setScrollDimensions(2000, 1000);

    render(withProvider(<ScrollProgress />));

    // No frame has ticked yet -> no computation.
    expect(progressSpy).not.toHaveBeenCalled();

    // One frame -> exactly one computation.
    setScrollY(500);
    act(() => raf.flush());
    expect(progressSpy).toHaveBeenCalledTimes(1);
    expect(progressSpy).toHaveLastReturnedWith(50);

    // Several scroll positions occur within a single frame (no flush between
    // them): the indicator must not recompute until the next frame.
    setScrollY(200);
    setScrollY(800);
    setScrollY(300);
    expect(progressSpy).toHaveBeenCalledTimes(1);

    // The next frame -> exactly one more computation, using the latest position.
    act(() => raf.flush());
    expect(progressSpy).toHaveBeenCalledTimes(2);
    expect(progressSpy).toHaveLastReturnedWith(30);
  });
});

describe("ParallaxSection — settle-on-idle (Req 3.4)", () => {
  it("tracks a bounded offset while scrolling, then eases back to rest when idle", () => {
    mockMatchMedia({ matches: false }); // motion enabled
    const raf = mockRequestAnimationFrame();
    const now = vi.spyOn(performance, "now");

    now.mockReturnValue(1000);
    const { container } = render(
      withProvider(
        <ParallaxSection className="parallax">
          <p>Contact content</p>
        </ParallaxSection>,
      ),
    );
    const el = container.querySelector<HTMLElement>(".parallax")!;
    expect(screen.getByText("Contact content")).toBeInTheDocument();

    // A scroll event marks activity at t=1000.
    act(() => {
      now.mockReturnValue(1000);
      window.dispatchEvent(new Event("scroll"));
    });

    // Frame 50 ms later: still "scrolling" (idle < 100 ms) -> bounded offset,
    // no transition lag. The offset is clamped to the ±100 px maximum.
    act(() => {
      now.mockReturnValue(1050);
      raf.flush();
    });
    expect(el.style.transform).toBe("translate3d(0, 100px, 0)");
    expect(el.style.transition).toBe("none");

    // Frame 200 ms after the last scroll: idle (>100 ms) -> ease back to the
    // resting position within SETTLE_MS via the settle transition.
    act(() => {
      now.mockReturnValue(1200);
      raf.flush();
    });
    expect(el.style.transform).toBe("translate3d(0, 0, 0)");
    expect(el.style.transition).toBe(SETTLE_TRANSITION);
  });
});

describe("ScrollDepth — settle-on-idle (Req 3.4)", () => {
  it("tilts within its bound while scrolling, then eases flat when idle", () => {
    mockMatchMedia({ matches: false });
    const raf = mockRequestAnimationFrame();
    const now = vi.spyOn(performance, "now");
    const restingTransform = "perspective(1200px) rotateX(0deg)";

    now.mockReturnValue(1000);
    const { container } = render(
      withProvider(
        <ScrollDepth className="depth" strength={3}>
          <p>Stack content</p>
        </ScrollDepth>,
      ),
    );
    const el = container.querySelector<HTMLElement>(".depth")!;
    expect(screen.getByText("Stack content")).toBeInTheDocument();

    act(() => {
      now.mockReturnValue(1000);
      window.dispatchEvent(new Event("scroll"));
    });

    // Actively scrolling: a non-zero tilt bounded by `strength` degrees.
    act(() => {
      now.mockReturnValue(1050);
      raf.flush();
    });
    expect(el.style.transition).toBe("none");
    expect(el.style.transform).not.toBe(restingTransform);
    const tilt = readRotateX(el);
    expect(tilt).not.toBe(0);
    expect(Math.abs(tilt)).toBeLessThanOrEqual(3);

    // Idle: ease back to the flat resting position within SETTLE_MS.
    act(() => {
      now.mockReturnValue(1200);
      raf.flush();
    });
    expect(el.style.transform).toBe(restingTransform);
    expect(el.style.transition).toBe(SETTLE_TRANSITION);
  });
});

describe("SectionTransition — entrance-on-intersection, once-only (Req 3.1, 3.6)", () => {
  it("reveals when the section intersects and holds once-only after a later exit", () => {
    mockMatchMedia({ matches: false }); // motion enabled
    const io = mockIntersectionObserver();

    render(
      withProvider(
        <SectionTransition className="reveal">
          <p>Work</p>
        </SectionTransition>,
      ),
    );

    // Child content is always present in the output.
    expect(screen.getByText("Work")).toBeInTheDocument();
    // A single observer watches the section before it has revealed.
    expect(io.instances).toHaveLength(1);
    expect(io.instances[0].disconnect).not.toHaveBeenCalled();

    // The section crosses the ~10% threshold -> entrance fires and the latch
    // disconnects the observer (nothing left to watch).
    act(() => io.trigger(true));
    expect(io.instances[0].disconnect).toHaveBeenCalled();

    // A later exit observation must NOT re-observe or replay the entrance:
    // no new observer is created and the content stays present.
    act(() => io.trigger(false));
    expect(io.instances).toHaveLength(1);
    expect(screen.getByText("Work")).toBeInTheDocument();
  });
});

describe("ImmersiveText — entrance-on-intersection, once-only (Req 3.1, 3.6)", () => {
  it("reveals when the text intersects and holds once-only after a later exit", () => {
    mockMatchMedia({ matches: false });
    const io = mockIntersectionObserver();

    const { container } = render(
      withProvider(<ImmersiveText text="Story" className="immersive-text" />),
    );
    const el = container.querySelector<HTMLElement>(".immersive-text")!;

    // The full text is present (rendered per-character).
    expect(el).toHaveTextContent("Story");
    expect(io.instances).toHaveLength(1);
    expect(io.instances[0].disconnect).not.toHaveBeenCalled();

    act(() => io.trigger(true));
    expect(io.instances[0].disconnect).toHaveBeenCalled();

    // Once-only: a later exit does not re-observe or drop the content.
    act(() => io.trigger(false));
    expect(io.instances).toHaveLength(1);
    expect(el).toHaveTextContent("Story");
  });
});
