import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ImmersiveProvider, useImmersiveContext } from "./ImmersiveProvider";
import {
  mockMatchMedia,
  setVisibilityState,
} from "../../../vitest.setup";

/**
 * Component tests for the ImmersiveProvider capability signals (task 8.2).
 *
 * These assert that `motionEnabled`, `pointerType`, and `tabVisible` react to
 * mocked `matchMedia` `change` and `visibilitychange` events, that
 * `performanceTier` resolves from `navigator.hardwareConcurrency` and reacts to
 * a governor degrade signal, and that the provider resolves safe SSR defaults.
 * _Requirements: 1.3, 1.4, 5.3, 5.4, 7.4_
 */

/** Renders every capability signal into the DOM so tests can read them back. */
function Probe() {
  const ctx = useImmersiveContext();
  return (
    <div>
      <span data-testid="motion">{String(ctx.motionEnabled)}</span>
      <span data-testid="pointer">{ctx.pointerType}</span>
      <span data-testid="tab">{String(ctx.tabVisible)}</span>
      <span data-testid="tier">{ctx.performanceTier}</span>
      <button type="button" onClick={() => ctx.setPerformanceTier("minimal")}>
        degrade
      </button>
    </div>
  );
}

/** Override the reported logical-core count for tier resolution. */
function setHardwareConcurrency(cores: number) {
  Object.defineProperty(navigator, "hardwareConcurrency", {
    configurable: true,
    get: () => cores,
  });
}

function renderProvider() {
  return render(
    <ImmersiveProvider>
      <Probe />
    </ImmersiveProvider>,
  );
}

describe("ImmersiveProvider capability signals", () => {
  it("resolves safe SSR defaults when effects do not run (server render)", () => {
    // renderToStaticMarkup never runs effects, so the rendered values are the
    // provider's SSR defaults: motion off (final state), coarse pointer, tab
    // visible, minimal tier.
    const html = renderToStaticMarkup(
      <ImmersiveProvider>
        <Probe />
      </ImmersiveProvider>,
    );

    expect(html).toContain('<span data-testid="motion">false</span>');
    expect(html).toContain('<span data-testid="pointer">coarse</span>');
    expect(html).toContain('<span data-testid="tab">true</span>');
    expect(html).toContain('<span data-testid="tier">minimal</span>');
  });

  it("hydrates real capability values on mount", () => {
    mockMatchMedia({ matches: false });
    setHardwareConcurrency(12);

    renderProvider();

    // motion query does not match => motion enabled; fine/hover do not match =>
    // coarse; jsdom tab is visible; 12 cores => full tier.
    expect(screen.getByTestId("motion")).toHaveTextContent("true");
    expect(screen.getByTestId("pointer")).toHaveTextContent("coarse");
    expect(screen.getByTestId("tab")).toHaveTextContent("true");
    expect(screen.getByTestId("tier")).toHaveTextContent("full");
  });

  it("updates motionEnabled and pointerType on a matchMedia change", () => {
    const media = mockMatchMedia({ matches: false });
    setHardwareConcurrency(12);

    renderProvider();
    expect(screen.getByTestId("motion")).toHaveTextContent("true");
    expect(screen.getByTestId("pointer")).toHaveTextContent("coarse");

    // Flip the shared media query to `matches: true` (reduce-motion on, and a
    // fine pointer becomes available).
    act(() => media.setMatches(true));

    expect(screen.getByTestId("motion")).toHaveTextContent("false");
    expect(screen.getByTestId("pointer")).toHaveTextContent("fine");
  });

  it("updates tabVisible on visibilitychange", () => {
    mockMatchMedia({ matches: false });

    renderProvider();
    expect(screen.getByTestId("tab")).toHaveTextContent("true");

    act(() => setVisibilityState("hidden"));
    expect(screen.getByTestId("tab")).toHaveTextContent("false");

    act(() => setVisibilityState("visible"));
    expect(screen.getByTestId("tab")).toHaveTextContent("true");
  });

  it("updates performanceTier when the governor pushes a degrade signal", () => {
    mockMatchMedia({ matches: false });
    setHardwareConcurrency(12);

    renderProvider();
    expect(screen.getByTestId("tier")).toHaveTextContent("full");

    act(() => {
      fireEvent.click(screen.getByText("degrade"));
    });

    expect(screen.getByTestId("tier")).toHaveTextContent("minimal");
  });
});
