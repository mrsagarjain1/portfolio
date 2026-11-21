import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { mockRequestAnimationFrame } from "../../vitest.setup";
import { useScrollProgress } from "./useScrollProgress";

/** A page 5000 px tall in a 1000 px window, so it can scroll 4000 px. */
function setupPage({ resizeObserver = false } = {}) {
  const raf = mockRequestAnimationFrame();
  const page = { scrollY: 0, scrollHeight: 5000, clientHeight: 1000, sizeReads: 0 };

  Object.defineProperty(window, "scrollY", {
    configurable: true,
    get: () => page.scrollY,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    get: () => {
      page.sizeReads += 1;
      return page.scrollHeight;
    },
  });
  Object.defineProperty(document.documentElement, "clientHeight", {
    configurable: true,
    get: () => {
      page.sizeReads += 1;
      return page.clientHeight;
    },
  });

  const observer = { callback: undefined as (() => void) | undefined };
  const observe = vi.fn();
  const disconnect = vi.fn();
  if (resizeObserver) {
    class FakeResizeObserver {
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
      constructor(callback: ResizeObserverCallback) {
        observer.callback = () => callback([], this as unknown as ResizeObserver);
      }
    }
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  }

  const hook = renderHook(() => useScrollProgress());

  /** Scroll to `y` the way a browser does: an event, then the next frame. */
  const scrollTo = (y: number) => {
    page.scrollY = y;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      raf.flush();
    });
  };

  return { raf, page, hook, scrollTo, observer, observe, disconnect };
}

describe("useScrollProgress", () => {
  it("starts at 0 at the top of the page", () => {
    const { hook } = setupPage();
    expect(hook.result.current.get()).toBe(0);
  });

  it("follows the scroll position from 0 to 1", () => {
    const { hook, scrollTo } = setupPage();

    scrollTo(1000);
    expect(hook.result.current.get()).toBeCloseTo(0.25);
    scrollTo(2000);
    expect(hook.result.current.get()).toBeCloseTo(0.5);
    scrollTo(4000);
    expect(hook.result.current.get()).toBe(1);
  });

  it("stays between 0 and 1 when the browser overscrolls", () => {
    const { hook, scrollTo } = setupPage();

    scrollTo(99999);
    expect(hook.result.current.get()).toBe(1);
    scrollTo(-300);
    expect(hook.result.current.get()).toBe(0);
  });

  it("does not read the page size while scrolling", () => {
    // Reading scrollHeight or clientHeight can force the browser to redo layout.
    // It is measured on mount and on resize, never in the scroll path.
    const { page, scrollTo } = setupPage();
    const readsAfterMount = page.sizeReads;
    expect(readsAfterMount).toBeGreaterThan(0);

    for (let y = 0; y <= 4000; y += 200) scrollTo(y);

    expect(page.sizeReads).toBe(readsAfterMount);
  });

  it("publishes at most once per frame, however many scroll events arrive", () => {
    const { raf, page } = setupPage();
    const framesAfterMount = raf.raf.mock.calls.length;

    page.scrollY = 2000;
    for (let i = 0; i < 10; i++) window.dispatchEvent(new Event("scroll"));

    expect(raf.raf.mock.calls.length - framesAfterMount).toBe(1);
    expect(raf.pending).toBe(1);
  });

  it("measures the page again when the window is resized", () => {
    const { hook, page, scrollTo } = setupPage();
    scrollTo(1000);
    expect(hook.result.current.get()).toBeCloseTo(0.25);

    // The window gets taller, so the page can scroll less: 5000 - 3000 = 2000 px.
    page.clientHeight = 3000;
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    scrollTo(1000);

    expect(hook.result.current.get()).toBeCloseTo(0.5);
  });

  it("measures the page again when its content changes size", () => {
    const { raf, hook, page, observer, observe, scrollTo } = setupPage({
      resizeObserver: true,
    });
    expect(observe).toHaveBeenCalledWith(document.body);

    scrollTo(1000);
    expect(hook.result.current.get()).toBeCloseTo(0.25);

    // The page gets shorter: 3000 - 1000 = 2000 px of scrolling.
    page.scrollHeight = 3000;
    act(() => {
      observer.callback?.();
      raf.flush();
    });

    expect(hook.result.current.get()).toBeCloseTo(0.5);
  });

  it("cleans up on unmount: no listeners, no pending frame, observer disconnected", () => {
    const { raf, page, hook, disconnect } = setupPage({ resizeObserver: true });

    page.scrollY = 500;
    window.dispatchEvent(new Event("scroll"));
    expect(raf.pending).toBe(1);

    hook.unmount();
    expect(raf.caf).toHaveBeenCalled();
    expect(raf.pending).toBe(0);
    expect(disconnect).toHaveBeenCalled();

    const framesBefore = raf.raf.mock.calls.length;
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    expect(raf.raf.mock.calls.length).toBe(framesBefore);
  });
});
