"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "../hooks/useReducedMotion";
import { useTabVisibility } from "../hooks/useTabVisibility";

/** Two dots closer than this (in CSS pixels) are joined by a line. */
const LINK_DISTANCE = 150;
/** The animation redraws at most this often: 30 frames a second is plenty for a slow drift. */
const FRAME_MS = 1000 / 30;
const TAU = Math.PI * 2;

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/** More dots on bigger screens, never many: this is a quiet backdrop. */
export function dotCountFor(width: number, height: number): number {
  return Math.max(24, Math.min(70, Math.round((width * height) / 26000)));
}

function createDots(width: number, height: number): Dot[] {
  return Array.from({ length: dotCountFor(width, height) }, () => {
    const angle = Math.random() * TAU;
    const speed = 6 + Math.random() * 12; // pixels per second
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 1 + Math.random() * 1.4,
    };
  });
}

function step(dots: Dot[], dt: number, width: number, height: number) {
  for (const d of dots) {
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    if (d.x < -10) d.x = width + 10;
    else if (d.x > width + 10) d.x = -10;
    if (d.y < -10) d.y = height + 10;
    else if (d.y > height + 10) d.y = -10;
  }
}

/** Draw the links in three strength bands (one stroke each), then the dots. */
function draw(ctx: CanvasRenderingContext2D, dots: Dot[], width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  const bands: [number, number, number][] = [
    [0, 0.33, 0.07],
    [0.33, 0.66, 0.14],
    [0.66, 1.01, 0.24],
  ];
  const reach = LINK_DISTANCE * LINK_DISTANCE;

  ctx.lineWidth = 1;
  for (const [lo, hi, alpha] of bands) {
    ctx.strokeStyle = `rgba(110,231,183,${alpha})`;
    ctx.beginPath();
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 >= reach) continue;
        const strength = 1 - Math.sqrt(d2) / LINK_DISTANCE;
        if (strength < lo || strength >= hi) continue;
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
      }
    }
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(110,231,183,0.55)";
  ctx.beginPath();
  for (const d of dots) {
    ctx.moveTo(d.x + d.r, d.y);
    ctx.arc(d.x, d.y, d.r, 0, TAU);
  }
  ctx.fill();
}

/**
 * A quiet 2D network of drifting dots behind the page.
 *
 * Deliberately cheap: a plain 2D canvas, a few dozen dots, at most 30 frames a
 * second, no per-frame allocation, no pointer tracking and no blur or glow. It
 * draws one still frame under reduced motion, and stops entirely while the tab
 * is hidden. Decorative only: hidden from assistive technology and never
 * intercepts clicks.
 */
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const reducedMotion = useReducedMotion();
  const tabVisible = useTabVisibility();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const fit = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      dotsRef.current = createDots(width, height);
      draw(ctx, dotsRef.current, width, height);
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      step(dotsRef.current, dt, width, height);
      draw(ctx, dotsRef.current, width, height);
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fit, 150);
    };

    if (dotsRef.current.length === 0 || canvas.width !== window.innerWidth) {
      fit();
    } else {
      width = canvas.width;
      height = canvas.height;
      draw(ctx, dotsRef.current, width, height);
    }

    window.addEventListener("resize", onResize);
    if (!reducedMotion && tabVisible) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion, tabVisible]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      data-testid="ambient-background"
    />
  );
}
