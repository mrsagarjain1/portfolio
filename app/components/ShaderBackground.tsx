"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.0 + shift; a *= 0.5; }
    return v;
  }
  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.15;
    vec2 mf = (uMouse - uv) * 0.08;
    float n1 = fbm(uv * 3.0 + vec2(t * 0.3, t * 0.2) + mf);
    float n2 = fbm(uv * 2.5 - vec2(t * 0.2, t * 0.35) - mf * 1.5);
    float n3 = fbm(uv * 4.0 + vec2(t * 0.15, t * 0.25) + mf * 0.7);
    float r = 0.02 / abs(n1 - n2 + 0.15);
    float g = 0.02 / abs(n2 - n3 + 0.15);
    float b = 0.01 / abs(n1 - n3 + 0.2);
    float cb = smoothstep(0.4, 0.0, length(uv - uMouse)) * 0.06;
    vec3 color = vec3(r * 0.08 + cb, g * 0.15 + cb * 0.7, b * 0.12 + cb * 0.5);
    color = mix(vec3(0.039, 0.039, 0.039), color, 0.5);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function ShaderBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX / window.innerWidth, y: 1.0 - e.clientY / window.innerHeight }; };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10); cam.position.z = 1;
    const uniforms = { uTime: { value: 0 }, uResolution: { value: new THREE.Vector2() }, uMouse: { value: new THREE.Vector2(0.5, 0.5) } };
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true }));
    scene.add(mesh);
    const r = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    r.setSize(window.innerWidth, window.innerHeight);
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    c.appendChild(r.domElement);
    const resize = () => { r.setSize(window.innerWidth, window.innerHeight); uniforms.uResolution.value.set(window.innerWidth, window.innerHeight); };
    window.addEventListener("resize", resize);
    let raf: number;
    const tick = (time: number) => { uniforms.uTime.value = time * 0.001; uniforms.uMouse.value.set(mouse.current.x, mouse.current.y); r.render(scene, cam); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); r.dispose(); if (c.contains(r.domElement)) c.removeChild(r.domElement); };
  }, []);
  return <div ref={ref} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.6 }} />;
}