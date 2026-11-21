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
      ...projects.items.flatMap((p) => (p.detailImage ? [p.detailImage.src] : [])),
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
      ...projects.items.flatMap((p) => (p.detailImage ? [p.detailImage.alt] : [])),
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

  it("gives every project a picture of the same shape, so the cards in a row line up", () => {
    // A taller or shorter picture pushes its title out of line with the card beside it.
    // A project with no picture counts as its own shape, so mixing the two fails too.
    const shapes = items.map((p) => (p.image ? (p.image.width / p.image.height).toFixed(2) : "none"));
    expect(new Set(shapes).size, shapes.join(", ")).toBe(1);
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

  it("lists the newest role first", () => {
    const starts = entries.map((e) => Number(e.years.slice(0, 4)));
    for (const start of starts) expect(start).toBeGreaterThan(2000);
    expect(starts).toEqual([...starts].sort((a, b) => b - a));
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

describe("content: about", () => {
  it("has the rank phrase, written exactly, in one paragraph", () => {
    const hits = about.paragraphs.filter((paragraph) => paragraph.includes(about.rankPhrase));
    expect(hits).toHaveLength(1);
  });
});

describe("content: draw-in covers", () => {
  const pictures = projects.items
    .flatMap((p) => [p.image, p.detailImage])
    .flatMap((picture) => (picture?.reveal ? [{ src: picture.src, reveal: picture.reveal }] : []));

  it("is set up for every diagram", () => {
    expect(pictures.length).toBeGreaterThanOrEqual(5);
  });

  it("keeps every cover inside its picture", () => {
    for (const { src, reveal } of pictures) {
      for (const r of reveal) {
        expect(r.x, src).toBeGreaterThanOrEqual(0);
        expect(r.y, src).toBeGreaterThanOrEqual(0);
        expect(r.w, src).toBeGreaterThan(0);
        expect(r.h, src).toBeGreaterThan(0);
        expect(r.x + r.w, src).toBeLessThanOrEqual(100.001);
        expect(r.y + r.h, src).toBeLessThanOrEqual(100.001);
      }
    }
  });

  it("covers the whole picture, so nothing shows before its turn", () => {
    for (const { src, reveal } of pictures) {
      for (let px = 0; px <= 100; px += 2.5) {
        for (let py = 0; py <= 100; py += 2.5) {
          const covered = reveal.some(
            (r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h,
          );
          expect(covered, `${src} at ${px}%, ${py}%`).toBe(true);
        }
      }
    }
  });

  it("numbers the beats from 0 with none missing", () => {
    for (const { src, reveal } of pictures) {
      const beats = Array.from(new Set(reveal.map((r) => r.at))).sort((a, b) => a - b);
      expect(beats, src).toEqual(beats.map((_, i) => i));
    }
  });
});

describe("content: contact", () => {
  it("links the social profiles from the links list", () => {
    expect(contact.socials.map((s) => s.href)).toEqual([links.linkedin, links.github, links.x]);
  });

});
