"use client";

/**
 * MouseTrail — a canvas particle trail that follows the pointer.
 *
 * Refactored onto the immersive coordination layer (task 12.2): instead of its
 * own `mousemove` listener it subscribes to the shared pointer broadcaster, and
 * it registers with the pointer-effect registry so the cap/governor can shed it
 * under load. It renders `null` on a coarse pointer and disables trailing under
 * reduced motion.
 *
 * _Requirements: 4.1, 4.2, 4.7, 7.2, 7.3_
 */

import { useEffect, useRef } from "react";

import { usePointerBroadcast } from "../hooks/usePointerBroadcast";
import { usePointerCapability } from "../hooks/usePointerCapability";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  useImmersiveContext,
  type PointerPosition,
} from "./immersive/ImmersiveProvider";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

/** Registry id and priority (below cursor/glow/magnetic, above SparkTrail). */
const EFFECT_ID = "mouse-trail";
const EFFECT_PRIORITY = 40;
/** Newest-wins particle cap (mirrors the previous `.slice(-80)` behavior). */
const MAX_PARTICLES = 80;

export function MouseTrail() {
  const pointerType = usePointerCapability();
  const reducedMotion = useReducedMotion();
  const { registerPointerEffect, isPointerEffectActive } =
    useImmersiveContext();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -100, y: -100 });
  const prev = useRef({ x: -100, y: -100 });

  // Trailing only makes sense on a fine pointer with motion allowed.
  const eligible = pointerType === "fine" && !reducedMotion;

  // Register with the pointer-effect registry while eligible so the shared cap
  // (and the performance governor's tier) can deactivate this follower first.
  useEffect(() => {
    if (!eligible) return;
    return registerPointerEffect(EFFECT_ID, EFFECT_PRIORITY, "trail");
  }, [eligible, registerPointerEffect]);

  const active = eligible && isPointerEffectActive(EFFECT_ID);

  // Track pointer position via the shared broadcaster (throttled to one
  // notification per animation frame by the provider — Req 7.3).
  usePointerBroadcast((position: PointerPosition) => {
    prev.current = { ...mouse.current };
    mouse.current = { x: position.x, y: position.y };
  });

  useEffect(() => {
    if (!active) return;
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

    let rafId = 0;
    const tick = () => {
      // Spawn particles along the movement path.
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

      // Render.
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
      particles.current = alive.slice(-MAX_PARTICLES); // cap newest-wins

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
      particles.current = [];
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9997]"
    />
  );
}
