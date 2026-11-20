import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import Journey from "./Journey";
import { journey } from "../lib/content";
import {
  mockIntersectionObserver,
  mockMatchMedia,
  mockRequestAnimationFrame,
} from "../../vitest.setup";

function renderJourney() {
  return render(
    <ImmersiveProvider>
      <Journey />
    </ImmersiveProvider>,
  );
}

beforeEach(() => {
  mockMatchMedia({ matches: false });
  mockIntersectionObserver();
  mockRequestAnimationFrame();
});

describe("Journey", () => {
  it("is a section with the id the navigation links to", () => {
    const { container } = renderJourney();
    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("id", journey.id);
    expect(
      screen.getByRole("heading", { level: 2, name: new RegExp(journey.title.slice(0, 11)) }),
    ).toBeInTheDocument();
  });

  it("lists every role, oldest first", () => {
    const { container } = renderJourney();
    const items = container.querySelectorAll("ol > li");
    expect(items).toHaveLength(journey.entries.length);

    journey.entries.forEach((entry, i) => {
      expect(items[i]).toHaveTextContent(entry.role);
      expect(items[i]).toHaveTextContent(entry.org);
      expect(items[i]).toHaveTextContent(entry.years);
      expect(items[i]).toHaveTextContent(entry.summary);
    });
  });

  it("keeps the facts that make the story: banks and ATMs, and the CVE fixes", () => {
    renderJourney();
    // Named in the section's lead and again on the Piscis Networks role.
    expect(
      screen.getAllByText(/secure networks for banks and ATMs/i).length,
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/CVE-2020-8597/)).toBeInTheDocument();
    expect(screen.getByText(/CVE-2021-20231/)).toBeInTheDocument();
  });

  it("marks the two roles held today", () => {
    renderJourney();
    expect(screen.getAllByText(journey.nowLabel)).toHaveLength(
      journey.entries.filter((e) => e.current).length,
    );
  });

  it("links the bridge card to the NeuroWRT section", () => {
    renderJourney();
    const link = screen.getByRole("link", { name: new RegExp(journey.bridge.title) });
    expect(link).toHaveAttribute("href", journey.bridge.href);
  });

  it("hides the decorative rail from assistive technology", () => {
    const { container } = renderJourney();
    const rails = container.querySelectorAll('ol > li > span[aria-hidden="true"]');
    expect(rails.length).toBeGreaterThanOrEqual(journey.entries.length);
  });
});
