import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { skills, skillTags, projects, experience, about } from "./content";
import { canFollow, norm, tagMatches, tagsFor, usesTerm } from "./focus";

/** Every tag a project or a role carries. */
const allTags = [
  ...projects.featured.tags,
  ...projects.items.flatMap((p) => p.tags),
  ...experience.entries.flatMap((e) => e.tags),
];

describe("tag matching", () => {
  it("ignores case and stray spaces", () => {
    expect(norm("  OpenWrt ")).toBe("openwrt");
    expect(tagMatches("openwrt", "OPENWRT")).toBe(true);
    expect(tagMatches("OpenWrt", " openwrt ")).toBe(true);
  });

  it("matches a skill to the tags listed for it", () => {
    expect(tagsFor("Vector databases")).toEqual(["vector db", "pinecone"]);
    expect(tagMatches("Vector databases", "Pinecone")).toBe(true);
    expect(tagMatches("Vector databases", "Vector DB")).toBe(true);
    expect(tagMatches("Vector databases", "Python")).toBe(false);
  });

  it("matches a plain tag to itself and nothing else", () => {
    expect(tagsFor("Pinecone")).toEqual(["pinecone"]);
    expect(tagMatches("Pinecone", "Pinecone")).toBe(true);
    expect(tagMatches("Pinecone", "Redis")).toBe(false);
  });

  it("says a thing with no tags uses nothing", () => {
    expect(usesTerm("LangChain", [])).toBe(false);
  });

  it("finds the projects that use a skill", () => {
    const using = projects.items.filter((p) => usesTerm("OpenWrt", p.tags)).map((p) => p.id);
    expect(using).toEqual(["neurowrt"]);
  });

  // Property: any tag, used as a term, matches the thing that carries it.
  it("always matches a tag against the list it came from", () => {
    fc.assert(
      fc.property(fc.constantFrom(...allTags), (tag) => {
        expect(usesTerm(tag, allTags)).toBe(true);
        expect(usesTerm(tag, [tag])).toBe(true);
      }),
    );
  });
});

describe("skills that can be followed", () => {
  const chips = [...skills.groups.flatMap((g) => g.items), ...about.building];

  it("only lists skills that appear as chips in About", () => {
    for (const skill of Object.keys(skillTags)) {
      expect(chips, skill).toContain(skill);
    }
  });

  it("only points at tags that a project or a role really carries", () => {
    const known = new Set(allTags.map(norm));
    for (const [skill, tags] of Object.entries(skillTags)) {
      expect(tags.length, skill).toBeGreaterThan(0);
      for (const tag of tags) expect(known.has(norm(tag)), `${skill} -> ${tag}`).toBe(true);
    }
  });

  it("makes a chip followable exactly when it has tags", () => {
    for (const chip of chips) {
      expect(canFollow(chip), chip).toBe((skillTags[chip]?.length ?? 0) > 0);
    }
  });
});
