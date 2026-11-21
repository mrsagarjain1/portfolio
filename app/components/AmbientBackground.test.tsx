import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { AmbientBackground, dotCountFor } from "./AmbientBackground";
import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import {
  mockMatchMedia,
  mockRequestAnimationFrame,
  setVisibilityState,
} from "../../vitest.setup";

/** A 2D context that only records what was drawn. jsdom has no real canvas. */
function fakeContext() {
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    lineWidth: 1,
    strokeStyle: "",
    fillStyle: "",
  };
}

/** `window.innerWidth` is read-only in the DOM typings, but jsdom lets a test set it. */
function setWindowWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
}

let ctx: ReturnType<typeof fakeContext>;

function renderBackground() {
  const raf = mockRequestAnimationFrame();
  const view = render(
    <ImmersiveProvider>
      <AmbientBackground />
    </ImmersiveProvider>,
  );
  return { raf, canvas: screen.getByTestId("ambient-background") as HTMLCanvasElement, ...view };
}

beforeEach(() => {
  ctx = fakeContext();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    (() => ctx) as unknown as HTMLCanvasElement["getContext"],
  );
  setVisibilityState("visible");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("dotCountFor", () => {
  it("never goes below 24 or above 70", () => {
    expect(dotCountFor(100, 100)).toBe(24);
    expect(dotCountFor(3840, 2160)).toBe(70);
  });

  it("grows with the screen area and stays a whole number", () => {
    const phone = dotCountFor(390, 844);
    const laptop = dotCountFor(1440, 900);
    expect(laptop).toBeGreaterThan(phone);
    for (const count of [phone, laptop]) expect(Number.isInteger(count)).toBe(true);
  });
});

describe("AmbientBackground", () => {
  it("is a decorative canvas: hidden from assistive technology and never catches clicks", () => {
    mockMatchMedia({ matches: false });
    const { canvas } = renderBackground();

    expect(canvas.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveClass("pointer-events-none", "fixed");
    expect(canvas).not.toHaveAttribute("aria-label");
  });

  it("sizes itself to the window and draws a first frame", () => {
    mockMatchMedia({ matches: false });
    const { canvas } = renderBackground();

    expect(canvas.width).toBe(window.innerWidth);
    expect(canvas.height).toBe(window.innerHeight);
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.arc.mock.calls.length).toBe(dotCountFor(window.innerWidth, window.innerHeight));
  });

  it("animates when motion is allowed and the tab is visible", () => {
    mockMatchMedia({ matches: false });
    const { raf } = renderBackground();

    expect(raf.pending).toBe(1);
  });

  it("draws one still frame and schedules no animation under reduced motion", () => {
    mockMatchMedia({ matches: true });
    const { raf } = renderBackground();

    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    expect(raf.raf).not.toHaveBeenCalled();
    expect(raf.pending).toBe(0);
  });

  it("stops animating when the visitor turns motion off, and starts again when it is back on", () => {
    const media = mockMatchMedia({ matches: false });
    const { raf } = renderBackground();
    expect(raf.pending).toBe(1);

    act(() => media.setMatches(true));
    expect(raf.pending).toBe(0);

    act(() => media.setMatches(false));
    expect(raf.pending).toBe(1);
  });

  it("pauses while the tab is hidden and resumes when it is visible again", () => {
    mockMatchMedia({ matches: false });
    const { raf } = renderBackground();
    expect(raf.pending).toBe(1);

    act(() => setVisibilityState("hidden"));
    expect(raf.pending).toBe(0);
    expect(raf.caf).toHaveBeenCalled();

    act(() => setVisibilityState("visible"));
    expect(raf.pending).toBe(1);
  });

  it("redraws at most about 30 times a second", () => {
    mockMatchMedia({ matches: false });
    vi.spyOn(performance, "now").mockReturnValue(1000);
    const { raf } = renderBackground();
    const drawsAfterMount = ctx.clearRect.mock.calls.length;

    // 10 ms later is too soon: no new frame is drawn, but the loop keeps going.
    act(() => raf.flush(1010));
    expect(ctx.clearRect.mock.calls.length).toBe(drawsAfterMount);
    expect(raf.pending).toBe(1);

    // 40 ms after the last draw: draw.
    act(() => raf.flush(1040));
    expect(ctx.clearRect.mock.calls.length).toBe(drawsAfterMount + 1);

    // 10 ms after that: too soon again.
    act(() => raf.flush(1050));
    expect(ctx.clearRect.mock.calls.length).toBe(drawsAfterMount + 1);
  });

  it("fits the canvas to the new window size once resizing settles", () => {
    mockMatchMedia({ matches: true });
    const { canvas } = renderBackground();
    const drawsAfterMount = ctx.clearRect.mock.calls.length;
    const originalWidth = window.innerWidth;
    vi.useFakeTimers();

    try {
      setWindowWidth(500);
      for (let i = 0; i < 5; i++) window.dispatchEvent(new Event("resize"));

      // Still waiting: the refit is debounced.
      expect(canvas.width).toBe(originalWidth);

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(canvas.width).toBe(500);
      expect(ctx.clearRect.mock.calls.length).toBe(drawsAfterMount + 1);
    } finally {
      setWindowWidth(originalWidth);
    }
  });

  it("cleans up when it unmounts: no pending frame, no resize listener", () => {
    mockMatchMedia({ matches: false });
    const removeListener = vi.spyOn(window, "removeEventListener");
    const { raf, unmount } = renderBackground();
    expect(raf.pending).toBe(1);

    unmount();

    expect(raf.pending).toBe(0);
    expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function));
  });

  it("does nothing, without throwing, when the browser has no 2D canvas", () => {
    mockMatchMedia({ matches: false });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      (() => null) as unknown as HTMLCanvasElement["getContext"],
    );

    expect(() => renderBackground()).not.toThrow();
  });
});
