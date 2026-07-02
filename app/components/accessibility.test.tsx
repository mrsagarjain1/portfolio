import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { ScrollProgress } from "./ScrollProgress";
import { RippleEffect } from "./RippleEffect";
import { WaveSection } from "./WaveSection";
import { WaveformBars } from "./WaveformBars";
import { MorphingBlob } from "./MorphingBlob";
import { GeometryConnector } from "./GeometryConnector";
import {
  mockIntersectionObserver,
  mockMatchMedia,
  mockRequestAnimationFrame,
} from "../../vitest.setup";

/**
 * Accessibility component tests (task 16.2).
 *
 * These assert the structural accessibility invariants the immersive layer must
 * uphold — automated coverage only; full WCAG conformance still needs manual
 * assistive-technology testing and expert review.
 *
 *   8.1 Decorative elements are exposed to the a11y tree with no accessible
 *       name and no semantic role (aria-hidden), so screen readers stay silent.
 *   8.2 Decorative overlays never intercept pointer/keyboard events
 *       (pointer-events: none), so underlying content stays interactive.
 *   8.3 Every interactive control is reachable and operable by keyboard in a
 *       focus order that matches the visual reading (DOM) order.
 *   8.4 A visible focus indicator exists and is not suppressed by the layer.
 *   8.5 Purely decorative elements are removed from the keyboard tab sequence.
 *   8.6 The semantic document structure (headings, landmarks, links) is
 *       preserved independently of the immersive layer.
 *
 * _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
 */

// Stack embeds a GitHub contribution heatmap that fetches on mount; stub it so
// the home-page render stays network-free and deterministic.
vi.mock("./GitHubHeatmap", () => ({
  GitHubHeatmap: () => <div data-testid="github-heatmap" />,
}));

// Imported after the mock is registered.
import Home from "../page";

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
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]',
    ),
  ).filter((el) => el.getAttribute("tabindex") !== "-1");
}

beforeEach(() => {
  mockMatchMedia({ matches: false });
  mockIntersectionObserver();
  mockRequestAnimationFrame();
});

describe("decorative isolation (Req 8.1)", () => {
  it("hides decorative components from the accessibility tree with no role/name", () => {
    render(
      <Providers>
        <ScrollProgress />
        <RippleEffect />
        <MorphingBlob />
        <GeometryConnector />
        <WaveformBars />
      </Providers>,
    );

    // Nothing decorative surfaces a role or an accessible name...
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();

    // ...and every decorative root carries aria-hidden with no aria-label.
    document
      .querySelectorAll<HTMLElement>(
        ".fixed, .wave-bar, canvas, svg",
      )
      .forEach((el) => {
        // Each decorative element (or one of its ancestors) is aria-hidden.
        const hidden = el.closest('[aria-hidden="true"]');
        expect(hidden).not.toBeNull();
        expect(el).not.toHaveAttribute("aria-label");
      });
  });

  it("marks the WaveSection wave divider as decorative while preserving its child", () => {
    const { container } = render(
      <Providers>
        <WaveSection>
          <p>Section content</p>
        </WaveSection>
      </Providers>,
    );

    // The wrapped content is preserved and remains announced.
    expect(screen.getByText("Section content")).toBeInTheDocument();

    // The wave <svg> is purely decorative: hidden and non-interactive.
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("pointer-events-none");
  });
});

describe("overlays do not intercept events (Req 8.2)", () => {
  it("renders full-viewport decorative overlays with pointer-events disabled", () => {
    const { container } = render(
      <Providers>
        <ScrollProgress />
        <RippleEffect />
      </Providers>,
    );

    // The ripple canvas covers the viewport but must let clicks pass through.
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveClass("pointer-events-none");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps underlying content operable beneath the decorative layer", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Providers>
        {/* Decorative overlays mounted alongside real interactive content. */}
        <ScrollProgress />
        <RippleEffect />
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

describe("keyboard reachability and focus order (Req 8.3)", () => {
  it("exposes interactive controls and reaches them in reading (DOM) order", async () => {
    const user = userEvent.setup();
    const { container } = renderHome();

    const tabbables = tabbablesIn(container);
    // The page has real navigation, email CTA, and social links.
    expect(tabbables.length).toBeGreaterThanOrEqual(3);

    // Tabbing forward from the top visits controls in DOM/reading order.
    const sample = tabbables.slice(0, 5);
    for (const expected of sample) {
      await user.tab();
      expect(document.activeElement).toBe(expected);
    }
  });

  it("makes each representative control individually operable by keyboard", () => {
    const { container } = renderHome();

    for (const el of tabbablesIn(container).slice(0, 5)) {
      el.focus();
      expect(el).toHaveFocus();
    }
  });
});

describe("visible focus indicator (Req 8.4)", () => {
  it("defines a non-suppressed :focus-visible outline in the global stylesheet", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const css = readFileSync(resolve(here, "../globals.css"), "utf8");

    // A focus-visible rule exists and paints a real (non-`none`) outline.
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline\s*:/);
    const rule = css.match(/:focus-visible\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toMatch(/outline\s*:\s*(?!none)/);
  });
});

describe("decorative elements are not focusable (Req 8.5)", () => {
  it("keeps every aria-hidden decorative subtree out of the tab sequence", () => {
    const { container } = renderHome();

    container
      .querySelectorAll<HTMLElement>('[aria-hidden="true"]')
      .forEach((hidden) => {
        // The decorative root itself is not a natively-focusable control...
        const focusableRoot = hidden.matches(
          'a[href], button, input, select, textarea',
        );
        expect(focusableRoot).toBe(false);

        // ...nor does it contain any focusable descendant that a keyboard could
        // land on (which would also be an aria-hidden focus trap).
        const focusableInside = hidden.querySelectorAll(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        expect(focusableInside.length).toBe(0);
      });
  });
});

describe("semantic document structure is preserved (Req 8.6)", () => {
  it("retains landmarks, headings, and links independent of the immersive layer", () => {
    renderHome();

    // Landmark: the primary content region.
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();

    // Headings survive the reveal/scramble decorations.
    expect(screen.getAllByRole("heading").length).toBeGreaterThanOrEqual(1);

    // Navigable links remain present and named.
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(1);

    // The Contact section's real controls are still exposed by role.
    expect(
      within(main).getAllByRole("link").length,
    ).toBeGreaterThanOrEqual(1);
  });
});
