import { describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import { useRef, type ReactNode } from "react";

import { ImmersiveProvider } from "../components/immersive/ImmersiveProvider";
import { usePointerBroadcast } from "./usePointerBroadcast";
import { useFrameClock } from "./useFrameClock";
import { useSectionReveal } from "./useSectionReveal";
import {
  mockIntersectionObserver,
  mockMatchMedia,
  mockRequestAnimationFrame,
} from "../../vitest.setup";

/**
 * Unit/component tests for the coordination hooks (task 8.4).
 *
 * Cover throttle-to-one-update-per-frame for usePointerBroadcast/useFrameClock,
 * the latched once-only reveal via a mocked IntersectionObserver, and cleanup
 * of every subscription on unmount.
 * _Requirements: 3.1, 7.3_
 */

function wrapper({ children }: { children: ReactNode }) {
  return <ImmersiveProvider>{children}</ImmersiveProvider>;
}

describe("usePointerBroadcast", () => {
  it("notifies the handler at most once per animation frame (throttled)", () => {
    mockMatchMedia({ matches: false });
    const raf = mockRequestAnimationFrame();
    const handler = vi.fn();

    renderHook(() => usePointerBroadcast(handler), { wrapper });

    // Several pointer moves within a single frame schedule only one flush.
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 1, clientY: 2 }));
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 3, clientY: 4 }));
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 5, clientY: 6 }));
    });
    expect(handler).not.toHaveBeenCalled();

    act(() => raf.flush());

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenLastCalledWith({ x: 5, y: 6 });
  });

  it("removes the pointer subscription on unmount", () => {
    mockMatchMedia({ matches: false });
    const raf = mockRequestAnimationFrame();
    const handler = vi.fn();

    const { unmount } = renderHook(() => usePointerBroadcast(handler), {
      wrapper,
    });

    act(() => unmount());

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 9, clientY: 9 }));
      raf.flush();
    });

    expect(handler).not.toHaveBeenCalled();
  });
});

describe("useFrameClock", () => {
  it("invokes the handler exactly once per frame tick", () => {
    mockMatchMedia({ matches: false });
    const raf = mockRequestAnimationFrame();
    const handler = vi.fn();

    renderHook(() => useFrameClock(handler), { wrapper });

    act(() => raf.flush(16));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenLastCalledWith(16);

    // The clock reschedules itself; a second frame yields exactly one more call.
    act(() => raf.flush(32));
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenLastCalledWith(32);
  });

  it("stops invoking the frame handler after unmount", () => {
    mockMatchMedia({ matches: false });
    const raf = mockRequestAnimationFrame();
    const handler = vi.fn();

    const { unmount } = renderHook(() => useFrameClock(handler), { wrapper });

    act(() => raf.flush(16));
    expect(handler).toHaveBeenCalledTimes(1);

    act(() => unmount());
    handler.mockClear();

    act(() => raf.flush(32));
    expect(handler).not.toHaveBeenCalled();
  });
});

/** Test harness exercising useSectionReveal against a real element ref. */
function RevealProbe() {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useSectionReveal(ref);
  return (
    <div ref={ref} data-testid="section">
      {String(revealed)}
    </div>
  );
}

describe("useSectionReveal", () => {
  it("latches revealed once the section intersects and never reverts", () => {
    const io = mockIntersectionObserver();

    render(<RevealProbe />);
    expect(screen.getByTestId("section")).toHaveTextContent("false");

    // Section crosses the threshold -> latch on.
    act(() => io.trigger(true));
    expect(screen.getByTestId("section")).toHaveTextContent("true");

    // A later exit observation must not flip it back off (monotone latch).
    act(() => io.trigger(false));
    expect(screen.getByTestId("section")).toHaveTextContent("true");
  });

  it("observes at a ~0.1 threshold", () => {
    const io = mockIntersectionObserver();

    render(<RevealProbe />);

    expect(io.instances).toHaveLength(1);
    expect(io.instances[0].observe).toHaveBeenCalledTimes(1);
  });

  it("disconnects the observer on unmount", () => {
    const io = mockIntersectionObserver();

    const { unmount } = render(<RevealProbe />);
    expect(io.instances).toHaveLength(1);

    unmount();

    expect(io.instances[0].disconnect).toHaveBeenCalled();
  });
});
