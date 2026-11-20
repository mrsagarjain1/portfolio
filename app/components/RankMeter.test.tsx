import { beforeEach, describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { RankMeter } from "./RankMeter";
import { RANKS } from "../lib/rank";
import { mockMatchMedia, mockRequestAnimationFrame } from "../../vitest.setup";

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

function renderMeter() {
  const raf = mockRequestAnimationFrame();
  // Scrollable height = 5000 - 1000 = 4000 px.
  setScrollDimensions(5000, 1000);
  setScrollY(0);
  render(
    <ImmersiveProvider>
      <RankMeter />
    </ImmersiveProvider>,
  );
  const meter = screen.getByTestId("rank-meter");
  const scrollTo = (y: number) => {
    setScrollY(y);
    act(() => raf.flush());
  };
  return { meter, scrollTo };
}

/** Index of the rank named in the meter's text. */
function rankIndexIn(meter: HTMLElement): number {
  // Longest names first so "Iron 2" is never confused with a longer name.
  const names = RANKS.map((r, i) => ({ name: r.name, i })).sort(
    (a, b) => b.name.length - a.name.length,
  );
  const hit = names.find(({ name }) => meter.textContent?.includes(name));
  if (!hit) throw new Error(`no rank in "${meter.textContent}"`);
  return hit.i;
}

beforeEach(() => {
  mockMatchMedia({ matches: false });
});

describe("RankMeter", () => {
  it("starts at Iron 2 at the top of the page", () => {
    const { meter } = renderMeter();
    expect(meter).toHaveTextContent("Iron 2");
    expect(meter).toHaveTextContent("0 RR");
  });

  it("reaches Immortal 1 (peak) at the bottom of the page", () => {
    const { meter, scrollTo } = renderMeter();
    scrollTo(4000);
    expect(meter).toHaveTextContent("Immortal 1");
    expect(meter).toHaveTextContent("PEAK");
  });

  it("climbs through every rank in order and never drops while scrolling down", () => {
    const { meter, scrollTo } = renderMeter();
    const seen: number[] = [];
    for (let y = 0; y <= 4000; y += 250) {
      scrollTo(y);
      seen.push(rankIndexIn(meter));
    }
    expect(seen[0]).toBe(0);
    expect(seen[seen.length - 1]).toBe(RANKS.length - 1);
    expect(seen).toEqual([...seen].sort((a, b) => a - b));
    expect(new Set(seen).size).toBe(RANKS.length);
  });

  it("goes back down when the visitor scrolls back up", () => {
    const { meter, scrollTo } = renderMeter();
    scrollTo(4000);
    expect(meter).toHaveTextContent("Immortal 1");
    scrollTo(0);
    expect(meter).toHaveTextContent("Iron 2");
  });

  it("is decorative: hidden from assistive technology and not focusable", () => {
    const { meter } = renderMeter();
    expect(meter).toHaveAttribute("aria-hidden", "true");
    expect(
      meter.querySelectorAll('a[href], button, input, select, textarea, [tabindex]'),
    ).toHaveLength(0);
  });
});
