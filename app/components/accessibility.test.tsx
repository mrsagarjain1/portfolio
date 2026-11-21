import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { AmbientBackground } from "./AmbientBackground";
import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { RankMeter } from "./RankMeter";
import { ScrollProgress } from "./ScrollProgress";
import {
  mockIntersectionObserver,
  mockMatchMedia,
  mockRequestAnimationFrame,
} from "../../vitest.setup";

/**
 * Accessibility tests.
 *
 * These cover the structural invariants automatically: decorative parts stay
 * silent and out of the way, controls work from the keyboard, the focus ring
 * is visible, and the document structure is sound. They do not replace testing
 * with a screen reader and an expert review.
 */

// The contribution calendar fetches from GitHub. Stub it so the home-page
// render stays network-free and deterministic.
vi.mock("./GitHubHeatmap", () => ({
  GitHubHeatmap: () => <div data-testid="github-heatmap" />,
}));

// Imported after the mock is registered.
import Home from "../page";

const here = dirname(fileURLToPath(import.meta.url));

function Providers({ children }: { children?: ReactNode }) {
  return <ImmersiveProvider>{children}</ImmersiveProvider>;
}

function renderHome() {
  return render(
    <ImmersiveProvider>
      <Home />
    </ImmersiveProvider>,
  );
}

/** Native focus targets (excluding anything explicitly removed via tabindex). */
function tabbablesIn(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), input, select, textarea, [tabindex]",
    ),
  ).filter((el) => el.getAttribute("tabindex") !== "-1");
}

beforeEach(() => {
  mockMatchMedia({ matches: false });
  mockIntersectionObserver();
  mockRequestAnimationFrame();
  // jsdom has no canvas; the background only needs a context to exist.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    (() => null) as unknown as HTMLCanvasElement["getContext"],
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("decorative parts are silent", () => {
  it("hides the background, the progress bar and the rank meter from assistive technology", () => {
    render(
      <Providers>
        <ScrollProgress />
        <AmbientBackground />
        <RankMeter />
      </Providers>,
    );

    // Nothing decorative exposes a role or an accessible name...
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();

    // ...and every decorative root sits inside an aria-hidden element.
    const roots = document.querySelectorAll<HTMLElement>(".fixed, canvas, svg");
    expect(roots.length).toBeGreaterThan(0);
    roots.forEach((el) => {
      expect(el.closest('[aria-hidden="true"]')).not.toBeNull();
      expect(el).not.toHaveAttribute("aria-label");
    });
  });
});

describe("decorative layers do not intercept events", () => {
  it("renders the full-screen background with pointer events off", () => {
    render(
      <Providers>
        <AmbientBackground />
      </Providers>,
    );

    const canvas = screen.getByTestId("ambient-background");
    expect(canvas).toHaveClass("pointer-events-none");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps real content clickable beneath the decorative layer", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Providers>
        <ScrollProgress />
        <AmbientBackground />
        <button type="button" onClick={onClick}>
          Get in touch
        </button>
      </Providers>,
    );

    const button = screen.getByRole("button", { name: "Get in touch" });
    button.focus();
    expect(button).toHaveFocus();

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("keyboard reachability and focus order", () => {
  it("exposes interactive controls and reaches them in reading (DOM) order", async () => {
    const user = userEvent.setup();
    const { container } = renderHome();

    const tabbables = tabbablesIn(container);
    // Navigation, buttons, contact and social links.
    expect(tabbables.length).toBeGreaterThanOrEqual(10);

    // Tabbing forward from the top visits controls in DOM/reading order.
    for (const expected of tabbables.slice(0, 8)) {
      await user.tab();
      expect(document.activeElement).toBe(expected);
    }
  });

  it("lets every control take focus", () => {
    const { container } = renderHome();

    for (const el of tabbablesIn(container)) {
      el.focus();
      expect(el).toHaveFocus();
    }
  });
});

describe("visible focus indicator", () => {
  it("defines a :focus-visible outline in the global stylesheet", () => {
    const css = readFileSync(resolve(here, "../globals.css"), "utf8");

    // A focus-visible rule exists and paints a real (non-`none`) outline.
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline\s*:/);
    const rule = css.match(/:focus-visible\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toMatch(/outline\s*:\s*(?!none)/);
  });
});

describe("decorative elements are not focusable", () => {
  it("keeps every aria-hidden subtree out of the tab sequence", () => {
    const { container } = renderHome();

    const hiddenRoots = container.querySelectorAll<HTMLElement>('[aria-hidden="true"]');
    expect(hiddenRoots.length).toBeGreaterThan(0);
    hiddenRoots.forEach((hidden) => {
      // The decorative root itself is not a focusable control...
      expect(hidden.matches("a[href], button, input, select, textarea")).toBe(false);

      // ...and contains nothing a keyboard could land on.
      const focusableInside = hidden.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      expect(focusableInside.length).toBe(0);
    });
  });
});

describe("document structure", () => {
  it("has exactly one main landmark", () => {
    renderHome();
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("does not add a second main landmark in the root layout", () => {
    const layout = readFileSync(resolve(here, "../layout.tsx"), "utf8");
    expect(layout).not.toMatch(/role=["']main["']/);
  });

  it("has one h1 and never skips a heading level", () => {
    renderHome();

    const levels = screen
      .getAllByRole("heading")
      .map((heading) => Number(heading.tagName.slice(1)));
    expect(levels.filter((level) => level === 1)).toHaveLength(1);
    expect(levels[0]).toBe(1);
    levels.slice(1).forEach((level, i) => {
      // Going deeper may only go one level at a time.
      expect(level, `heading ${i + 2}`).toBeLessThanOrEqual(levels[i] + 1);
    });
  });

  it("has a heading for each section", () => {
    const { container } = renderHome();

    for (const section of container.querySelectorAll<HTMLElement>("section")) {
      expect(
        within(section).getAllByRole("heading").length,
        `#${section.id}`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it("gives every link, button and image a name a screen reader can read", () => {
    const { container } = renderHome();

    for (const link of screen.getAllByRole("link")) {
      expect(link, link.outerHTML).toHaveAccessibleName();
    }
    for (const button of screen.getAllByRole("button")) {
      expect(button, button.outerHTML).toHaveAccessibleName();
    }
    const images = container.querySelectorAll("img");
    expect(images.length).toBeGreaterThan(0);
    images.forEach((img) => {
      expect(img.getAttribute("alt")?.trim().length, img.outerHTML).toBeGreaterThan(0);
    });
  });
});
