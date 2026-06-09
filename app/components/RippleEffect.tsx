"use client";

import { useEffect, useRef } from "react";

export function RippleEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripples = useRef<{ x: number; y: number; r: number; life: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const onClick = (e: MouseEvent) => {
      ripples.current.push({ x: e.clientX, y: e.clientY, r: 0, life: 0 });
    };
    window.addEventListener("click", onClick);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const alive = [];
      for (const r of ripples.current) {
        r.life++;
        r.r += 4;
        const alpha = Math.max(0, 1 - r.life / 30);
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(110,231,183,${alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        if (r.life < 30) alive.push(r);
      }
      ripples.current = alive.slice(-10);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true" />
  );
}
