import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import Projects from "./Projects";
import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { projects, showcase } from "../lib/content";
import { mockIntersectionObserver, mockMatchMedia } from "../../vitest.setup";

beforeEach(() => {
  mockMatchMedia({ matches: false });
  mockIntersectionObserver();
});

function renderProjects() {
  const view = render(
    <ImmersiveProvider>
      <Projects />
    </ImmersiveProvider>,
  );
  const featured = screen
    .getByRole("heading", { level: 3, name: projects.featured.title })
    .closest("article") as HTMLElement;
  return { ...view, featured };
}

describe("Projects", () => {
  it("is the section the nav links to, with its heading", () => {
    const { container } = renderProjects();

    expect(container.querySelector("section")?.id).toBe(projects.id);
    expect(
      screen.getByRole("heading", { level: 2, name: projects.title }),
    ).toBeInTheDocument();
  });

  describe("featured project", () => {
    it("shows the product, what it is and its real numbers", () => {
      const { featured } = renderProjects();
      const view = within(featured);

      expect(view.getByText(projects.featured.tagline)).toBeInTheDocument();
      expect(view.getByText(projects.featured.description)).toBeInTheDocument();
      for (const stat of projects.featured.stats) {
        expect(view.getByText(stat.value)).toBeInTheDocument();
        expect(view.getByText(stat.label)).toBeInTheDocument();
      }
    });

    it("links to every place the product can be opened", () => {
      const { featured } = renderProjects();

      for (const link of projects.featured.links) {
        const anchor = within(featured).getByRole("link", { name: link.label });
        expect(anchor).toHaveAttribute("href", link.href);
      }
    });

    it("lists the technologies used", () => {
      const { featured } = renderProjects();

      for (const tag of projects.featured.tags) {
        expect(within(featured).getByText(tag)).toBeInTheDocument();
      }
    });

    it("shows the web app and both phone screens, each with a description", () => {
      const { featured } = renderProjects();
      const view = within(featured);

      expect(view.getByAltText(showcase.web.alt)).toBeInTheDocument();
      for (const phone of showcase.phones) {
        expect(view.getByAltText(phone.alt)).toBeInTheDocument();
      }
      expect(view.getByText(showcase.caption)).toBeInTheDocument();
    });
  });

  describe("other projects", () => {
    it("has a card for every project, each reachable by its id", () => {
      const { container } = renderProjects();

      for (const project of projects.items) {
        const card = container.querySelector<HTMLElement>(`article#${project.id}`);
        expect(card, project.id).not.toBeNull();
        const view = within(card as HTMLElement);
        expect(view.getByRole("heading", { level: 3, name: project.title })).toBeInTheDocument();
        expect(view.getByText(project.tagline)).toBeInTheDocument();
        expect(view.getByText(project.description)).toBeInTheDocument();
        expect(view.getByText(project.year)).toBeInTheDocument();
        for (const tag of project.tags) expect(view.getByText(tag)).toBeInTheDocument();
      }
    });

    it("links each project to its source code", () => {
      const { container } = renderProjects();

      for (const project of projects.items) {
        const card = container.querySelector<HTMLElement>(`article#${project.id}`) as HTMLElement;
        for (const link of project.links) {
          expect(within(card).getByRole("link", { name: link.label })).toHaveAttribute(
            "href",
            link.href,
          );
        }
      }
    });

    it("shows a screenshot, described in words, only for the projects that have one", () => {
      const { container } = renderProjects();

      for (const project of projects.items) {
        const card = container.querySelector<HTMLElement>(`article#${project.id}`) as HTMLElement;
        const images = card.querySelectorAll("img");
        if (project.image) {
          // The main picture, plus the second one on the card that has it.
          expect(images).toHaveLength(project.detailImage ? 2 : 1);
          expect(within(card).getByAltText(project.image.alt)).toBeInTheDocument();
          if (project.detailImage) {
            expect(within(card).getByAltText(project.detailImage.alt)).toBeInTheDocument();
          }
        } else {
          expect(images).toHaveLength(0);
        }
      }
    });
  });

  it("opens every outside link in a new tab without handing over the opener", () => {
    const { container } = renderProjects();

    const outside = Array.from(container.querySelectorAll<HTMLAnchorElement>("a[href^='http']"));
    expect(outside.length).toBeGreaterThan(projects.items.length);
    for (const anchor of outside) {
      expect(anchor, anchor.href).toHaveAttribute("target", "_blank");
      expect(anchor.getAttribute("rel"), anchor.href).toMatch(/noopener/);
    }
  });
});
