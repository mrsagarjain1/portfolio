import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ImmersiveProvider, useImmersiveContext } from "./ImmersiveProvider";
import { mockMatchMedia, setVisibilityState } from "../../../vitest.setup";

/** Writes every motion setting into the DOM so tests can read it back. */
function Probe() {
  const ctx = useImmersiveContext();
  return (
    <div>
      <span data-testid="motion">{String(ctx.motionEnabled)}</span>
      <span data-testid="tab">{String(ctx.tabVisible)}</span>
      <span data-testid="override">{ctx.motionOverride}</span>
      <button type="button" onClick={() => ctx.setMotionOverride("on")}>
        force on
      </button>
      <button type="button" onClick={() => ctx.setMotionOverride("off")}>
        force off
      </button>
      <button type="button" onClick={() => ctx.setMotionOverride("auto")}>
        follow system
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <ImmersiveProvider>
      <Probe />
    </ImmersiveProvider>,
  );
}

describe("ImmersiveProvider", () => {
  it("renders content in its final state on the server: motion off, tab visible", () => {
    // Effects never run in a static render, so this is what the server sends.
    const html = renderToStaticMarkup(
      <ImmersiveProvider>
        <Probe />
      </ImmersiveProvider>,
    );

    expect(html).toContain('<span data-testid="motion">false</span>');
    expect(html).toContain('<span data-testid="tab">true</span>');
    expect(html).toContain('<span data-testid="override">auto</span>');
  });

  it("turns motion on in the browser when the system does not ask for less", () => {
    mockMatchMedia({ matches: false });
    renderProvider();

    expect(screen.getByTestId("motion")).toHaveTextContent("true");
    expect(screen.getByTestId("tab")).toHaveTextContent("true");
  });

  it("keeps motion off when the system asks for reduced motion", () => {
    mockMatchMedia({ matches: true });
    renderProvider();

    expect(screen.getByTestId("motion")).toHaveTextContent("false");
  });

  it("follows the system setting live", () => {
    const media = mockMatchMedia({ matches: false });
    renderProvider();
    expect(screen.getByTestId("motion")).toHaveTextContent("true");

    act(() => media.setMatches(true));
    expect(screen.getByTestId("motion")).toHaveTextContent("false");

    act(() => media.setMatches(false));
    expect(screen.getByTestId("motion")).toHaveTextContent("true");
  });

  it("lets the visitor switch motion on even when the system asks for less", () => {
    mockMatchMedia({ matches: true });
    renderProvider();

    fireEvent.click(screen.getByText("force on"));

    expect(screen.getByTestId("motion")).toHaveTextContent("true");
    expect(screen.getByTestId("override")).toHaveTextContent("on");
  });

  it("lets the visitor switch motion off, and go back to following the system", () => {
    const media = mockMatchMedia({ matches: false });
    renderProvider();

    fireEvent.click(screen.getByText("force off"));
    expect(screen.getByTestId("motion")).toHaveTextContent("false");

    // While overridden, a system change does not matter.
    act(() => media.setMatches(true));
    act(() => media.setMatches(false));
    expect(screen.getByTestId("motion")).toHaveTextContent("false");

    fireEvent.click(screen.getByText("follow system"));
    expect(screen.getByTestId("motion")).toHaveTextContent("true");
    expect(screen.getByTestId("override")).toHaveTextContent("auto");
  });

  it("reports when the tab is hidden and visible again", () => {
    mockMatchMedia({ matches: false });
    renderProvider();
    expect(screen.getByTestId("tab")).toHaveTextContent("true");

    act(() => setVisibilityState("hidden"));
    expect(screen.getByTestId("tab")).toHaveTextContent("false");

    act(() => setVisibilityState("visible"));
    expect(screen.getByTestId("tab")).toHaveTextContent("true");
  });

  it("stops listening for system changes when it unmounts", () => {
    const media = mockMatchMedia({ matches: false });
    const { unmount } = renderProvider();
    expect(media.mql.addEventListener).toHaveBeenCalled();

    unmount();
    expect(media.mql.removeEventListener).toHaveBeenCalled();
  });

  it("throws a clear error when used outside the provider", () => {
    expect(() => renderToStaticMarkup(<Probe />)).toThrow(/ImmersiveProvider/);
  });
});
