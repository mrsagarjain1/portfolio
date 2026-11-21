import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { AnimatedCounter } from "./AnimatedCounter";
import {
  about,
  contact,
  experience,
  hero,
  links,
  metrics,
  navLinks,
  now,
  projects,
  sections,
  site,
} from "../lib/content";
import { mockIntersectionObserver, mockMatchMedia } from "../../vitest.setup";

// The contribution calendar fetches from GitHub. Stub it so the render stays
// network-free and deterministic.
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

    // The header links plus the two hero buttons.
    expect(hrefs.length).toBeGreaterThanOrEqual(navLinks.length + 2);
    for (const href of hrefs) {
      expect(document.getElementById(href.slice(1)), href).not.toBeNull();
    }
  });

  it("does not float the availability badge over the page", () => {
    const { container } = renderHome();
    const badge = Array.from(container.querySelectorAll("div")).find((el) =>
      el.textContent?.startsWith(now.status),
    );
    expect(badge).toBeDefined();
    expect(badge?.className).not.toContain("fixed");
  });
});

describe("hero", () => {
  function renderHero() {
    const { container } = renderHome();
    return container.querySelector<HTMLElement>("#hero") as HTMLElement;
  }

  it("has one main heading with the headline", () => {
    renderHome();
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(hero.headline.line1);
    expect(headings[0]).toHaveTextContent(hero.headline.line2);
  });

  it("shows the photo with a description", () => {
    const view = within(renderHero());
    expect(view.getByAltText(hero.photo.alt)).toBeInTheDocument();
  });

  it("names both current roles", () => {
    const section = renderHero();
    for (const role of now.roles) {
      expect(section).toHaveTextContent(role.org);
      expect(section).toHaveTextContent(role.title);
    }
  });

  it("sends the two buttons to the projects and the contact section", () => {
    const view = within(renderHero());
    expect(view.getByRole("link", { name: hero.primaryCta.label })).toHaveAttribute(
      "href",
      `#${hero.primaryCta.sectionId}`,
    );
    expect(view.getByRole("link", { name: hero.secondaryCta.label })).toHaveAttribute(
      "href",
      `#${hero.secondaryCta.sectionId}`,
    );
  });

  it("gives the icon-only links a name", () => {
    const view = within(renderHero());
    for (const name of ["LinkedIn", "GitHub", "X", "Email"]) {
      expect(view.getByRole("link", { name })).toBeInTheDocument();
    }
    expect(view.getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      `mailto:${site.email}`,
    );
  });
});

describe("about", () => {
  it("opens with its heading alone, with no small label repeating it", () => {
    const { container } = renderHome();
    const section = container.querySelector<HTMLElement>(`#${about.id}`) as HTMLElement;
    const heading = within(section).getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent(about.title);

    // The heading is built from one span per word, so ignore everything inside it.
    const word = about.title.split(" ")[0].toLowerCase();
    const repeats = Array.from(section.querySelectorAll("*")).filter(
      (el) => !heading.contains(el) && el.textContent?.trim().toLowerCase() === word,
    );
    expect(repeats).toHaveLength(0);
  });
});

describe("about: rank phrase", () => {
  it("underlines the phrase and keeps the paragraph readable as plain text", () => {
    const { container } = renderHome();
    const section = container.querySelector<HTMLElement>(`#${about.id}`) as HTMLElement;
    const paragraph = about.paragraphs.find((p) => p.includes(about.rankPhrase)) as string;

    const element = Array.from(section.querySelectorAll("p")).find(
      (p) => p.textContent === paragraph,
    ) as HTMLElement;
    expect(element).toBeDefined();
    expect(within(element).getByTestId("rank-highlight-line")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(within(element).getByText(about.rankPhrase)).toBeInTheDocument();
  });
});

describe("contact", () => {
  it("offers the email address and each social profile by name", () => {
    const { container } = renderHome();
    const section = within(container.querySelector<HTMLElement>(`#${contact.id}`) as HTMLElement);

    expect(section.getByRole("link", { name: new RegExp(site.email) })).toHaveAttribute(
      "href",
      `mailto:${site.email}`,
    );
    for (const social of contact.socials) {
      expect(section.getByRole("link", { name: social.label })).toHaveAttribute(
        "href",
        social.href,
      );
    }
  });
});

describe("server-rendered page", () => {
  it("contains the whole page as plain HTML, so search engines and link previews see it", () => {
    mockMatchMedia({ matches: false });
    const html = renderToString(
      <ImmersiveProvider>
        <Home />
      </ImmersiveProvider>,
    );
    // Decode entities such as the apostrophe in "Let's".
    const text = new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";

    const expected = [
      hero.headline.line1,
      hero.headline.line2,
      about.title,
      projects.title,
      projects.featured.title,
      ...projects.items.map((p) => p.title),
      experience.title,
      ...experience.entries.map((e) => e.org),
      contact.title,
      site.email,
      metrics.users,
      metrics.impressions,
    ];
    for (const needle of expected) expect(text, needle).toContain(needle);
  });

  it("links to the live product from the server HTML", () => {
    mockMatchMedia({ matches: false });
    const html = renderToString(
      <ImmersiveProvider>
        <Home />
      </ImmersiveProvider>,
    );
    expect(html).toContain(`href="${links.web}"`);
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
