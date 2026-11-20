import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import * as content from "./content";
import {
  hero,
  journey,
  links,
  metrics,
  navLinks,
  neurowrt,
  previews,
  sectionTitles,
  sections,
  seo,
  showcase,
  work,
} from "./content";

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../public");

describe("content: one source of truth for numbers", () => {
  it("uses the same user count in the hero, the work stats, the hover card and the search text", () => {
    expect(hero.metrics[0].value).toBe(metrics.users);
    expect(work.stats[0].value).toBe(metrics.users);
    expect(previews.valocoach.stats[0]).toContain(metrics.users);
    expect(seo.description).toContain(metrics.users);
    expect(seo.openGraphDescription).toContain(metrics.users);
  });

  it("keeps the other headline numbers in step too", () => {
    expect(hero.metrics.map((m) => m.value)).toEqual([
      metrics.users,
      metrics.impressions,
      metrics.downloads,
    ]);
    expect(work.stats.map((m) => m.value)).toEqual([
      metrics.users,
      metrics.impressions,
      metrics.downloads,
      metrics.coaches,
    ]);
  });

  it("carries no stale number from before the update", () => {
    const everything = JSON.stringify(content);
    expect(everything).not.toContain("20K+");
  });
});

describe("content: navigation stays in sync", () => {
  it("has a nav link for every section except the hero, in page order", () => {
    const ids = sections.map((s) => s.id).filter((id) => id !== "hero");
    expect(navLinks.map((l) => l.href)).toEqual(ids.map((id) => `#${id}`));
  });

  it("has a browser tab title for every section", () => {
    expect(Object.keys(sectionTitles)).toEqual(sections.map((s) => s.id));
  });
});

describe("content: links and images", () => {
  it("only links to https addresses", () => {
    for (const [name, href] of Object.entries(links)) {
      expect(href, name).toMatch(/^https:\/\//);
    }
  });

  it("points every image at a file that exists in /public", () => {
    const sources = [
      hero.photo.src,
      showcase.web.src,
      ...showcase.phones.map((p) => p.src),
      neurowrt.image.src,
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
      neurowrt.image.alt,
    ];
    for (const alt of alts) expect(alt.trim().length).toBeGreaterThan(0);
  });
});

describe("content: journey", () => {
  const entries = journey.entries;

  it("lists roles in chronological order", () => {
    const starts = entries.map((e) => Number(e.years.slice(0, 4)));
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

  it("links the bridge card to the NeuroWRT card", () => {
    expect(journey.bridge.href).toBe(`#${neurowrt.id}`);
  });
});
