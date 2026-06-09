"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -100, y: -100 });
  const prev = useRef({ x: -100, y: -100 });

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
      prev.current = { ...mouse.current };
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      // Spawn particles along the movement path
      const dx = mouse.current.x - prev.current.x;
      const dy = mouse.current.y - prev.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1 && mouse.current.x > 0) {
        const steps = Math.min(Math.floor(dist / 4), 3);
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          particles.current.push({
            x: prev.current.x + dx * t + (Math.random() - 0.5) * 6,
            y: prev.current.y + dy * t + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6 - 0.4,
            life: 0,
            maxLife: 30 + Math.random() * 40,
            size: 1 + Math.random() * 2.5,
          });
        }
      }
      prev.current = { ...mouse.current };

      // Render
      ctx.clearRect(0, 0, w, h);
      const alive: Particle[] = [];
      for (const p of particles.current) {
        p.life++;
        if (p.life >= p.maxLife) continue;
        const progress = p.life / p.maxLife;
        const alpha = 1 - progress;
        const s = p.size * (1 - progress * 0.5);

        ctx.beginPath();
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(110, 231, 183, ${alpha * 0.5})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        alive.push(p);
      }
      particles.current = alive.slice(-80); // cap

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
      className="fixed inset-0 pointer-events-none z-[9997]"
    />
  );
}
