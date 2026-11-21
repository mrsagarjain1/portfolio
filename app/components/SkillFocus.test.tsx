import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FocusTag, FocusTarget, SkillChip, SkillFocusProvider } from "./SkillFocus";

function Demo() {
  return (
    <SkillFocusProvider>
      <SkillChip skill="LangChain" />
      <FocusTarget as="article" id="uses" tags={["LangChain", "Python"]}>
        <FocusTag tag="LangChain" />
        <FocusTag tag="Python" />
      </FocusTarget>
      <FocusTarget as="article" id="other" tags={["C"]}>
        <FocusTag tag="C" />
      </FocusTarget>
      <FocusTarget as="article" id="untagged" tags={[]}>
        No tags
      </FocusTarget>
    </SkillFocusProvider>
  );
}

/** The skill chip. A tag with the same name sits in a card after it, so the chip is the first match. */
const chipOf = () => screen.getAllByRole("button", { name: "LangChain" })[0];

const dimmed = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("[data-dim='true']")).map((el) => el.id);

describe("following a skill", () => {
  it("shows everything normally to start with", () => {
    const { container } = render(<Demo />);
    expect(dimmed(container)).toEqual([]);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("dims what does not use a pinned skill, and never dims what has no tags", async () => {
    const user = userEvent.setup();
    const { container } = render(<Demo />);

    await user.click(chipOf());

    expect(dimmed(container)).toEqual(["other"]);
    expect(chipOf()).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Showing where I used LangChain");
  });

  it("turns the matching tags red and leaves the others alone", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    await user.click(screen.getAllByRole("button", { name: "LangChain" })[0]);

    const [matching] = screen.getAllByRole("button", { name: "LangChain" }).slice(-1);
    expect(matching).toHaveClass("text-red");
    expect(screen.getByRole("button", { name: "Python" })).not.toHaveClass("text-red");
  });

  it("puts everything back when the same skill is clicked again", async () => {
    const user = userEvent.setup();
    const { container } = render(<Demo />);

    await user.click(chipOf());
    expect(dimmed(container)).toEqual(["other"]);

    await user.click(chipOf());
    expect(dimmed(container)).toEqual([]);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("clears with the Clear button and with Escape", async () => {
    const user = userEvent.setup();
    const { container } = render(<Demo />);

    await user.click(chipOf());
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(dimmed(container)).toEqual([]);

    await user.click(chipOf());
    expect(dimmed(container)).toEqual(["other"]);
    await user.keyboard("{Escape}");
    expect(dimmed(container)).toEqual([]);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("follows a tag on its own, and lets go when the pointer leaves", async () => {
    const user = userEvent.setup();
    const { container } = render(<Demo />);
    const tag = screen.getByRole("button", { name: "C" });

    await user.hover(tag);
    expect(dimmed(container)).toEqual(["uses"]);
    // A hover is a preview: nothing is pinned, so there is no note.
    expect(screen.queryByRole("status")).toBeNull();

    await user.unhover(tag);
    expect(dimmed(container)).toEqual([]);
  });

  it("does not preview on touch, where there is no hover", () => {
    const { container } = render(<Demo />);
    fireEvent.pointerEnter(screen.getByRole("button", { name: "C" }), { pointerType: "touch" });
    expect(dimmed(container)).toEqual([]);
  });

  it("keeps a pinned skill after the pointer leaves it", async () => {
    const user = userEvent.setup();
    const { container } = render(<Demo />);

    await user.click(chipOf());
    await user.unhover(chipOf());
    expect(dimmed(container)).toEqual(["other"]);
  });

  it("works on its own, without the provider, and then follows nothing", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <FocusTarget as="li" tags={["C"]}>
        <FocusTag tag="C" />
      </FocusTarget>,
    );

    await user.click(screen.getByRole("button", { name: "C" }));
    expect(dimmed(container)).toEqual([]);
  });
});
