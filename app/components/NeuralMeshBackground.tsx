"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { useReducedMotion } from "../hooks/useReducedMotion";
import { useTabVisibility } from "../hooks/useTabVisibility";
import { usePointerBroadcast } from "../hooks/usePointerBroadcast";
import { computeElementCount, tierFor } from "../lib/immersive/performance";
import type { Tier } from "../lib/immersive/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const NODE_COUNT_FULL = 500;
const PARTICLE_COUNT = 150;
const K_NEIGHBORS = 3;
const CONNECTION_RECALC_INTERVAL = 10;
const MOUSE_INFLUENCE_RADIUS = 250;
const RIPPLE_HOPS = 3;
const RIPPLE_DELAY = 0.1; // seconds per hop
const VOLUME = { x: 900, y: 600, z: 400 };

// ─── Topology presets (scroll-driven) ────────────────────────────────────────

type TopologyFn = (i: number, total: number, time: number) => THREE.Vector3;

// Scroll-driven topologies: the background morphs through a distinct shape per
// section as the visitor scrolls, rather than a single rotating form.
const topologies: Record<string, TopologyFn> = {
  // Hero: dense central cluster (Fibonacci-sphere distribution)
  hero: (i, total, time) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / total);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 180 + Math.sin(i * 0.7 + time * 0.3) * 30;
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi) * 0.8,
      r * Math.sin(phi) * Math.sin(theta) * 0.6
    );
  },
  // Work: expanded distributed network
  work: (i, total, time) => {
    const row = Math.floor(i / 14);
    const col = i % 14;
    const jitter = Math.sin(i * 3.7 + time * 0.2) * 25;
    return new THREE.Vector3(
      (col - 7) * 65 + jitter,
      (row - total / 28) * 55 + Math.cos(i * 2.1 + time * 0.15) * 20,
      Math.sin(i * 1.3 + time * 0.1) * 120
    );
  },
  // Story: smooth horizontal flowing streams (deterministic — no per-frame
  // randomness, so the ribbons flow cleanly instead of shimmering)
  story: (i, total, time) => {
    const STREAMS = 6;
    const stream = i % STREAMS;
    // Fraction along this stream, left → right.
    const perStream = Math.max(1, Math.floor(total / STREAMS));
    const t = Math.floor(i / STREAMS) / perStream;
    const x = (t - 0.5) * 900;
    const streamBase = (stream - (STREAMS - 1) / 2) * 90;
    const y =
      streamBase + Math.sin(t * Math.PI * 4 + time * 0.5 + stream) * 35;
    const z = Math.cos(t * Math.PI * 3 + time * 0.3 + stream * 0.7) * 120;
    return new THREE.Vector3(x, y, z);
  },
  // Stack: crystalline lattice
  stack: (i, total, time) => {
    const gridSize = Math.ceil(Math.cbrt(total));
    const x = (i % gridSize) - gridSize / 2;
    const y = (Math.floor(i / gridSize) % gridSize) - gridSize / 2;
    const z = Math.floor(i / (gridSize * gridSize)) - gridSize / 2;
    const breathe = Math.sin(time * 0.2 + i * 0.1) * 5;
    return new THREE.Vector3(
      x * 75 + breathe,
      y * 75 + breathe,
      z * 75 + breathe
    );
  },
  // Contact: converge to a focal point
  contact: (i, total, time) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / total);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 60 + Math.sin(i * 1.2 + time * 0.5) * 30;
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  },
};

// ─── Neuron shader ───────────────────────────────────────────────────────────

const neuronVertexShader = `
  attribute float aPhase;
  attribute float aActivation;
  attribute float aScale;

  varying float vPhase;
  varying float vActivation;
  varying float vDistToCamera;

  void main() {
    vPhase = aPhase;
    vActivation = aActivation;

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position * aScale, 1.0);
    vDistToCamera = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const neuronFragmentShader = `
  uniform float uTime;
  varying float vPhase;
  varying float vActivation;
  varying float vDistToCamera;

  void main() {
    float pulse = sin(uTime * 1.5 + vPhase) * 0.3 + 0.7;
    float glow = pulse * (0.3 + vActivation * 0.7);

    // Emerald to cyan gradient based on activation
    vec3 baseColor = mix(
      vec3(0.43, 0.9, 0.72),   // #6ee7b7
      vec3(0.13, 0.83, 0.93),  // #22d3ee
      vActivation
    );

    // Depth fade
    float depthFade = smoothstep(800.0, 200.0, vDistToCamera);

    vec3 color = baseColor * glow;
    float alpha = glow * depthFade * 0.85;

    gl_FragColor = vec4(color, alpha);
  }
`;

// ─── Connection line shader ──────────────────────────────────────────────────

const lineVertexShader = `
  attribute float aLineAlpha;
  varying float vAlpha;
  varying float vDistToCamera;

  void main() {
    vAlpha = aLineAlpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vDistToCamera = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const lineFragmentShader = `
  uniform float uTime;
  varying float vAlpha;
  varying float vDistToCamera;

  void main() {
    float depthFade = smoothstep(800.0, 100.0, vDistToCamera);
    vec3 color = vec3(0.43, 0.9, 0.72);
    float alpha = vAlpha * depthFade * 0.12;
    gl_FragColor = vec4(color, alpha);
  }
`;

// ─── Flow particle shader ────────────────────────────────────────────────────

const particleVertexShader = `
  attribute float aParticleAlpha;
  attribute float aParticleSize;
  varying float vPAlpha;

  void main() {
    vPAlpha = aParticleAlpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aParticleSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  varying float vPAlpha;

  void main() {
    // Soft circle
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float soft = 1.0 - smoothstep(0.2, 0.5, d);
    vec3 color = vec3(0.9, 1.0, 0.95);
    gl_FragColor = vec4(color, soft * vPAlpha * 0.9);
  }
`;

// ─── Utility ─────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Whether the bloom post-processing pass should run. Delegates the capability
 * decision to the coordination layer's performance tier (which already folds in
 * `navigator.hardwareConcurrency`) and disables bloom entirely under reduced
 * motion. A narrow-viewport check is kept to spare small screens the extra pass.
 */
function shouldEnableBloom(reducedMotion: boolean, tier: Tier): boolean {
  if (typeof window === "undefined") return false;
  if (reducedMotion) return false;
  const isMobile = window.innerWidth < 768 || tier === "minimal";
  return !isMobile;
}

/**
 * Whether the visitor's device/connection asks us to conserve power or data
 * (e.g. Data Saver enabled). In that case the galaxy renders a single static
 * frame instead of a continuous loop, saving battery on constrained devices.
 */
function prefersLowPower(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
  return !!conn?.saveData;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NeuralMeshBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, ndcX: 0, ndcY: 0 });
  const scrollRef = useRef(0);

  // Coordination-layer signals. The visual pipeline below is unchanged; these
  // only drive the numeric decisions (element count), the loop lifecycle
  // (visibility pause/resume, reduced-motion static frame), and the init
  // fallback.
  const reducedMotion = useReducedMotion();
  const tabVisible = useTabVisibility();

  // The scene is built for the device's initial capability tier, captured once,
  // so live performance-governor tier changes never trigger a full three.js
  // scene rebuild (which would stutter exactly when the device is struggling).
  const [buildTier] = useState<Tier>(() =>
    typeof navigator !== "undefined"
      ? tierFor(navigator.hardwareConcurrency ?? 8)
      : "full",
  );

  // Drive the mouse ref from the coordination layer's shared, throttled pointer
  // broadcaster instead of a private `mousemove` listener.
  usePointerBroadcast(({ x, y }) => {
    if (typeof window === "undefined") return;
    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.ndcX = (x / window.innerWidth) * 2 - 1;
    mouseRef.current.ndcY = -(y / window.innerHeight) * 2 + 1;
  });

  // Whether WebGL/canvas init failed; when true we render an empty aria-hidden
  // container so the rest of the page stays fully interactive.
  const [initFailed, setInitFailed] = useState(false);

  // Live handles into the running scene so the visibility effect can pause and
  // resume the shared render loop without tearing down and rebuilding the scene.
  const pauseLoopRef = useRef<(() => void) | null>(null);
  const resumeLoopRef = useRef<(() => void) | null>(null);
  // Kept current so the running loop can read the latest visibility each frame.
  const tabVisibleRef = useRef(tabVisible);
  tabVisibleRef.current = tabVisible;

  // -------------------------------------------------------------------------
  // Build (and rebuild) the scene when the element count or motion preference
  // changes. Visibility is handled separately so it never rebuilds the scene.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Config (numeric decisions delegated to the coordination layer) ──
    const cores =
      typeof navigator !== "undefined"
        ? navigator.hardwareConcurrency ?? 0
        : 0;
    const nodeCount = computeElementCount(
      buildTier,
      cores,
      NODE_COUNT_FULL,
    );
    const staticMode = reducedMotion || prefersLowPower();
    const enableBloom = shouldEnableBloom(staticMode, buildTier);

    // Resources are tracked as they are created so a failure mid-setup can
    // dispose only what actually got allocated (Req 7.5).
    const partial: {
      renderer: THREE.WebGLRenderer | null;
      composer: EffectComposer | null;
      scene: THREE.Scene | null;
    } = { renderer: null, composer: null, scene: null };

    const disposePartial = () => {
      partial.scene?.traverse((obj) => {
        if (
          obj instanceof THREE.Mesh ||
          obj instanceof THREE.LineSegments ||
          obj instanceof THREE.Points
        ) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      partial.composer?.dispose();
      partial.renderer?.dispose();
      if (
        partial.renderer &&
        container.contains(partial.renderer.domElement)
      ) {
        container.removeChild(partial.renderer.domElement);
      }
    };

    // Assigned inside the try so React can register it as the effect cleanup.
    let cleanup: (() => void) | null = null;

    try {
      const pixelRatio = Math.min(window.devicePixelRatio, enableBloom ? 1.5 : 1.0);

    // ── Scene setup ──
    const scene = new THREE.Scene();
    partial.scene = scene;
    scene.fog = new THREE.FogExp2(0x050508, 0.0018);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 0, 500);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    partial.renderer = renderer;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050508, 1);
    container.appendChild(renderer.domElement);

    // ── Post-processing ──
    let composer: EffectComposer | null = null;
    if (enableBloom) {
      composer = new EffectComposer(renderer);
      partial.composer = composer;
      composer.addPass(new RenderPass(scene, camera));
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth * 0.5, window.innerHeight * 0.5),
        0.3,  // strength
        0.8,  // radius
        0.3   // threshold
      );
      composer.addPass(bloomPass);
    }

    // ── Neurons (InstancedMesh) ──
    const sphereGeo = new THREE.SphereGeometry(3, 12, 8);
    const neuronMaterial = new THREE.ShaderMaterial({
      vertexShader: neuronVertexShader,
      fragmentShader: neuronFragmentShader,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const neuronMesh = new THREE.InstancedMesh(sphereGeo, neuronMaterial, nodeCount);
    neuronMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // Per-instance attributes
    const phases = new Float32Array(nodeCount);
    const activations = new Float32Array(nodeCount);
    const scales = new Float32Array(nodeCount);

    for (let i = 0; i < nodeCount; i++) {
      phases[i] = Math.random() * Math.PI * 2;
      activations[i] = 0;
      scales[i] = 0.6 + Math.random() * 0.8;
    }

    sphereGeo.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phases, 1));
    sphereGeo.setAttribute("aActivation", new THREE.InstancedBufferAttribute(activations, 1));
    sphereGeo.setAttribute("aScale", new THREE.InstancedBufferAttribute(scales, 1));

    scene.add(neuronMesh);

    // Node positions (world space, used for connections + topology)
    const nodePositions: THREE.Vector3[] = [];
    const nodeTargets: THREE.Vector3[] = [];
    const dummy = new THREE.Matrix4();

    for (let i = 0; i < nodeCount; i++) {
      const pos = topologies.hero(i, nodeCount, 0);
      nodePositions.push(pos.clone());
      nodeTargets.push(pos.clone());
      dummy.makeTranslation(pos.x, pos.y, pos.z);
      neuronMesh.setMatrixAt(i, dummy);
    }
    neuronMesh.instanceMatrix.needsUpdate = true;

    // ── Connections (LineSegments) ──
    const maxConnections = nodeCount * K_NEIGHBORS;
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineAlphas = new Float32Array(maxConnections * 2);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute("aLineAlpha", new THREE.BufferAttribute(lineAlphas, 1));

    const lineMaterial = new THREE.ShaderMaterial({
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(lineGeo, lineMaterial);
    scene.add(lines);

    // Connection index pairs (recalculated periodically). A uniform spatial
    // hash grid keeps this near-linear instead of O(n^2): each node only
    // compares against nodes in its own and adjacent grid cells.
    let connections: [number, number][] = [];
    const GRID_CELL = 90; // ≈ neighbor search window; a node scans a 3×3×3 block

    function recalcConnections() {
      connections = [];

      // Bucket every node into a grid cell keyed by quantized position.
      const grid = new Map<string, number[]>();
      const cellKey = (x: number, y: number, z: number) =>
        `${Math.floor(x / GRID_CELL)},${Math.floor(y / GRID_CELL)},${Math.floor(z / GRID_CELL)}`;
      for (let i = 0; i < nodeCount; i++) {
        const p = nodePositions[i];
        const k = cellKey(p.x, p.y, p.z);
        const bucket = grid.get(k);
        if (bucket) bucket.push(i);
        else grid.set(k, [i]);
      }

      for (let i = 0; i < nodeCount; i++) {
        const p = nodePositions[i];
        const cx = Math.floor(p.x / GRID_CELL);
        const cy = Math.floor(p.y / GRID_CELL);
        const cz = Math.floor(p.z / GRID_CELL);

        // Gather candidates from the 27 neighbouring cells.
        const candidates: { idx: number; dist: number }[] = [];
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            for (let oz = -1; oz <= 1; oz++) {
              const bucket = grid.get(`${cx + ox},${cy + oy},${cz + oz}`);
              if (!bucket) continue;
              for (const j of bucket) {
                if (j === i) continue;
                candidates.push({
                  idx: j,
                  dist: p.distanceToSquared(nodePositions[j]),
                });
              }
            }
          }
        }

        candidates.sort((a, b) => a.dist - b.dist);
        for (let k = 0; k < Math.min(K_NEIGHBORS, candidates.length); k++) {
          const j = candidates[k].idx;
          // Avoid duplicate pairs (same semantics as the previous O(n^2) pass).
          if (j > i) {
            connections.push([i, j]);
          }
        }
      }
    }
    recalcConnections();

    // ── Flow particles ──
    const particleCount = enableBloom ? PARTICLE_COUNT : Math.floor(PARTICLE_COUNT * 0.5);
    const particlePositions = new Float32Array(particleCount * 3);
    const particleAlphas = new Float32Array(particleCount);
    const particleSizes = new Float32Array(particleCount);
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage));
    particleGeo.setAttribute("aParticleAlpha", new THREE.BufferAttribute(particleAlphas, 1).setUsage(THREE.DynamicDrawUsage));
    particleGeo.setAttribute("aParticleSize", new THREE.BufferAttribute(particleSizes, 1).setUsage(THREE.DynamicDrawUsage));

    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particles);

    // Each particle travels along a connection
    interface FlowParticle {
      connectionIdx: number;
      t: number; // 0-1 along connection
      speed: number;
      size: number;
    }

    const flowParticles: FlowParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      flowParticles.push({
        connectionIdx: Math.floor(Math.random() * Math.max(1, connections.length)),
        t: Math.random(),
        speed: 0.003 + Math.random() * 0.008,
        size: 2 + Math.random() * 3,
      });
    }

    // ── Mouse interaction plane ──
    const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();
    const mouseWorld = new THREE.Vector3();

    // ── Scroll / section detection ──
    let smoothScroll = 0;
    const sectionKeys = ["hero", "work", "story", "stack", "contact"];

    function getCurrentTopologyBlend(): { from: string; to: string; t: number } {
      const s = smoothScroll;
      const segmentSize = 1 / (sectionKeys.length - 1);
      const idx = Math.min(Math.floor(s / segmentSize), sectionKeys.length - 2);
      const localT = (s - idx * segmentSize) / segmentSize;
      return {
        from: sectionKeys[idx],
        to: sectionKeys[idx + 1],
        t: Math.max(0, Math.min(1, localT)),
      };
    }

    // ── Event handlers ──
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll(); // initial

    // ── Animation loop ──
    let frameCount = 0;
    let rafId: number | null = null;

    const tick = (time: number) => {
      const t = time * 0.001; // seconds
      frameCount++;

      // Smooth scroll lerp
      smoothScroll = lerp(smoothScroll, scrollRef.current, 0.04);

      // ── Update topology targets ──
      const blend = getCurrentTopologyBlend();
      const fromFn = topologies[blend.from];
      const toFn = topologies[blend.to];
      const blendT = blend.t * blend.t * (3 - 2 * blend.t); // smoothstep

      for (let i = 0; i < nodeCount; i++) {
        const fromPos = fromFn(i, nodeCount, t);
        const toPos = toFn(i, nodeCount, t);
        nodeTargets[i].lerpVectors(fromPos, toPos, blendT);
      }

      // ── Lerp node positions toward targets ──
      for (let i = 0; i < nodeCount; i++) {
        nodePositions[i].lerp(nodeTargets[i], 0.03);
      }

      // ── Mouse world position via raycaster ──
      raycaster.setFromCamera(
        new THREE.Vector2(mouseRef.current.ndcX, mouseRef.current.ndcY),
        camera
      );
      raycaster.ray.intersectPlane(mousePlane, mouseWorld);

      // ── Update activations (mouse proximity + ripple) ──
      // First pass: direct proximity
      const activationHops = new Float32Array(nodeCount);
      for (let i = 0; i < nodeCount; i++) {
        const screenPos = nodePositions[i].clone().project(camera);
        const screenX = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        const screenY = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;
        const dx = screenX - mouseRef.current.x;
        const dy = screenY - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_INFLUENCE_RADIUS) {
          const proximity = 1 - dist / MOUSE_INFLUENCE_RADIUS;
          activationHops[i] = Math.max(activationHops[i], proximity);
        }
      }

      // Ripple cascade through connections (simplified: 1 hop per frame check)
      for (let hop = 0; hop < RIPPLE_HOPS; hop++) {
        const decay = 1 - (hop + 1) / (RIPPLE_HOPS + 1);
        for (const [a, b] of connections) {
          if (activationHops[a] > 0.1 && activationHops[b] < activationHops[a] * decay) {
            activationHops[b] = Math.max(activationHops[b], activationHops[a] * decay * 0.6);
          }
          if (activationHops[b] > 0.1 && activationHops[a] < activationHops[b] * decay) {
            activationHops[a] = Math.max(activationHops[a], activationHops[b] * decay * 0.6);
          }
        }
      }

      // Smooth activations
      for (let i = 0; i < nodeCount; i++) {
        activations[i] = lerp(activations[i], activationHops[i], 0.08);
      }

      // ── Update instance matrices ──
      for (let i = 0; i < nodeCount; i++) {
        const p = nodePositions[i];
        const s = scales[i] * (1 + activations[i] * 0.5);
        dummy.makeTranslation(p.x, p.y, p.z);
        dummy.scale(new THREE.Vector3(s, s, s));
        neuronMesh.setMatrixAt(i, dummy);
      }
      neuronMesh.instanceMatrix.needsUpdate = true;

      // Update shader attributes
      (sphereGeo.attributes.aActivation as THREE.InstancedBufferAttribute).needsUpdate = true;
      (sphereGeo.attributes.aScale as THREE.InstancedBufferAttribute).needsUpdate = true;

      // ── Recalculate connections periodically ──
      if (frameCount % CONNECTION_RECALC_INTERVAL === 0) {
        recalcConnections();
        // Reassign particles to valid connections
        for (const fp of flowParticles) {
          if (fp.connectionIdx >= connections.length) {
            fp.connectionIdx = Math.floor(Math.random() * Math.max(1, connections.length));
            fp.t = 0;
          }
        }
      }

      // ── Update connection lines ──
      let lineIdx = 0;
      for (let c = 0; c < connections.length && c < maxConnections; c++) {
        const [a, b] = connections[c];
        const pa = nodePositions[a];
        const pb = nodePositions[b];
        const baseIdx = c * 6;

        linePositions[baseIdx] = pa.x;
        linePositions[baseIdx + 1] = pa.y;
        linePositions[baseIdx + 2] = pa.z;
        linePositions[baseIdx + 3] = pb.x;
        linePositions[baseIdx + 4] = pb.y;
        linePositions[baseIdx + 5] = pb.z;

        // Alpha based on activation of endpoints
        const avgActivation = (activations[a] + activations[b]) * 0.5;
        const alpha = 0.3 + avgActivation * 2.0;
        lineAlphas[c * 2] = alpha;
        lineAlphas[c * 2 + 1] = alpha;
        lineIdx = c + 1;
      }
      lineGeo.setDrawRange(0, lineIdx * 2);
      (lineGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (lineGeo.attributes.aLineAlpha as THREE.BufferAttribute).needsUpdate = true;

      // ── Update flow particles ──
      for (let i = 0; i < particleCount; i++) {
        const fp = flowParticles[i];
        fp.t += fp.speed;
        if (fp.t >= 1) {
          fp.t = 0;
          fp.connectionIdx = Math.floor(Math.random() * Math.max(1, connections.length));
        }

        if (fp.connectionIdx < connections.length) {
          const [a, b] = connections[fp.connectionIdx];
          const pa = nodePositions[a];
          const pb = nodePositions[b];
          particlePositions[i * 3] = lerp(pa.x, pb.x, fp.t);
          particlePositions[i * 3 + 1] = lerp(pa.y, pb.y, fp.t);
          particlePositions[i * 3 + 2] = lerp(pa.z, pb.z, fp.t);
          // Brightest in the middle of the journey
          const travelAlpha = Math.sin(fp.t * Math.PI);
          particleAlphas[i] = travelAlpha * 0.8;
          particleSizes[i] = fp.size;
        } else {
          particleAlphas[i] = 0;
        }
      }
      (particleGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (particleGeo.attributes.aParticleAlpha as THREE.BufferAttribute).needsUpdate = true;
      (particleGeo.attributes.aParticleSize as THREE.BufferAttribute).needsUpdate = true;

      // ── Camera parallax ──
      const camTargetX = mouseRef.current.ndcX * 30;
      const camTargetY = mouseRef.current.ndcY * 20;
      camera.position.x = lerp(camera.position.x, camTargetX, 0.02);
      camera.position.y = lerp(camera.position.y, camTargetY, 0.02);
      camera.lookAt(0, 0, 0);

      // ── Uniforms ──
      neuronMaterial.uniforms.uTime.value = t;
      lineMaterial.uniforms.uTime.value = t;

      // ── Render ──
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      // Reschedule only while motion is allowed and the tab is visible. Under
      // reduced motion or low-power mode this renders exactly one static frame
      // (no reschedule); when the tab is hidden the loop stops within a frame.
      if (!staticMode && tabVisibleRef.current) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    // Start/stop helpers exposed to the visibility effect so it can pause and
    // resume the shared loop without tearing down and rebuilding the scene.
    const startLoop = () => {
      if (rafId === null && !staticMode && tabVisibleRef.current) {
        rafId = requestAnimationFrame(tick);
      }
    };
    const stopLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
    pauseLoopRef.current = stopLoop;
    resumeLoopRef.current = startLoop;

    // Kick off. Under reduced motion the single frame above draws once and does
    // not schedule further frames; otherwise the continuous loop begins.
    rafId = requestAnimationFrame(tick);

    // ── Cleanup ──
    cleanup = () => {
      stopLoop();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      pauseLoopRef.current = null;
      resumeLoopRef.current = null;
      disposePartial();
    };

      return cleanup;
    } catch (error) {
      // WebGL/canvas init failed: dispose whatever was allocated and fall back
      // to an empty aria-hidden container so the page stays fully interactive.
      disposePartial();
      pauseLoopRef.current = null;
      resumeLoopRef.current = null;
      if (process.env.NODE_ENV !== "production") {
        console.error("NeuralMeshBackground: WebGL init failed", error);
      }
      setInitFailed(true);
      return;
    }
  }, [reducedMotion, buildTier]);

  // Pause/resume the running loop on tab-visibility changes without rebuilding
  // the scene. Under reduced motion / low-power there is no continuous loop.
  useEffect(() => {
    if (reducedMotion || prefersLowPower()) return;
    if (tabVisible) {
      resumeLoopRef.current?.();
    } else {
      pauseLoopRef.current?.();
    }
  }, [tabVisible, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: initFailed ? 0 : 0.35 }}
      aria-hidden="true"
    />
  );
}
