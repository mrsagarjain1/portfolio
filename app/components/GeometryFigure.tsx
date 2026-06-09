"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function GeometryFigure() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    cam.position.z = 5;

    // Wireframe icosahedron
    const geo = new THREE.IcosahedronGeometry(0.65, 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x6ee7b7,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Inner icosahedron
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.4, 2),
      new THREE.MeshBasicMaterial({
        color: 0x34d399,
        wireframe: true,
        transparent: true,
        opacity: 0.04,
      })
    );
    scene.add(inner);

    const r = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    const size = 280;
    r.setSize(size, size);
    c.appendChild(r.domElement);

    let raf: number;
    const tick = () => {
      const mx = mouseRef.current.x * 0.3;
      const my = mouseRef.current.y * 0.3;
      mesh.rotation.x += 0.002;
      mesh.rotation.y += 0.003;
      mesh.rotation.x += (my - mesh.rotation.x) * 0.01;
      mesh.rotation.y += (mx - mesh.rotation.y) * 0.01;
      inner.rotation.x = mesh.rotation.x * 0.7;
      inner.rotation.y = mesh.rotation.y * 0.7;
      r.render(scene, cam);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      r.dispose();
      if (c.contains(r.domElement)) c.removeChild(r.domElement);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-70 pointer-events-none hidden lg:block"
      aria-hidden="true"
    />
  );
}
