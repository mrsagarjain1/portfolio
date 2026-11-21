import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { ImmersiveProvider } from "../components/immersive/ImmersiveProvider";
import { mockMatchMedia, setVisibilityState } from "../../vitest.setup";
import { useReducedMotion } from "./useReducedMotion";
import { useTabVisibility } from "./useTabVisibility";

function wrapper({ children }: { children: ReactNode }) {
  return <ImmersiveProvider>{children}</ImmersiveProvider>;
}

describe("useReducedMotion", () => {
  it("is false when the system allows motion", () => {
    mockMatchMedia({ matches: false });
    const { result } = renderHook(() => useReducedMotion(), { wrapper });
    expect(result.current).toBe(false);
  });

  it("is true when the system asks for reduced motion", () => {
    mockMatchMedia({ matches: true });
    const { result } = renderHook(() => useReducedMotion(), { wrapper });
    expect(result.current).toBe(true);
  });

  it("changes as soon as the system setting changes", () => {
    const media = mockMatchMedia({ matches: false });
    const { result } = renderHook(() => useReducedMotion(), { wrapper });

    act(() => media.setMatches(true));
    expect(result.current).toBe(true);

    act(() => media.setMatches(false));
    expect(result.current).toBe(false);
  });

  it("throws outside the provider instead of guessing", () => {
    // React logs the error it is about to rethrow; keep the test output clean.
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => renderHook(() => useReducedMotion())).toThrow(/ImmersiveProvider/);
    } finally {
      logged.mockRestore();
    }
  });
});

describe("useTabVisibility", () => {
  it("follows the browser tab being hidden and shown", () => {
    mockMatchMedia({ matches: false });
    const { result } = renderHook(() => useTabVisibility(), { wrapper });
    expect(result.current).toBe(true);

    act(() => setVisibilityState("hidden"));
    expect(result.current).toBe(false);

    act(() => setVisibilityState("visible"));
    expect(result.current).toBe(true);
  });
});
