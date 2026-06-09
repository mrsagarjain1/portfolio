"use client";

import { useEffect, useRef } from "react";

export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const spacing = 32;
    const radius = 1;

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let x = spacing; x < w; x += spacing) {
        for (let y = spacing; y < h; y += spacing) {
          const dx = mx - x;
          const dy = my - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120;

          let alpha = 0.08;
          let r = radius;
          if (dist < maxDist) {
            const factor = 1 - dist / maxDist;
            alpha = 0.08 + factor * 0.2;
            r = radius + factor * 2;
          }

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(110, 231, 183, ${alpha})`;
          ctx.fill();
        }
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
      aria-hidden="true"
    />
  );
}
