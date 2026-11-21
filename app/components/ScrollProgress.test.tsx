import { describe, expect, it } from "vitest";
import { act, render, waitFor } from "@testing-library/react";

import { ScrollProgress } from "./ScrollProgress";
import { RANKS } from "../lib/rank";
import { mockRequestAnimationFrame } from "../../vitest.setup";

function setScrollY(value: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, get: () => value });
}

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

/** What the browser reports for a colour written as hex, so the test can compare like with like. */
function asComputed(hex: string): string {
  const probe = document.createElement("div");
  probe.style.backgroundColor = hex;
  return probe.style.backgroundColor;
}

describe("ScrollProgress", () => {
  it("takes the colour of the rank the visitor has reached", async () => {
    const raf = mockRequestAnimationFrame();
    setScrollDimensions(5000, 1000);
    setScrollY(0);
    const { container } = render(<ScrollProgress />);
    const bar = container.firstElementChild as HTMLElement;

    expect(bar.style.backgroundColor).toBe(asComputed(RANKS[0].bar));

    setScrollY(4000);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      raf.flush();
    });
    // The style is written on framer's own frame, a moment after the scroll is read.
    await waitFor(() =>
      expect(bar.style.backgroundColor).toBe(asComputed(RANKS[RANKS.length - 1].bar)),
    );
  });

  it("stays decorative", () => {
    const { container } = render(<ScrollProgress />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
