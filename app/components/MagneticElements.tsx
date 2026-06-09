"use client";

import { useEffect, useRef } from "react";

interface Orb {
  el: HTMLDivElement;
  baseX: number;
  baseY: number;
  size: number;
  speed: number;
}

export function MagneticElements() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbs = useRef<Orb[]>([]);
  const mouse = useRef({ x: -500, y: -500 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create decorative floating dots
    const count = 6;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "absolute rounded-full pointer-events-none";
      const size = 2 + Math.random() * 4;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.background = i % 2 === 0
        ? "rgba(110, 231, 183, 0.25)"
        : "rgba(52, 211, 153, 0.2)";
      el.style.boxShadow = i % 2 === 0
        ? "0 0 6px rgba(110, 231, 183, 0.15)"
        : "0 0 6px rgba(52, 211, 153, 0.1)";
      container.appendChild(el);

      orbs.current.push({
        el,
        baseX: Math.random() * 100,
        baseY: Math.random() * 100,
        size,
        speed: 0.02 + Math.random() * 0.04,
      });
    }

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf: number;
    const tick = () => {
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const w = window.innerWidth;
      const h = window.innerHeight;

      for (const orb of orbs.current) {
        const ox = (orb.baseX / 100) * w;
        const oy = (orb.baseY / 100) * h;
        const dx = mx - ox;
        const dy = my - oy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 300;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 40;
          const angle = Math.atan2(dy, dx);
          const repelX = ox - Math.cos(angle) * force;
          const repelY = oy - Math.sin(angle) * force;
          orb.el.style.transform = `translate(${repelX}px, ${repelY}px)`;
          orb.el.style.opacity = `${0.4 + (1 - dist / maxDist) * 0.6}`;
        } else {
          orb.el.style.transform = `translate(${ox}px, ${oy}px)`;
          orb.el.style.opacity = "0.4";
        }
        orb.el.style.transition = "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease";
      }

      // Slow drift
      for (const orb of orbs.current) {
        orb.baseX += (Math.sin(Date.now() * 0.0003 * orb.speed) * 0.02);
        orb.baseY += (Math.cos(Date.now() * 0.0004 * orb.speed) * 0.02);
        orb.baseX = Math.max(5, Math.min(95, orb.baseX));
        orb.baseY = Math.max(5, Math.min(95, orb.baseY));
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      for (const orb of orbs.current) {
        if (container.contains(orb.el)) container.removeChild(orb.el);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
