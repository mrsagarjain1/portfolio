import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";

import { GitHubActivity } from "./GitHubActivity";
import { mockIntersectionObserver } from "../../vitest.setup";

// The real calendar fetches from GitHub. Replace it with a marker so the test
// shows only whether and when GitHubActivity decides to load it.
vi.mock("./GitHubHeatmap", () => ({
  GitHubHeatmap: ({ username }: { username: string }) => (
    <div data-testid="github-heatmap">{username}</div>
  ),
}));

let io: ReturnType<typeof mockIntersectionObserver>;

beforeEach(() => {
  io = mockIntersectionObserver();
});

describe("GitHubActivity", () => {
  it("shows a quiet placeholder first and does not load the calendar", () => {
    const { container } = render(<GitHubActivity username="octocat" />);

    expect(screen.queryByTestId("github-heatmap")).toBeNull();
    const placeholder = container.querySelector('[aria-hidden="true"]');
    expect(placeholder).not.toBeNull();
    expect(io.instances).toHaveLength(1);
    expect(io.instances[0].observe).toHaveBeenCalledTimes(1);
  });

  it("keeps waiting while the card is far from the screen", async () => {
    render(<GitHubActivity username="octocat" />);

    act(() => io.trigger(false));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(screen.queryByTestId("github-heatmap")).toBeNull();
  });

  it("loads the calendar for the right user when the card is about to be seen", async () => {
    render(<GitHubActivity username="octocat" />);

    act(() => io.trigger(true));

    const heatmap = await screen.findByTestId("github-heatmap");
    expect(heatmap).toHaveTextContent("octocat");
    expect(io.instances[0].disconnect).toHaveBeenCalled();
  });

  it("loads the calendar straight away in a browser without IntersectionObserver", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<GitHubActivity username="octocat" />);

    await waitFor(() => expect(screen.getByTestId("github-heatmap")).toBeInTheDocument());
  });
});
