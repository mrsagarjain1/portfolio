import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import * as content from "./content";
import {
  about,
  contact,
  credentials,
  experience,
  hero,
  links,
  metrics,
  navLinks,
  now,
  projects,
  sectionTitles,
  sections,
  seo,
  showcase,
  site,
} from "./content";

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../public");

describe("content: one source of truth for numbers", () => {
  it("shows the headline numbers on the featured project, in order", () => {
    expect(projects.featured.stats.map((s) => s.value)).toEqual([
      metrics.users,
      metrics.impressions,
      metrics.downloads,
      metrics.coaches,
    ]);
  });

  it("uses the same user count in the search text and the share text", () => {
    expect(seo.description).toContain(metrics.users);
    expect(seo.openGraphDescription).toContain(metrics.users);
    expect(seo.openGraphDescription).toContain(metrics.impressions);
  });

  it("carries no stale number from before the update", () => {
    expect(JSON.stringify(content)).not.toContain("20K+");
  });
});

describe("content: navigation stays in sync", () => {
  const ids = sections.map((s) => s.id);

  it("has a nav link for every section except the hero, in page order", () => {
    expect(navLinks.map((l) => l.href)).toEqual(
      ids.filter((id) => id !== "hero").map((id) => `#${id}`),
    );
  });

  it("has a browser tab title for every section", () => {
    expect(Object.keys(sectionTitles)).toEqual(ids);
  });

  it("gives each section object the id the page lists for it", () => {
    expect(about.id).toBe("about");
    expect(projects.id).toBe("projects");
    expect(experience.id).toBe("experience");
    expect(contact.id).toBe("contact");
    for (const id of [about.id, projects.id, experience.id, contact.id]) {
      expect(ids).toContain(id);
    }
  });

  it("points the hero buttons at sections that exist", () => {
    expect(ids).toContain(hero.primaryCta.sectionId);
    expect(ids).toContain(hero.secondaryCta.sectionId);
  });
});

describe("content: links and images", () => {
  it("only links to https addresses", () => {
    for (const [name, href] of Object.entries(links)) {
      expect(href, name).toMatch(/^https:\/\//);
    }
  });

  it("uses only addresses from the links list for projects and the featured product", () => {
    const known = new Set<string>(Object.values(links));
    const used = [
      ...projects.featured.links,
      ...projects.items.flatMap((p) => p.links),
      ...contact.socials,
    ];
    expect(used.length).toBeGreaterThan(0);
    for (const link of used) expect(known.has(link.href), link.href).toBe(true);
  });

  it("has a real-looking email address", () => {
    expect(site.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  });

  it("points every image at a file that exists in /public", () => {
    const sources = [
      hero.photo.src,
      showcase.web.src,
      ...showcase.phones.map((p) => p.src),
      ...projects.items.flatMap((p) => (p.image ? [p.image.src] : [])),
    ];
    for (const src of sources) {
      expect(existsSync(resolve(publicDir, src.replace(/^\//, ""))), src).toBe(true);
    }
  });

  it("gives every image a description", () => {
    const alts = [
      hero.photo.alt,
      showcase.web.alt,
      ...showcase.phones.map((p) => p.alt),
      ...projects.items.flatMap((p) => (p.image ? [p.image.alt] : [])),
    ];
    expect(alts.length).toBeGreaterThanOrEqual(4);
    for (const alt of alts) expect(alt.trim().length).toBeGreaterThan(0);
  });
});

describe("content: projects", () => {
  const { items } = projects;
  const sectionIds: string[] = sections.map((s) => s.id);

  it("has unique ids that do not clash with a section id", () => {
    const ids = items.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(sectionIds).not.toContain(id);
  });

  it("lists the newest project first", () => {
    const years = items.map((p) => Number(p.year));
    for (const year of years) expect(year).toBeGreaterThan(2000);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });

  it("gives every project a description, tags and somewhere to read the code", () => {
    for (const project of items) {
      expect(project.description.trim().length, project.id).toBeGreaterThan(0);
      expect(project.tags.length, project.id).toBeGreaterThan(0);
      expect(project.links.length, project.id).toBeGreaterThan(0);
    }
  });

  it("gives the featured project somewhere to open it", () => {
    expect(projects.featured.links.length).toBeGreaterThan(0);
    expect(projects.featured.links[0].href).toBe(links.web);
  });
});

describe("content: experience", () => {
  const { entries } = experience;

  it("lists roles in chronological order", () => {
    const starts = entries.map((e) => Number(e.years.slice(0, 4)));
    for (const start of starts) expect(start).toBeGreaterThan(2000);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });

  it("marks exactly the open-ended roles as current", () => {
    for (const entry of entries) {
      expect(Boolean(entry.current), entry.id).toBe(entry.years.endsWith("now"));
    }
  });

  it("has unique ids and a summary for every role", () => {
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    for (const entry of entries) {
      expect(entry.summary.trim().length, entry.id).toBeGreaterThan(0);
    }
  });

  it("names the same current roles in the hero and in the timeline", () => {
    const current = entries.filter((e) => e.current).map((e) => e.org);
    expect(now.roles.map((r) => r.org).sort()).toEqual([...current].sort());
  });
});

describe("content: credentials", () => {
  it("names each certification with a short badge", () => {
    expect(credentials.certifications.length).toBeGreaterThan(0);
    for (const item of credentials.certifications) {
      expect(item.badge.trim().length).toBeGreaterThan(0);
      expect(item.name.trim().length).toBeGreaterThan(0);
    }
  });

  it("gives the degree a school and a range of years", () => {
    expect(credentials.education.school.trim().length).toBeGreaterThan(0);
    expect(credentials.education.years).toMatch(/^\d{4} - \d{4}$/);
  });
});

describe("content: contact", () => {
  it("links the social profiles from the links list", () => {
    expect(contact.socials.map((s) => s.href)).toEqual([links.linkedin, links.github, links.x]);
  });

  it("puts the owner's name in the footer", () => {
    expect(contact.footerLeft).toContain(site.name);
  });
});
