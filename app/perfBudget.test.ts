import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/**
 * Performance budget for the page.
 *
 * The site once felt heavy and blurred while scrolling because of a stack of
 * effects: blur filters, backdrop filters, blend modes, a 3D background, a
 * page-wide tilt that followed the mouse, and animations that never stopped.
 * These checks read the source and fail if any of them comes back, so a future
 * edit cannot slow scrolling down without someone seeing a red test.
 *
 * They match source text, so a rule can be bypassed on purpose, but not by
 * accident. Comments are ignored, and so are test files.
 */

const appDir = dirname(fileURLToPath(import.meta.url));

interface SourceFile {
  /** Path relative to the app folder, with forward slashes. */
  path: string;
  /** Source with comments removed. */
  code: string;
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

function readSources(): SourceFile[] {
  return walk(appDir)
    .filter((file) => /\.(?:tsx?|css)$/.test(file) && !/\.test\.tsx?$/.test(file))
    .map((file) => ({
      path: relative(appDir, file).replace(/\\/g, "/"),
      code: stripComments(readFileSync(file, "utf8")),
    }));
}

const sources = readSources();

/** Files that contain a match for `pattern`, with the first matching text. */
function offenders(pattern: RegExp): string[] {
  return sources.flatMap(({ path, code }) => {
    const hit = code.match(pattern);
    return hit ? [`${path}: ${hit[0].trim()}`] : [];
  });
}

describe("performance budget", () => {
  it("scans the real source files", () => {
    const paths = sources.map((s) => s.path);
    expect(paths).toContain("page.tsx");
    expect(paths).toContain("globals.css");
    expect(paths).toContain("components/Hero.tsx");
    expect(paths.some((p) => p.endsWith(".test.tsx"))).toBe(false);
  });

  it("uses no backdrop filters (they re-blur everything behind them on every scroll frame)", () => {
    expect(offenders(/backdrop-(?:blur|filter)|backdropFilter/)).toEqual([]);
  });

  it("uses no blur filters (the page looked smeared while scrolling)", () => {
    // Tailwind utilities such as `blur-sm` or `blur-[3px]`, and CSS `blur(4px)`.
    // A DOM `element.blur()` call has no number inside it, so it is not matched.
    expect(offenders(/(?:^|[\s"'`:])blur-(?:xs|sm|md|lg|xl|2xl|3xl|none|\[)|\bblur\(\s*[\d.]/m)).toEqual([]);
  });

  it("uses no blend modes (each one adds a compositing pass over the page)", () => {
    expect(offenders(/mix-blend|mixBlendMode|background-blend/)).toEqual([]);
  });

  it("paints no full-screen overlay on the body (film grain, vignette)", () => {
    expect(offenders(/body::(?:before|after)/)).toEqual([]);
  });

  it("has no animation that never stops", () => {
    expect(
      offenders(/repeat:\s*Infinity|\binfinite\b|animate-(?:ping|pulse|spin|bounce)/),
    ).toEqual([]);
  });

  it("listens to no pointer movement on the whole page", () => {
    expect(
      offenders(
        /addEventListener\(\s*["'](?:mousemove|mouseover|mouseout|pointermove|pointerover|pointerout)["']/,
      ),
    ).toEqual([]);
  });

  it("never toggles classes on <body> or <html> (that restyles the whole page)", () => {
    expect(offenders(/document\.(?:body|documentElement)\.classList/)).toEqual([]);
  });

  it("does not bring back the 3D background or an inertia-scroll library", () => {
    expect(
      offenders(/from\s+["'](?:three|three\/[^"']*|lenis|lenis\/[^"']*|@react-three\/[^"']*)["']/),
    ).toEqual([]);
  });

  it("registers every scroll listener as passive, so scrolling never waits on it", () => {
    const missing = sources.flatMap(({ path, code }) =>
      Array.from(code.matchAll(/addEventListener\(\s*["']scroll["'][^;]*;/g))
        .filter((match) => !/passive:\s*true/.test(match[0]))
        .map((match) => `${path}: ${match[0]}`),
    );
    expect(missing).toEqual([]);
  });
});

describe("the budget rules catch what they are meant to catch", () => {
  const blur = /(?:^|[\s"'`:])blur-(?:xs|sm|md|lg|xl|2xl|3xl|none|\[)|\bblur\(\s*[\d.]/m;

  it("flags blur utilities and CSS blur values", () => {
    for (const bad of [
      'className="blur-sm"',
      'className="p-4 hover:blur-md"',
      'className="blur-[3px]"',
      "filter: blur(1px);",
      'style={{ filter: "blur(8px)" }}',
    ]) {
      expect(blur.test(bad), bad).toBe(true);
    }
  });

  it("leaves harmless uses of the word alone", () => {
    for (const fine of [
      "element.blur();",
      'window.addEventListener("blur", onBlur);',
      "const blurred = true;",
      "onBlur={handleBlur}",
    ]) {
      expect(blur.test(fine), fine).toBe(false);
    }
  });

});
