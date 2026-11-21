import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ScrollReveal } from "./ScrollReveal";
import { mockIntersectionObserver } from "../../vitest.setup";

beforeEach(() => {
  mockIntersectionObserver();
});

describe("ScrollReveal", () => {
  it("keeps its content in the server-rendered HTML", () => {
    const html = renderToString(
      <ScrollReveal>
        <p>Reachable by search engines</p>
      </ScrollReveal>,
    );

    expect(html).toContain("<p>Reachable by search engines</p>");
  });

  it("keeps its content in the page and the accessibility tree before it is revealed", () => {
    render(
      <ScrollReveal>
        <p>Read by screen readers</p>
      </ScrollReveal>,
    );

    // Fading in only changes opacity. Nothing is hidden from assistive technology.
    const text = screen.getByText("Read by screen readers");
    expect(text).toBeInTheDocument();
    expect(text.closest("[hidden], [aria-hidden='true']")).toBeNull();
  });

  it("passes its class name to the wrapper", () => {
    const { container } = render(
      <ScrollReveal className="lg:col-span-2">
        <p>Wide</p>
      </ScrollReveal>,
    );

    expect(container.firstElementChild).toHaveClass("lg:col-span-2");
  });

  it("only fades and slides: no blur, scale or 3D transform", () => {
    const html = renderToString(
      <ScrollReveal>
        <p>Plain</p>
      </ScrollReveal>,
    );

    expect(html).toMatch(/opacity:\s*0/);
    expect(html).not.toMatch(/filter|blur|scale|rotate|perspective|matrix3d/i);
  });
});
