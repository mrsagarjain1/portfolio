import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { CustomCursor } from "./CustomCursor";
import { CursorGlow } from "./CursorGlow";
import { MouseTrail } from "./MouseTrail";
import { MagneticElements } from "./MagneticElements";
import { RippleEffect } from "./RippleEffect";
import { usePointerBroadcast } from "../hooks/usePointerBroadcast";
import { mockMatchMedia, mockRequestAnimationFrame } from "../../vitest.setup";

/**
 * Component tests for pointer interactivity (task 12.5).
 *
 * These assert the browser-facing, timing, and event behaviors that the pure
 * property tests do not cover:
 *  - the custom cursor follows the shared pointer broadcaster within a frame;
 *  - cursor-following components render `null` on a coarse pointer (Req 4.2, 7.2);
 *  - a visible pointer indication is preserved — the native cursor is restored
 *    (`document.body.style.cursor` reset) when the custom cursor is disabled (Req 4.8);
 *  - a ripple appears on pointer-down and is removed within 1000 ms, capped at
 *    10 concurrent ripples (Req 4.5, 4.6);
 *  - pointer-driven state updates are throttled to one per animation frame (Req 7.3).
 *
 * _Requirements: 4.1, 4.2, 4.4, 4.5, 4.8, 7.2, 7.3_
 */

/** Override the reported logical-core count so the provider resolves a tier. */
function setHardwareConcurrency(cores: number) {
  Object.defineProperty(navigator, "hardwareConcurrency", {
    configurable: true,
    get: () => cores,
  });
}

/**
 * A `matchMedia` mock whose match result is derived per-query, so a fine pointer
 * and motion-enabled can coexist (the shared setup helper drives every query
 * from a single flag). Returns a `setMatches(query, value)` helper that fires a
 * live `change` event to that query's listeners.
 */
function installMatchMedia(initial: (query: string) => boolean) {
  const listeners = new Map<string, Set<(e: MediaQueryListEvent) => void>>();
  const state = new Map<string, boolean>();

  const getMatches = (query: string): boolean => {
    if (!state.has(query)) state.set(query, initial(query));
    return state.get(query)!;
  };

  const matchMedia = vi.fn((query: string) => {
    if (!listeners.has(query)) listeners.set(query, new Set());
    const set = listeners.get(query)!;
    return {
      get matches() {
        return getMatches(query);
      },
      media: query,
      onchange: null,
      addEventListener: (_t: string, cb: (e: MediaQueryListEvent) => void) =>
        set.add(cb),
      removeEventListener: (_t: string, cb: (e: MediaQueryListEvent) => void) =>
        set.delete(cb),
      addListener: (cb: (e: MediaQueryListEvent) => void) => set.add(cb),
      removeListener: (cb: (e: MediaQueryListEvent) => void) => set.delete(cb),
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: matchMedia,
  });

  return {
    setMatches(query: string, value: boolean) {
      state.set(query, value);
      const set = listeners.get(query);
      set?.forEach((cb) => cb({ matches: value } as MediaQueryListEvent));
    },
  };
}

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_QUERY = "(pointer: fine)";
const HOVER_QUERY = "(hover: hover)";

/** Install a fine, hover-capable pointer with motion enabled + a `full` tier. */
function installFinePointer() {
  setHardwareConcurrency(12); // > 8 cores => `full` tier => pointer cap of 4
  return installMatchMedia((q) => q === FINE_QUERY || q === HOVER_QUERY);
}

function Providers({ children }: { children: ReactNode }) {
  return <ImmersiveProvider>{children}</ImmersiveProvider>;
}

/** Both custom-cursor layers (dot + ring) are the only aria-hidden divs it emits. */
function cursorLayers(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('div[aria-hidden="true"]'),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CustomCursor pointer follow (Req 4.1, 7.3)", () => {
  it("follows the shared broadcaster and settles to the latest position within a frame", () => {
    installFinePointer();
    const raf = mockRequestAnimationFrame();

    render(
      <Providers>
        <CustomCursor />
      </Providers>,
    );

    // With a fine pointer + motion on + `full` tier the custom cursor is active,
    // so the native cursor is hidden and the dot/ring layers render.
    const dotBefore = screen.getByTestId("cursor-dot");
    expect(dotBefore).toBeDefined();
    expect(document.body.style.cursor).toBe("none");
    expect(dotBefore.style.left).toBe("-100px"); // initial off-screen position

    // A pointer move does not update state until the next animation frame.
    act(() => {
      window.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 240, clientY: 360 }),
      );
    });
    expect(screen.getByTestId("cursor-dot").style.left).toBe("-100px");

    // On the next frame the dot follows the pointer (pinned to the exact pos).
    act(() => raf.flush(16));
    const dot = screen.getByTestId("cursor-dot");
    expect(dot.style.left).toBe("240px");
    expect(dot.style.top).toBe("360px");
  });
});

describe("Coarse-pointer omission (Req 4.2, 7.2)", () => {
  it("renders cursor-following components as null while preserving wrapped content", () => {
    // matches:false => coarse pointer (fine/hover do not match), motion enabled.
    mockMatchMedia({ matches: false });
    setHardwareConcurrency(12);
    mockRequestAnimationFrame();

    const { container } = render(
      <Providers>
        <CustomCursor />
        <MouseTrail />
        <MagneticElements />
        <CursorGlow>
          <a href="#work">Work</a>
        </CursorGlow>
      </Providers>,
    );

    // No custom cursor layers, no trail canvas, no magnetic-orb container.
    expect(cursorLayers(container)).toHaveLength(0);
    expect(container.querySelector("canvas")).toBeNull();
    expect(
      container.querySelector('div.fixed.inset-0[aria-hidden="true"]'),
    ).toBeNull();

    // The native cursor is never hidden on a coarse device.
    expect(document.body.style.cursor).toBe("");

    // CursorGlow still renders its wrapped content (it drops only the glow).
    expect(screen.getByRole("link", { name: "Work" })).toBeInTheDocument();
  });
});

describe("Custom cursor visibility (Req 4.8)", () => {
  it("restores the native system cursor when the custom cursor is disabled", () => {
    const media = installFinePointer();
    mockRequestAnimationFrame();

    render(
      <Providers>
        <CustomCursor />
      </Providers>,
    );

    // Active custom cursor hides the native one.
    expect(document.body.style.cursor).toBe("none");

    // Flip the OS preference to reduced motion: the custom cursor deactivates
    // and must restore the native cursor so a pointer indication is preserved.
    act(() => media.setMatches(MOTION_QUERY, true));

    expect(document.body.style.cursor).toBe("");
  });
});

describe("RippleEffect lifecycle (Req 4.5, 4.6)", () => {
  /** Stub a 2D context so drawn ripples are observable via `arc` calls. */
  function stubCanvas() {
    const arc = vi.fn();
    const ctx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc,
      stroke: vi.fn(),
      strokeStyle: "",
      lineWidth: 0,
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
    return { arc };
  }

  it("draws a ripple on pointer-down and removes it within 1000 ms", () => {
    mockMatchMedia({ matches: false }); // motion enabled (ripples allowed)
    const raf = mockRequestAnimationFrame();
    const { arc } = stubCanvas();
    vi.spyOn(performance, "now").mockReturnValue(1000); // born timestamp

    render(
      <Providers>
        <RippleEffect />
      </Providers>,
    );

    act(() => {
      window.dispatchEvent(
        new MouseEvent("pointerdown", { clientX: 40, clientY: 80 }),
      );
    });

    // Present shortly after creation.
    arc.mockClear();
    act(() => raf.flush(1100)); // age 100 ms
    expect(arc).toHaveBeenCalledTimes(1);

    // Removed by the time 1000 ms have elapsed.
    arc.mockClear();
    act(() => raf.flush(2000)); // age 1000 ms
    expect(arc).toHaveBeenCalledTimes(0);
  });

  it("caps concurrent ripples at 10, evicting the oldest first", () => {
    mockMatchMedia({ matches: false });
    const raf = mockRequestAnimationFrame();
    const { arc } = stubCanvas();
    vi.spyOn(performance, "now").mockReturnValue(5000);

    render(
      <Providers>
        <RippleEffect />
      </Providers>,
    );

    // Fire 15 pointer-downs within the same instant.
    act(() => {
      for (let i = 0; i < 15; i += 1) {
        window.dispatchEvent(
          new MouseEvent("pointerdown", { clientX: i, clientY: i }),
        );
      }
    });

    arc.mockClear();
    act(() => raf.flush(5000)); // all freshly born => all still alive
    expect(arc).toHaveBeenCalledTimes(10);
  });
});

describe("Pointer-update throttling (Req 7.3)", () => {
  function wrapper({ children }: { children: ReactNode }) {
    mockMatchMedia({ matches: false });
    return <ImmersiveProvider>{children}</ImmersiveProvider>;
  }

  it("coalesces multiple pointer moves into one update per animation frame", () => {
    const raf = mockRequestAnimationFrame();
    const handler = vi.fn();

    renderHook(() => usePointerBroadcast(handler), { wrapper });

    // Three moves in a single frame schedule exactly one flush.
    act(() => {
      window.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 10, clientY: 10 }),
      );
      window.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 20, clientY: 20 }),
      );
      window.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 30, clientY: 30 }),
      );
    });
    expect(handler).not.toHaveBeenCalled();

    act(() => raf.flush());

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenLastCalledWith({ x: 30, y: 30 });
  });
});
