import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { EFFECT_ASSIGNMENT } from "../lib/immersive/effectAssignment";
import {
  mockIntersectionObserver,
  mockMatchMedia,
  mockRequestAnimationFrame,
} from "../../vitest.setup";

/**
 * Component test for task 15.3 — idle-component presence and exclusion.
 *
 * Renders the home page content (`<Home/>`) and asserts every activated idle
 * component appears in at least one Section, and that the documented exclusion
 * (`ScrollVelocity` — renders no visible content and exposes no interaction) is
 * absent from the output (Req 2.1, 2.5).
 *
 * The activated wrappers/accents are the real modules used by `app/page.tsx`,
 * replaced here with lightweight markers so their presence (and child
 * preservation) is directly observable regardless of scroll/reveal timing. The
 * sections themselves render for real. `NeuralMeshBackground` lives in the app
 * shell (`layout.tsx`), not the page, so no WebGL is exercised; `GitHubHeatmap`
 * is stubbed to avoid a network fetch during the render.
 *
 * _Requirements: 2.1, 2.5_
 */

// --- Activated components replaced with observable markers -----------------
vi.mock("./SectionTransition", () => ({
  SectionTransition: ({ children }: { children?: ReactNode }) => (
    <div data-testid="section-transition">{children}</div>
  ),
}));
vi.mock("./ScrollDepth", () => ({
  ScrollDepth: ({ children }: { children?: ReactNode }) => (
    <div data-testid="scroll-depth">{children}</div>
  ),
}));
vi.mock("./ParallaxSection", () => ({
  ParallaxSection: ({ children }: { children?: ReactNode }) => (
    <div data-testid="parallax-section">{children}</div>
  ),
}));
vi.mock("./WaveSection", () => ({
  WaveSection: ({ children }: { children?: ReactNode }) => (
    <div data-testid="wave-section">{children}</div>
  ),
}));
vi.mock("./ScrambleText", () => ({
  ScrambleText: ({ text }: { text: string }) => (
    <span data-testid="scramble-text">{text}</span>
  ),
}));
vi.mock("./ImmersiveText", () => ({
  ImmersiveText: ({ text }: { text: string }) => (
    <span data-testid="immersive-text">{text}</span>
  ),
}));
vi.mock("./WaveformBars", () => ({
  WaveformBars: () => <div data-testid="waveform-bars" aria-hidden="true" />,
}));

// --- Heavy leaf stubbed to keep the render network-free --------------------
vi.mock("./GitHubHeatmap", () => ({
  GitHubHeatmap: () => <div data-testid="github-heatmap" />,
}));

// Imported after the mocks are registered.
import Home from "../page";

function renderHome() {
  return render(
    <ImmersiveProvider>
      <Home />
    </ImmersiveProvider>,
  );
}

beforeEach(() => {
  mockMatchMedia({ matches: false });
  mockIntersectionObserver();
  mockRequestAnimationFrame();
});

describe("home page idle-component activation", () => {
  it("renders every activated idle component in at least one Section", () => {
    renderHome();

    // Wrapper activations (one Section each).
    expect(screen.getAllByTestId("section-transition").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId("scroll-depth").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId("parallax-section").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId("wave-section").length).toBeGreaterThanOrEqual(1);

    // Hover accent on eyebrow labels + Hero role text.
    expect(screen.getAllByTestId("scramble-text").length).toBeGreaterThanOrEqual(1);

    // Character-stagger reveal on the Story heading.
    expect(screen.getAllByTestId("immersive-text").length).toBeGreaterThanOrEqual(1);

    // Decorative signal accent near the Contact availability indicator.
    expect(screen.getAllByTestId("waveform-bars").length).toBeGreaterThanOrEqual(1);
  });

  it("preserves the wrapped Section content inside each activating wrapper", () => {
    renderHome();

    // The activating wrappers still contain their Section content (Req 2.6):
    // Work lives under SectionTransition, Stack under ScrollDepth, Contact
    // under ParallaxSection.
    expect(screen.getByTestId("section-transition")).toContainElement(
      document.getElementById("work"),
    );
    expect(screen.getByTestId("scroll-depth")).toContainElement(
      document.getElementById("stack"),
    );
    expect(screen.getByTestId("parallax-section")).toContainElement(
      document.getElementById("contact"),
    );
  });

  it("excludes ScrollVelocity, which renders no visible content and no interaction", () => {
    renderHome();

    // The documented exclusion is not rendered anywhere on the page (Req 2.5).
    expect(screen.queryByTestId("scroll-velocity")).toBeNull();

    // ...and the activation matrix records it as excluded, never assigned.
    const excludedIds = EFFECT_ASSIGNMENT.excluded.map((e) => e.component);
    const assignedIds = EFFECT_ASSIGNMENT.assignments.map((a) => a.component);
    expect(excludedIds).toContain("ScrollVelocity");
    expect(assignedIds).not.toContain("ScrollVelocity");
  });
});
