import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import fc from "fast-check";

import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { ParallaxSection } from "./ParallaxSection";
import { ScrollDepth } from "./ScrollDepth";
import { SectionTransition } from "./SectionTransition";
import { WaveSection } from "./WaveSection";
import {
  mockIntersectionObserver,
  mockMatchMedia,
  mockRequestAnimationFrame,
} from "../../vitest.setup";

/**
 * Property-based test for task 15.2 — Property 12 (wrapper children preserved).
 *
 * The activating wrappers subscribe to the coordination layer (frame clock,
 * reduced-motion, latched reveal), so each is rendered inside an
 * {@link ImmersiveProvider}. The shared frame clock and IntersectionObserver
 * are mocked so no real rAF loop runs; we only assert the child content is
 * present in the wrapper's output.
 *
 * _Requirements: 2.2, 2.6_
 */

/** The wrappers under test, each rendering the supplied child content. */
const WRAPPERS: Array<{
  name: string;
  render: (child: ReactNode) => ReactNode;
}> = [
  { name: "ParallaxSection", render: (c) => <ParallaxSection>{c}</ParallaxSection> },
  { name: "ScrollDepth", render: (c) => <ScrollDepth>{c}</ScrollDepth> },
  {
    name: "SectionTransition",
    render: (c) => <SectionTransition>{c}</SectionTransition>,
  },
  { name: "WaveSection", render: (c) => <WaveSection>{c}</WaveSection> },
];

beforeEach(() => {
  mockMatchMedia({ matches: false });
  mockIntersectionObserver();
  mockRequestAnimationFrame();
});

describe("Property 12: wrapper components preserve their children", () => {
  // Feature: immersive-experience, Property 12: For any child content, each activating wrapper (ParallaxSection, ScrollDepth, SectionTransition, WaveSection) renders that exact child content in its output, so pre-existing Section content is never removed or hidden by activation.
  it("renders the exact child content for every activating wrapper", () => {
    fc.assert(
      fc.property(fc.string(), (childText) => {
        for (const wrapper of WRAPPERS) {
          const { container, unmount } = render(
            <ImmersiveProvider>
              {wrapper.render(
                <div data-testid="wrapped-child">{childText}</div>,
              )}
            </ImmersiveProvider>,
          );

          const child = container.querySelector<HTMLElement>(
            '[data-testid="wrapped-child"]',
          );

          try {
            // The child element exists in the wrapper's output...
            expect(child, `${wrapper.name} dropped its child`).not.toBeNull();
            // ...and its content is preserved exactly.
            expect(child!.textContent).toBe(childText);
          } finally {
            unmount();
          }
        }
      }),
    );
  });
});
