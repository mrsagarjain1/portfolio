import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Drift } from "./Drift";
import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { mockMatchMedia } from "../../vitest.setup";

beforeEach(() => {
  mockMatchMedia({ matches: false });
});

describe("Drift", () => {
  it("shows what it wraps, with the classes it is given", () => {
    render(
      <ImmersiveProvider>
        <Drift rise={100} className="lg:absolute">
          <p>Photo</p>
        </Drift>
      </ImmersiveProvider>,
    );

    const wrapper = screen.getByText("Photo").parentElement as HTMLElement;
    expect(wrapper).toHaveClass("lg:absolute");
  });

  it("starts where it is placed: no offset until the page scrolls", () => {
    render(
      <ImmersiveProvider>
        <Drift rise={100}>
          <p>Photo</p>
        </Drift>
      </ImmersiveProvider>,
    );

    const wrapper = screen.getByText("Photo").parentElement as HTMLElement;
    // At the top of the page the lift is zero, so there is no visible transform to undo.
    expect(wrapper.style.transform === "" || /translateY\(0px\)|none/.test(wrapper.style.transform)).toBe(
      true,
    );
  });
});
