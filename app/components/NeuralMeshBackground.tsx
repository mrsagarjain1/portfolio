"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const NODE_COUNT_FULL = 500;
const NODE_COUNT_MOBILE = 80;
const NODE_COUNT_REDUCED = 50;
const PARTICLE_COUNT = 150;
const K_NEIGHBORS = 3;
const CONNECTION_RECALC_INTERVAL = 10;
const MOUSE_INFLUENCE_RADIUS = 250;
const RIPPLE_HOPS = 3;
const RIPPLE_DELAY = 0.1; // seconds per hop
const VOLUME = { x: 900, y: 600, z: 400 };

// ─── Topology presets (scroll-driven) ────────────────────────────────────────

type TopologyFn = (i: number, total: number, time: number) => THREE.Vector3;

const topologies: Record<string, TopologyFn> = {
  // Hero: dense central cluster
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
  // Story: organic flowing rivers
  story: (i, total, time) => {
    const t = i / total;
    const stream = Math.floor(Math.random() * 1000 + i) % 5;
    const streamOffset = (stream - 2) * 100;
    return new THREE.Vector3(
      (t - 0.5) * 800 + Math.sin(t * 6 + time * 0.2 + stream) * 60,
      streamOffset + Math.sin(t * 4 + time * 0.3) * 80,
      Math.cos(t * 3 + time * 0.15 + stream * 0.5) * 150
    );
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
  // Contact: converge to focal point
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

function getNodeCount(): number {
  if (typeof window === "undefined") return NODE_COUNT_FULL;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return NODE_COUNT_REDUCED;
  const isMobile = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  if (isMobile) return NODE_COUNT_MOBILE;
  return NODE_COUNT_FULL;
}

function shouldEnableBloom(): boolean {
  if (typeof window === "undefined") return false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return false;
  const isMobile = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  return !isMobile;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NeuralMeshBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, ndcX: 0, ndcY: 0 });
  const scrollRef = useRef(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  const init = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Config ──
    const nodeCount = getNodeCount();
    const enableBloom = shouldEnableBloom();
    const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pixelRatio = Math.min(window.devicePixelRatio, enableBloom ? 1.5 : 1.0);

    // ── Scene setup ──
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.0018);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 0, 500);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050508, 1);
    container.appendChild(renderer.domElement);

    // ── Post-processing ──
    let composer: EffectComposer | null = null;
    if (enableBloom) {
      composer = new EffectComposer(renderer);
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

    // Connection index pairs (recalculated periodically)
    let connections: [number, number][] = [];

    function recalcConnections() {
      connections = [];
      for (let i = 0; i < nodeCount; i++) {
        // Find k nearest neighbors
        const distances: { idx: number; dist: number }[] = [];
        for (let j = 0; j < nodeCount; j++) {
          if (i === j) continue;
          const dist = nodePositions[i].distanceToSquared(nodePositions[j]);
          distances.push({ idx: j, dist });
        }
        distances.sort((a, b) => a.dist - b.dist);
        for (let k = 0; k < Math.min(K_NEIGHBORS, distances.length); k++) {
          const j = distances[k].idx;
          // Avoid duplicate pairs
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
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

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

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll(); // initial

    // ── Animation loop ──
    let frameCount = 0;
    let rafId: number;

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

      if (!reducedMotion) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    // If reduced motion, render one frame then stop
    if (reducedMotion) {
      // The first RAF will fire, render once, and not schedule another
    }

    // ── Cleanup ──
    const cleanup = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Points) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (composer) composer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    cleanupRef.current = cleanup;
    return cleanup;
  }, []);

  useEffect(() => {
    const cleanup = init();
    return () => {
      if (cleanup) cleanup();
      else if (cleanupRef.current) cleanupRef.current();
    };
  }, [init]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.35 }}
      aria-hidden="true"
    />
  );
}
