import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, within } from "@testing-library/react";

import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { AnimatedCounter } from "./AnimatedCounter";
import { metrics, sections } from "../lib/content";
import {
  mockIntersectionObserver,
  mockMatchMedia,
  mockRequestAnimationFrame,
} from "../../vitest.setup";

// The contribution heatmap fetches on mount; stub it so the render stays
// network-free and deterministic (as the other home-page tests do).
vi.mock("./GitHubHeatmap", () => ({
  GitHubHeatmap: () => <div data-testid="github-heatmap" />,
}));

// Imported after the mock is registered.
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

describe("home page content", () => {
  it("shows the current user count and nothing from before the update", () => {
    const { container } = renderHome();
    const text = container.textContent ?? "";
    expect(text).toContain(metrics.users);
    expect(text).not.toContain("20K+");
  });

  it("has one section per entry in the content file, in the same order", () => {
    const { container } = renderHome();
    const ids = Array.from(container.querySelectorAll("section")).map((s) => s.id);
    expect(ids).toEqual(sections.map((s) => s.id));
  });

  it("points every in-page link at an element that exists", () => {
    const { container } = renderHome();
    const hrefs = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
      .map((a) => a.getAttribute("href") ?? "")
      .filter((href) => href.length > 1);

    expect(hrefs.length).toBeGreaterThanOrEqual(5);
    for (const href of hrefs) {
      expect(document.getElementById(href.slice(1)), href).not.toBeNull();
    }
  });

  it("shows the real hero numbers on first render, never a placeholder zero", () => {
    const { container } = renderHome();
    const hero = container.querySelector<HTMLElement>("#hero");
    expect(hero).not.toBeNull();
    for (const value of [metrics.users, metrics.impressions, metrics.downloads]) {
      expect(within(hero as HTMLElement).getByText(value)).toBeInTheDocument();
    }
  });

  it("names both current roles in the hero", () => {
    const { container } = renderHome();
    const hero = container.querySelector<HTMLElement>("#hero") as HTMLElement;
    expect(hero).toHaveTextContent("Neural Stats");
    expect(hero).toHaveTextContent("Aadvik TekLabs");
  });

  it("does not float the availability badge over the page", () => {
    const { container } = renderHome();
    const badge = Array.from(container.querySelectorAll("div")).find((el) =>
      el.textContent?.startsWith("Open to collaborations"),
    );
    expect(badge).toBeDefined();
    expect(badge?.className).not.toContain("fixed");
  });
});

describe("counters", () => {
  it("send the real value in the server-rendered HTML, not a zero", () => {
    mockMatchMedia({ matches: false });
    const html = renderToString(
      <ImmersiveProvider>
        <AnimatedCounter value={metrics.users} />
      </ImmersiveProvider>,
    );
    expect(html).toContain(metrics.users);
    expect(html).not.toContain(">0K+<");
    expect(html).not.toContain(">0<");
  });
});
