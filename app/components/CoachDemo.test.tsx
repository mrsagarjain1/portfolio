import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { CoachDemo } from "./CoachDemo";
import { coachSnapshot, links } from "../lib/content";
import {
  mockIntersectionObserver,
  mockMatchMedia,
  mockRequestAnimationFrame,
} from "../../vitest.setup";

function renderDemo() {
  return render(
    <ImmersiveProvider>
      <CoachDemo />
    </ImmersiveProvider>,
  );
}

beforeEach(() => {
  mockIntersectionObserver();
  mockRequestAnimationFrame();
});

describe("CoachDemo", () => {
  it("prints every row of the snapshot as real text", () => {
    mockMatchMedia({ matches: false });
    renderDemo();

    for (const row of coachSnapshot.rows) {
      expect(screen.getByText(row.label)).toBeInTheDocument();
      expect(screen.getAllByText(row.value).length).toBeGreaterThanOrEqual(1);
    }
    expect(screen.getByText(coachSnapshot.recentLabel)).toBeInTheDocument();
    for (const match of coachSnapshot.recent) {
      expect(screen.getAllByText(match.score).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("says the numbers are a dated snapshot and that AI analysis needs a sign-in", () => {
    mockMatchMedia({ matches: false });
    renderDemo();

    expect(screen.getByText(new RegExp(coachSnapshot.takenOn))).toBeInTheDocument();
    expect(screen.getByText(/unlocks after sign-in/i)).toBeInTheDocument();
  });

  it("links to the live site, opening in a new tab safely", () => {
    mockMatchMedia({ matches: false });
    renderDemo();

    const link = screen.getByRole("link", { name: new RegExp(coachSnapshot.cta.label) });
    expect(link).toHaveAttribute("href", links.liveDemo);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("offers a replay when motion is on", () => {
    mockMatchMedia({ matches: false });
    renderDemo();
    expect(screen.getByRole("button", { name: "Replay the demo" })).toBeInTheDocument();
  });

  it("shows the same text, with no replay button, when motion is reduced", () => {
    mockMatchMedia({ matches: true });
    renderDemo();

    expect(screen.queryByRole("button", { name: "Replay the demo" })).toBeNull();
    for (const row of coachSnapshot.rows) {
      expect(screen.getByText(row.label)).toBeInTheDocument();
    }
  });

  it("keeps decorative pieces out of the tab order", () => {
    mockMatchMedia({ matches: false });
    const { container } = renderDemo();

    container.querySelectorAll<HTMLElement>('[aria-hidden="true"]').forEach((el) => {
      expect(
        el.querySelectorAll('a[href], button, input, select, textarea, [tabindex]'),
      ).toHaveLength(0);
    });
  });
});
