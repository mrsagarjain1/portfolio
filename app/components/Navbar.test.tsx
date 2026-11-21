import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Navbar from "./Navbar";
import { navLinks, site } from "../lib/content";
import { mockMatchMedia } from "../../vitest.setup";

/** `window.innerWidth` is read-only in the DOM typings, but jsdom lets a test set it. */
function setWindowWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
}

const originalWidth = window.innerWidth;

beforeEach(() => {
  mockMatchMedia({ matches: false });
});

afterEach(() => {
  setWindowWidth(originalWidth);
  document.body.style.overflow = "";
});

function menuButton() {
  return screen.getByRole("button", { name: "Toggle menu" });
}

describe("Navbar", () => {
  it("shows the name as a link back to the top", () => {
    render(<Navbar />);

    const home = screen.getByRole("link", { name: site.name });
    expect(home).toHaveAttribute("href", "#");
  });

  it("links to every section in the content file", () => {
    render(<Navbar />);

    const header = screen.getByRole("banner");
    for (const link of navLinks) {
      expect(within(header).getByRole("link", { name: link.label })).toHaveAttribute(
        "href",
        link.href,
      );
    }
  });

  it("includes the decorative rank meter, hidden from assistive technology", () => {
    render(<Navbar />);

    expect(screen.getByTestId("rank-meter")).toHaveAttribute("aria-hidden", "true");
  });

  it("starts with the mobile menu closed and the page scrollable", () => {
    render(<Navbar />);

    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
    // Only the desktop copy of each link is on the page.
    for (const link of navLinks) {
      expect(screen.getAllByRole("link", { name: link.label })).toHaveLength(1);
    }
  });

  it("opens the mobile menu and stops the page behind it from scrolling", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.click(menuButton());

    expect(menuButton()).toHaveAttribute("aria-expanded", "true");
    expect(document.body.style.overflow).toBe("hidden");
    for (const link of navLinks) {
      expect(screen.getAllByRole("link", { name: link.label })).toHaveLength(2);
    }
  });

  it("closes the mobile menu and releases the page scroll when a link is chosen", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(menuButton());

    const [, mobileLink] = screen.getAllByRole("link", { name: navLinks[0].label });
    await user.click(mobileLink);

    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
  });

  it("closes the mobile menu when the window grows to desktop width", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(menuButton());
    expect(menuButton()).toHaveAttribute("aria-expanded", "true");

    act(() => {
      setWindowWidth(1280);
      window.dispatchEvent(new Event("resize"));
    });

    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
  });

  it("releases the page scroll if it unmounts while the menu is open", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Navbar />);
    await user.click(menuButton());
    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });
});
