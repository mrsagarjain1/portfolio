"use client";

/**
 * RippleEffect — a discrete pointer-down ripple that expands and fades from the
 * point of contact.
 *
 * Refactored onto the immersive coordination layer (task 12.4):
 *  - Ripple state is routed through {@link pushWithCap} with `MAX_RIPPLES` so at
 *    most 10 concurrent ripples exist, evicting the oldest first (Req 4.6).
 *  - Each ripple is removed within 1000 ms of creation via a timestamp-driven
 *    lifecycle, independent of frame rate (Req 4.5).
 *  - Animation is driven by the provider's shared frame clock rather than a
 *    private `requestAnimationFrame` loop, so the performance governor can
 *    pause/throttle it centrally.
 *  - Reduced motion is honored: because a ripple is inherently an animation, no
 *    ripples are spawned while the visitor prefers reduced motion, and any
 *    in-flight ripples are cleared (Req 1.x / 4.7).
 *
 * This is a discrete (pointer-down) effect, **not** a continuous pointer
 * follower, so it is intentionally EXEMPT from the pointer-follower cap and is
 * not registered with the pointer-effect registry (design.md "Pointer
 * Coordination and Capping"). It also renders on coarse pointers (touch taps
 * should ripple), unlike the cursor-following components.
 *
 * The canvas is decorative: `aria-hidden`, `pointer-events: none`.
 *
 * _Requirements: 4.5, 4.6_
 */

import { useCallback, useEffect, useRef } from "react";

import { useFrameClock } from "../hooks/useFrameClock";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { MAX_RIPPLES } from "../lib/immersive/constants";
import { pushWithCap } from "../lib/immersive/ripple";

/** A single ripple, tagged with its creation timestamp for a frame-rate-independent lifecycle. */
interface TimedRipple {
  x: number;
  y: number;
  /** Creation time (ms, shared time origin with rAF timestamps). */
  born: number;
}

/**
 * How long a ripple lives before removal, in ms. Kept comfortably under the
 * 1000 ms removal bound (Req 4.5) while preserving the original snappy feel.
 */
const RIPPLE_LIFETIME_MS = 600;

/** Radial expansion speed in px per ms (~240 px/s, matching the original look). */
const RIPPLE_SPEED_PX_PER_MS = 0.24;

export function RippleEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripples = useRef<TimedRipple[]>([]);
  const reducedMotion = useReducedMotion();

  // Keep the canvas sized to the viewport.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Spawn ripples on pointer-down, unless the visitor prefers reduced motion.
  useEffect(() => {
    if (reducedMotion) {
      // A ripple is an animation; suppress it and drop anything in flight.
      ripples.current = [];
      return;
    }

    const onPointerDown = (e: PointerEvent) => {
      ripples.current = pushWithCap(
        ripples.current,
        { x: e.clientX, y: e.clientY, born: performance.now() },
        MAX_RIPPLES,
      );
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [reducedMotion]);

  // Draw via the shared frame clock so the governor can throttle/pause centrally.
  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const alive: TimedRipple[] = [];
    for (const ripple of ripples.current) {
      const age = timestamp - ripple.born;
      // Remove within the lifetime bound (< 1000 ms). Guards against clock skew
      // (negative age) by keeping freshly-born ripples.
      if (age >= RIPPLE_LIFETIME_MS) continue;
      alive.push(ripple);

      const progress = Math.max(0, age) / RIPPLE_LIFETIME_MS;
      const radius = Math.max(0, age) * RIPPLE_SPEED_PX_PER_MS;
      const alpha = (1 - progress) * 0.5;

      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(110,231,183,${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ripples.current = alive;
  }, []);

  useFrameClock(draw);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden="true"
    />
  );
}
