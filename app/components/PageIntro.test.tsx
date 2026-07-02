import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { type ReactNode } from "react";

import { PageIntro } from "./PageIntro";
import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { INTRO_SHOWN_KEY } from "../lib/immersive/intro";
import {
  INTRO_FAILSAFE_MS,
  INTRO_MAX_MS,
  INTRO_REDUCED_MS,
} from "../lib/immersive/constants";
import { mockMatchMedia, mockSessionStorage } from "../../vitest.setup";

/**
 * Component tests for the page-load intro lifecycle (task 14.2).
 *
 * Cover overlay presence/removal, timing bounds, focus containment then
 * release, the reduced-motion fast path, the failsafe reveal, and the
 * once-per-session guard, using fake timers and the shared browser mocks.
 * _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
 */

/** Fade duration before the overlay fully unmounts (kept in sync with PageIntro). */
const DISMISS_MS = 600;

function withProvider(children: ReactNode) {
  return <ImmersiveProvider>{children}</ImmersiveProvider>;
}

const overlay = () => screen.queryByTestId("page-intro-overlay");

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  // Restore any scroll lock left on the body between tests.
  document.body.style.overflow = "";
  vi.useRealTimers();
});

describe("PageIntro — first visit with motion enabled (playing)", () => {
  it("displays a full-viewport overlay above content and locks scroll (Req 6.1)", () => {
    mockMatchMedia({ matches: false }); // motion enabled
    mockSessionStorage();

    render(withProvider(<PageIntro />));

    const el = overlay();
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("fixed", "inset-0");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("reveals content within INTRO_MAX_MS and restores scroll (Req 6.2)", () => {
    mockMatchMedia({ matches: false });
    mockSessionStorage();

    render(withProvider(<PageIntro />));
    expect(document.body.style.overflow).toBe("hidden");

    act(() => {
      vi.advanceTimersByTime(INTRO_MAX_MS);
    });

    // Content is interactive again as soon as reveal fires.
    expect(document.body.style.overflow).toBe("");
  });

  it("fully unmounts the overlay after reveal, leaving no interceptor (Req 6.3)", () => {
    mockMatchMedia({ matches: false });
    mockSessionStorage();

    render(withProvider(<PageIntro />));
    expect(overlay()).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(INTRO_MAX_MS + DISMISS_MS);
    });

    expect(overlay()).not.toBeInTheDocument();
  });
});

describe("PageIntro — focus containment (Req 6.4, 6.3)", () => {
  it("traps focus inside the overlay while visible, then releases on reveal", () => {
    mockMatchMedia({ matches: false });
    mockSessionStorage();

    render(
      withProvider(
        <>
          <button data-testid="content-btn">Underlying content</button>
          <PageIntro />
        </>,
      ),
    );

    const el = overlay()!;
    const button = screen.getByTestId("content-btn");

    // Focus starts inside the overlay.
    expect(document.activeElement).toBe(el);

    // Attempts to focus underlying content are pulled back to the overlay.
    act(() => {
      button.focus();
    });
    expect(document.activeElement).toBe(el);

    // After reveal + unmount, focus can rest on the underlying content.
    act(() => {
      vi.advanceTimersByTime(INTRO_MAX_MS + DISMISS_MS);
    });
    expect(overlay()).not.toBeInTheDocument();

    act(() => {
      button.focus();
    });
    expect(document.activeElement).toBe(button);
  });
});

describe("PageIntro — reduced-motion fast path (Req 6.5)", () => {
  it("reveals within INTRO_REDUCED_MS without the animated sequence", () => {
    mockMatchMedia({ matches: true }); // prefers-reduced-motion: reduce
    mockSessionStorage();

    render(withProvider(<PageIntro />));

    const el = overlay()!;
    expect(el).toBeInTheDocument();
    // No animated orbiting/particle nodes — only the static name + role.
    expect(el).toHaveTextContent("Applied AI Engineer");
    expect(document.body.style.overflow).toBe("hidden");

    // Not yet revealed just before the reduced budget.
    act(() => {
      vi.advanceTimersByTime(INTRO_REDUCED_MS - 1);
    });
    expect(document.body.style.overflow).toBe("hidden");

    // Revealed by INTRO_REDUCED_MS.
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(document.body.style.overflow).toBe("");

    act(() => {
      vi.advanceTimersByTime(DISMISS_MS);
    });
    expect(overlay()).not.toBeInTheDocument();
  });
});

describe("PageIntro — failsafe (Req 6.6)", () => {
  it("guarantees the content is revealed by INTRO_FAILSAFE_MS", () => {
    mockMatchMedia({ matches: false });
    mockSessionStorage();

    render(withProvider(<PageIntro />));
    expect(overlay()).toBeInTheDocument();

    // Even in the worst case, content is revealed no later than the failsafe.
    act(() => {
      vi.advanceTimersByTime(INTRO_FAILSAFE_MS);
    });
    expect(document.body.style.overflow).toBe("");

    act(() => {
      vi.advanceTimersByTime(DISMISS_MS);
    });
    expect(overlay()).not.toBeInTheDocument();
  });
});

describe("PageIntro — once-per-session guard (Req 6.7)", () => {
  it("reveals immediately without an overlay when already shown this session", () => {
    mockMatchMedia({ matches: false });
    const { storage } = mockSessionStorage();
    // Simulate the intro having already played this session.
    storage.setItem(INTRO_SHOWN_KEY, "1");

    render(withProvider(<PageIntro />));

    // No overlay is displayed and scroll is never locked.
    expect(overlay()).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });
});
