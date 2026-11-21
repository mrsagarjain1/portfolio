import { useContext } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotionConfigContext } from "framer-motion";

import { MotionPolicy } from "./MotionPolicy";
import { ImmersiveProvider, useImmersiveContext } from "./immersive/ImmersiveProvider";
import { mockMatchMedia } from "../../vitest.setup";

function Probe() {
  return <p data-testid="policy">{useContext(MotionConfigContext).reducedMotion}</p>;
}

function Switches() {
  const { setMotionOverride } = useImmersiveContext();
  return (
    <>
      <button onClick={() => setMotionOverride("off")}>off</button>
      <button onClick={() => setMotionOverride("on")}>on</button>
      <button onClick={() => setMotionOverride("auto")}>auto</button>
    </>
  );
}

function renderPolicy() {
  return render(
    <ImmersiveProvider>
      <MotionPolicy>
        <Probe />
        <Switches />
      </MotionPolicy>
    </ImmersiveProvider>,
  );
}

describe("MotionPolicy", () => {
  it("leaves the choice to the visitor's system until the page's switch is used", () => {
    mockMatchMedia({ matches: false });
    renderPolicy();
    // "user" means framer reads the operating-system setting when each element mounts.
    expect(screen.getByTestId("policy")).toHaveTextContent("user");
  });

  it("does not depend on the provider's first, server-side answer", () => {
    // With the system asking for reduced motion the provider says "motion off",
    // but the policy must still hand the decision to framer, not freeze it as "always".
    mockMatchMedia({ matches: true });
    renderPolicy();
    expect(screen.getByTestId("policy")).toHaveTextContent("user");
  });

  it("follows the Motion switch in both directions, then back to the system", async () => {
    mockMatchMedia({ matches: false });
    const user = userEvent.setup();
    renderPolicy();
    const policy = screen.getByTestId("policy");

    await user.click(screen.getByRole("button", { name: "off" }));
    expect(policy).toHaveTextContent("always");

    await user.click(screen.getByRole("button", { name: "on" }));
    expect(policy).toHaveTextContent("never");

    await user.click(screen.getByRole("button", { name: "auto" }));
    expect(policy).toHaveTextContent("user");
  });
});
