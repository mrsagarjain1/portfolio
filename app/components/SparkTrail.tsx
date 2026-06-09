"use client";

import { useEffect, useRef } from "react";

export function SparkTrail() {
  const lastPos = useRef({ x: -100, y: -100, time: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dt = now - lastPos.current.time;
      const speed = dt > 0 ? Math.sqrt(dx * dx + dy * dy) / dt : 0;

      lastPos.current = { x: e.clientX, y: e.clientY, time: now };

      // Spawn sparks only when moving fast
      if (speed > 0.8) {
        const count = Math.min(Math.floor(speed * 2), 5);
        for (let i = 0; i < count; i++) {
          const el = document.createElement("div");
          el.className = "spark-particle";
          el.style.left = `${e.clientX + (Math.random() - 0.5) * 12}px`;
          el.style.top = `${e.clientY + (Math.random() - 0.5) * 12}px`;
          el.style.width = `${1 + Math.random() * 3}px`;
          el.style.height = el.style.width;
          document.body.appendChild(el);
          setTimeout(() => el.remove(), 600);
        }
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}
