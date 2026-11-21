import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import Experience from "./Experience";
import { credentials, experience } from "../lib/content";
import { mockIntersectionObserver, mockMatchMedia } from "../../vitest.setup";

beforeEach(() => {
  mockMatchMedia({ matches: false });
  mockIntersectionObserver();
});

function renderExperience() {
  const { container } = render(<Experience />);
  const timeline = container.querySelector("ol") as HTMLOListElement;
  const cards = Array.from(timeline.querySelectorAll<HTMLElement>(":scope > li"));
  return { container, timeline, cards };
}

describe("Experience", () => {
  it("is the section the nav links to, with its heading", () => {
    const { container } = renderExperience();

    expect(container.querySelector("section")?.id).toBe(experience.id);
    expect(
      screen.getByRole("heading", { level: 2, name: experience.title }),
    ).toBeInTheDocument();
  });

  it("lists every role once, in the order of the content file", () => {
    const { cards } = renderExperience();

    expect(cards).toHaveLength(experience.entries.length);
    experience.entries.forEach((entry, i) => {
      const card = cards[i];
      expect(card).toHaveTextContent(entry.org);
      expect(card).toHaveTextContent(entry.role);
      expect(card).toHaveTextContent(entry.years);
      expect(card).toHaveTextContent(entry.summary);
    });
  });

  it("gives every role a heading that names the role and the company", () => {
    renderExperience();

    // Compare the visible text: the accessible-name library drops the space
    // after the comma, which is only a quirk of the test environment.
    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);
    for (const entry of experience.entries) {
      expect(titles).toContain(`${entry.role}, ${entry.org}`);
    }
  });

  it("marks the roles held today with a Now label, and no others", () => {
    const { cards } = renderExperience();

    experience.entries.forEach((entry, i) => {
      const hasLabel = Array.from(cards[i].querySelectorAll("span")).some(
        (span) => span.textContent === experience.nowLabel,
      );
      expect(hasLabel, entry.id).toBe(Boolean(entry.current));
    });
  });

  it("shows the standout fact for the roles that have one", () => {
    renderExperience();

    const withHighlight = experience.entries.filter((e) => e.highlight);
    expect(withHighlight.length).toBeGreaterThan(0);
    for (const entry of withHighlight) {
      expect(screen.getByText(entry.highlight as string)).toBeInTheDocument();
    }
  });

  it("shows the product named in a role", () => {
    const { cards } = renderExperience();

    experience.entries.forEach((entry, i) => {
      if (entry.project) expect(cards[i]).toHaveTextContent(entry.project);
    });
  });

  it("lists the certifications and the degree beside the timeline", () => {
    renderExperience();

    const heading = screen.getByRole("heading", { level: 3, name: credentials.title });
    const card = within(heading.parentElement as HTMLElement);
    for (const item of credentials.certifications) {
      expect(card.getByText(item.name)).toBeInTheDocument();
      expect(card.getByText(item.badge)).toBeInTheDocument();
    }
    expect(card.getByText(credentials.education.badge)).toBeInTheDocument();
    expect(card.getByText(credentials.education.name)).toBeInTheDocument();
    expect(card.getByText(new RegExp(credentials.education.school))).toBeInTheDocument();
  });

  it("keeps the timeline rail and nodes out of the accessibility tree", () => {
    const { timeline } = renderExperience();

    const decorations = timeline.querySelectorAll(":scope > li > span");
    expect(decorations.length).toBeGreaterThan(0);
    decorations.forEach((span) => expect(span).toHaveAttribute("aria-hidden", "true"));
  });
});
