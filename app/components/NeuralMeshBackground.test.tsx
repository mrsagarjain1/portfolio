import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { ImmersiveProvider } from "./immersive/ImmersiveProvider";
import {
  mockMatchMedia,
  mockRequestAnimationFrame,
  setVisibilityState,
} from "../../vitest.setup";

/**
 * Component tests for the ambient background (task 11.2).
 *
 * Cover visibility pause/resume of the shared render loop, the single static
 * frame under reduced motion, the forced-init-failure fallback (page stays
 * interactive), and the decorative stacking/isolation invariants
 * (z-index / pointer-events / aria-hidden).
 * _Requirements: 5.1, 5.3, 5.4, 5.6, 7.4, 7.5_
 *
 * `three` and its post-processing modules require a real WebGL context that
 * jsdom does not provide, so they are replaced with lightweight stubs that make
 * the loop lifecycle observable (a shared `render` spy) and let a single test
 * force init failure via a controllable flag.
 */

const H = vi.hoisted(() => ({
  renderSpy: vi.fn(),
  disposeSpy: vi.fn(),
  shouldThrow: false,
}));

vi.mock("three", () => {
  class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    clone() {
      return new Vector3(this.x, this.y, this.z);
    }
    set(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    copy(v: Vector3) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    }
    distanceToSquared() {
      return 1;
    }
    lerp() {
      return this;
    }
    lerpVectors() {
      return this;
    }
    project() {
      return this;
    }
  }
  class Vector2 {
    x: number;
    y: number;
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
  }
  class Matrix4 {
    makeTranslation() {
      return this;
    }
    scale() {
      return this;
    }
  }
  class Plane {}
  class Raycaster {
    ray = { intersectPlane: () => new Vector3() };
    setFromCamera() {}
  }
  class Scene {
    fog: unknown = null;
    children: unknown[] = [];
    add(o: unknown) {
      this.children.push(o);
    }
    traverse(cb: (o: unknown) => void) {
      this.children.forEach((c) => cb(c));
    }
  }
  class FogExp2 {}
  class PerspectiveCamera {
    position = {
      x: 0,
      y: 0,
      z: 0,
      set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
      },
    };
    up = new Vector3(0, 1, 0);
    aspect = 1;
    updateProjectionMatrix() {}
    lookAt() {}
  }
  class WebGLRenderer {
    domElement: HTMLCanvasElement;
    render = H.renderSpy;
    dispose = H.disposeSpy;
    constructor() {
      if (H.shouldThrow) throw new Error("WebGL unavailable");
      this.domElement = document.createElement("canvas");
    }
    setPixelRatio() {}
    setSize() {}
    setClearColor() {}
  }
  class Mesh {}
  class InstancedMesh extends Mesh {
    geometry: unknown;
    material: unknown;
    instanceMatrix = { setUsage() {}, needsUpdate: false };
    constructor(geometry: unknown, material: unknown) {
      super();
      this.geometry = geometry;
      this.material = material;
    }
    setMatrixAt() {}
  }
  class LineSegments {
    geometry: unknown;
    material: unknown;
    constructor(geometry: unknown, material: unknown) {
      this.geometry = geometry;
      this.material = material;
    }
  }
  class Points {
    geometry: unknown;
    material: unknown;
    constructor(geometry: unknown, material: unknown) {
      this.geometry = geometry;
      this.material = material;
    }
  }
  class SphereGeometry {
    attributes: Record<string, unknown> = {};
    setAttribute(name: string, attr: unknown) {
      this.attributes[name] = attr;
    }
    dispose = vi.fn();
  }
  class BufferGeometry {
    attributes: Record<string, unknown> = {};
    setAttribute(name: string, attr: unknown) {
      this.attributes[name] = attr;
    }
    setDrawRange() {}
    dispose = vi.fn();
  }
  class InstancedBufferAttribute {
    array: unknown;
    needsUpdate = false;
    constructor(array: unknown) {
      this.array = array;
    }
  }
  class BufferAttribute {
    array: unknown;
    needsUpdate = false;
    constructor(array: unknown) {
      this.array = array;
    }
    setUsage() {
      return this;
    }
  }
  class ShaderMaterial {
    uniforms: Record<string, { value: number }>;
    constructor(opts?: { uniforms?: Record<string, { value: number }> }) {
      this.uniforms = opts?.uniforms ?? {};
    }
    dispose = vi.fn();
  }

  return {
    Vector3,
    Vector2,
    Matrix4,
    Plane,
    Raycaster,
    Scene,
    FogExp2,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    InstancedMesh,
    LineSegments,
    Points,
    SphereGeometry,
    BufferGeometry,
    InstancedBufferAttribute,
    BufferAttribute,
    ShaderMaterial,
    DynamicDrawUsage: 35048,
    AdditiveBlending: 2,
  };
});

vi.mock("three/examples/jsm/postprocessing/EffectComposer.js", () => ({
  EffectComposer: class {
    addPass() {}
    render = H.renderSpy;
    setSize() {}
    dispose() {}
  },
}));
vi.mock("three/examples/jsm/postprocessing/RenderPass.js", () => ({
  RenderPass: class {},
}));
vi.mock("three/examples/jsm/postprocessing/UnrealBloomPass.js", () => ({
  UnrealBloomPass: class {},
}));

// Imported after the mocks are registered.
import { NeuralMeshBackground } from "./NeuralMeshBackground";

function Providers({ children }: { children?: ReactNode }) {
  return (
    <ImmersiveProvider>
      <NeuralMeshBackground />
      {children}
    </ImmersiveProvider>
  );
}

function getBackgroundEl(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('div[aria-hidden="true"]');
  if (!el) throw new Error("background container not found");
  return el;
}

beforeEach(() => {
  H.renderSpy.mockClear();
  H.disposeSpy.mockClear();
  H.shouldThrow = false;
  setVisibilityState("visible");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("NeuralMeshBackground decorative isolation", () => {
  it("renders behind content, ignores pointer events, and is hidden from a11y", () => {
    mockMatchMedia({ matches: false });
    mockRequestAnimationFrame();

    const { container } = render(<Providers />);
    const bg = getBackgroundEl(container);

    expect(bg).toHaveAttribute("aria-hidden", "true");
    expect(bg).toHaveClass("pointer-events-none");
    expect(bg).toHaveStyle({ zIndex: 0 });
  });
});

describe("NeuralMeshBackground reduced motion", () => {
  it("renders a single static frame with no scheduled follow-up frames", () => {
    mockMatchMedia({ matches: true }); // prefers-reduced-motion: reduce
    const raf = mockRequestAnimationFrame();

    render(<Providers />);

    // One frame draws the static image...
    act(() => raf.flush(16));
    expect(H.renderSpy).toHaveBeenCalledTimes(1);

    // ...and nothing further is scheduled.
    expect(raf.pending).toBe(0);
    act(() => raf.flush(32));
    expect(H.renderSpy).toHaveBeenCalledTimes(1);
  });
});

describe("NeuralMeshBackground visibility pause/resume", () => {
  it("pauses the loop when the tab hides and resumes when it shows", () => {
    mockMatchMedia({ matches: false }); // motion enabled
    const raf = mockRequestAnimationFrame();

    render(<Providers />);

    // Loop is alive: each flush renders and reschedules the next frame.
    act(() => raf.flush(100));
    const afterFirst = H.renderSpy.mock.calls.length;
    expect(afterFirst).toBeGreaterThan(0);

    act(() => raf.flush(200));
    const afterSecond = H.renderSpy.mock.calls.length;
    expect(afterSecond).toBeGreaterThan(afterFirst);

    // Hide the tab -> loop pauses (no further renders even after flushing).
    act(() => setVisibilityState("hidden"));
    act(() => raf.flush(300));
    expect(H.renderSpy.mock.calls.length).toBe(afterSecond);

    // Show the tab -> loop resumes.
    act(() => setVisibilityState("visible"));
    act(() => raf.flush(400));
    expect(H.renderSpy.mock.calls.length).toBeGreaterThan(afterSecond);
  });
});

describe("NeuralMeshBackground init failure fallback", () => {
  it("falls back to an empty decorative container and keeps content interactive", () => {
    H.shouldThrow = true;
    mockMatchMedia({ matches: false });
    mockRequestAnimationFrame();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { container } = render(
      <Providers>
        <button type="button">Contact me</button>
      </Providers>,
    );

    const bg = getBackgroundEl(container);
    // No canvas was mounted and the overlay never intercepts input.
    expect(bg.querySelector("canvas")).toBeNull();
    expect(bg).toHaveClass("pointer-events-none");

    // Surrounding interactive content remains present and operable.
    const button = screen.getByRole("button", { name: "Contact me" });
    button.focus();
    expect(button).toHaveFocus();

    // Failure is logged for developers only, never surfaced to the visitor.
    expect(consoleError).toHaveBeenCalled();
  });
});
