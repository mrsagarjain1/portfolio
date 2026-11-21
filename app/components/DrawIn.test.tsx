import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { DrawIn } from "./DrawIn";
import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import type { RevealRect } from "../lib/content";
import { mockIntersectionObserver, mockMatchMedia } from "../../vitest.setup";

const rects: RevealRect[] = [
  { x: 0, y: 0, w: 50.5, h: 100, at: 0 },
  { x: 50, y: 0, w: 50, h: 100, at: 1, dir: "y" },
];

beforeEach(() => {
  mockMatchMedia({ matches: false });
  mockIntersectionObserver();
});

function renderCovers() {
  return render(
    <ImmersiveProvider>
      <DrawIn rects={rects} />
    </ImmersiveProvider>,
  );
}

describe("DrawIn", () => {
  it("lays one cover over each part, placed by percentage", () => {
    renderCovers();
    const layer = screen.getByTestId("draw-in");

    expect(layer.children).toHaveLength(rects.length);
    const second = layer.children[1] as HTMLElement;
    expect(second.style.left).toBe("50%");
    expect(second.style.width).toBe("50%");
    expect(second.style.height).toBe("100%");
  });

  it("is decoration: hidden from assistive technology and out of the way of the pointer", () => {
    renderCovers();
    const layer = screen.getByTestId("draw-in");

    expect(layer).toHaveAttribute("aria-hidden", "true");
    expect(layer).toHaveClass("pointer-events-none");
  });

  it("starts with every part covered, so nothing shows before its turn", () => {
    const html = renderToString(
      <ImmersiveProvider>
        <DrawIn rects={rects} />
      </ImmersiveProvider>,
    );

    // The covers are in the markup at full size, in the diagrams' own ink colour, and none has
    // started to shrink. Shrinking is a transform, and nothing here uses a filter.
    expect(html.match(/background-color:#080a09/g)).toHaveLength(rects.length);
    expect(html).not.toMatch(/scale[XY]\(0\)/);
    expect(html).not.toMatch(/blur|filter|backdrop/i);
  });
});
