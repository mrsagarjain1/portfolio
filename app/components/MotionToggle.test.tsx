import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import { MotionToggle } from "./MotionToggle";
import { mockMatchMedia } from "../../vitest.setup";

function renderToggle() {
  return render(
    <ImmersiveProvider>
      <MotionToggle />
    </ImmersiveProvider>,
  );
}

beforeEach(() => {
  mockMatchMedia({ matches: false });
});

describe("MotionToggle", () => {
  it("says motion is on when the system allows it", () => {
    renderToggle();

    expect(screen.getByRole("button", { name: "Turn off background motion" })).toBeInTheDocument();
    expect(screen.getByText("Motion on")).toBeInTheDocument();
  });

  it("switches motion off and back on", async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole("button", { name: "Turn off background motion" }));
    expect(screen.getByRole("button", { name: "Turn on background motion" })).toBeInTheDocument();
    expect(screen.getByText("Motion off")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Turn on background motion" }));
    expect(screen.getByText("Motion on")).toBeInTheDocument();
  });

  it("starts off when the system asks for reduced motion, and lets the visitor turn it on", async () => {
    mockMatchMedia({ matches: true });
    const user = userEvent.setup();
    renderToggle();
    expect(screen.getByText("Motion off")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Turn on background motion" }));
    expect(screen.getByText("Motion on")).toBeInTheDocument();
  });

  it("can be reached and used from the keyboard", async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByText("Motion off")).toBeInTheDocument();
  });

  it("is a small button fixed to the corner, with no backdrop blur", () => {
    renderToggle();

    const button = screen.getByRole("button");
    expect(button).toHaveClass("fixed");
    expect(button.className).not.toMatch(/backdrop|blur/);
  });
});
