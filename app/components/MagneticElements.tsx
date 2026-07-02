"use client";

import { useEffect, useRef } from "react";

import { useFrameClock } from "../hooks/useFrameClock";
import { usePointerBroadcast } from "../hooks/usePointerBroadcast";
import { usePointerCapability } from "../hooks/usePointerCapability";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SETTLE_MS } from "../lib/immersive/constants";
import { clampMagneticOffset } from "../lib/immersive/pointer";
import { useImmersiveContext } from "./immersive/ImmersiveProvider";

interface Orb {
  el: HTMLDivElement;
  baseX: number;
  baseY: number;
  size: number;
  speed: number;
}

/** Registry id and priority for this continuous pointer follower. */
const EFFECT_ID = "magnetic-elements";
/** Priority ordering (design): cursor > glow > magnetic > trail > spark. */
const EFFECT_PRIORITY = 30;
/** Pointer proximity (px) within which an orb is pulled toward the pointer. */
const INFLUENCE_RADIUS = 300;
/** Number of decorative orbs. */
const ORB_COUNT = 6;
/** Shared settle/return transition, bounded by the 500 ms rest budget. */
const SETTLE_TRANSITION = `transform ${SETTLE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${SETTLE_MS}ms ease`;

/**
 * MagneticElements — decorative orbs that are magnetically pulled toward the
 * pointer. Refactored to subscribe to the immersive coordination layer:
 *
 *  - reads the shared, throttled pointer broadcaster (one `mousemove` for the
 *    whole app, at most one update per frame) instead of its own listener;
 *  - registers as a `magnetic` continuous pointer effect so the registry can
 *    cap concurrent followers by priority and performance tier (Req 4.7, 7.3);
 *  - renders `null` on a coarse pointer and while reduced motion is preferred
 *    (Req 4.2, 7.2), and settles orbs to rest whenever it is disabled/capped;
 *  - routes every translation through {@link clampMagneticOffset} so an orb
 *    never moves more than 20 px from rest (Req 4.3) and returns to its resting
 *    position within `SETTLE_MS` (500 ms) once the pointer leaves (Req 4.4).
 *
 * _Requirements: 4.3, 4.4, 4.7, 7.2_
 */
export function MagneticElements() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbs = useRef<Orb[]>([]);
  const mouse = useRef({ x: -500, y: -500 });

  const pointerType = usePointerCapability();
  const reducedMotion = useReducedMotion();
  const { registerPointerEffect, isPointerEffectActive } =
    useImmersiveContext();

  // Gate on pointer capability and motion preference (Req 4.2, 4.7, 7.2).
  const enabled = pointerType === "fine" && !reducedMotion;
  // Under the concurrent-follower cap the registry may still shed this effect.
  const active = enabled && isPointerEffectActive(EFFECT_ID);
  const activeRef = useRef(active);
  activeRef.current = active;

  // Subscribe to the shared pointer broadcaster (replaces a local listener).
  usePointerBroadcast((position) => {
    mouse.current = { x: position.x, y: position.y };
  });

  // Register with the pointer-effect registry while enabled so the coordination
  // layer can cap concurrent continuous followers by priority/tier.
  useEffect(() => {
    if (!enabled) return;
    return registerPointerEffect(EFFECT_ID, EFFECT_PRIORITY, "magnetic");
  }, [enabled, registerPointerEffect]);

  // Create the decorative orbs once while enabled; clean them up on teardown.
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const created: Orb[] = [];
    for (let i = 0; i < ORB_COUNT; i++) {
      const el = document.createElement("div");
      el.className = "absolute rounded-full pointer-events-none";
      const size = 2 + Math.random() * 4;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.background =
        i % 2 === 0 ? "rgba(110, 231, 183, 0.25)" : "rgba(52, 211, 153, 0.2)";
      el.style.boxShadow =
        i % 2 === 0
          ? "0 0 6px rgba(110, 231, 183, 0.15)"
          : "0 0 6px rgba(52, 211, 153, 0.1)";
      el.style.transition = SETTLE_TRANSITION;
      container.appendChild(el);

      created.push({
        el,
        baseX: Math.random() * 100,
        baseY: Math.random() * 100,
        size,
        speed: 0.02 + Math.random() * 0.04,
      });
    }
    orbs.current = created;

    return () => {
      for (const orb of created) {
        if (container.contains(orb.el)) container.removeChild(orb.el);
      }
      orbs.current = [];
    };
  }, [enabled]);

  // Drive the orbs from the shared frame clock (one rAF loop for the whole app,
  // paused centrally when the tab is hidden).
  useFrameClock(() => {
    const list = orbs.current;
    if (list.length === 0) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // When inactive (capped or disabled mid-loop) settle every orb to rest.
    if (!activeRef.current) {
      for (const orb of list) {
        const ox = (orb.baseX / 100) * w;
        const oy = (orb.baseY / 100) * h;
        orb.el.style.transition = SETTLE_TRANSITION;
        orb.el.style.transform = `translate(${ox}px, ${oy}px)`;
        orb.el.style.opacity = "0.4";
      }
      return;
    }

    const mx = mouse.current.x;
    const my = mouse.current.y;

    for (const orb of list) {
      const ox = (orb.baseX / 100) * w;
      const oy = (orb.baseY / 100) * h;
      const dx = mx - ox;
      const dy = my - oy;
      const dist = Math.hypot(dx, dy);

      orb.el.style.transition = SETTLE_TRANSITION;

      if (dist < INFLUENCE_RADIUS) {
        // Pull the orb toward the pointer, bounded to <= 20 px (Req 4.3).
        const falloff = 1 - dist / INFLUENCE_RADIUS;
        const { x: offX, y: offY } = clampMagneticOffset(
          dx * falloff,
          dy * falloff,
        );
        orb.el.style.transform = `translate(${ox + offX}px, ${oy + offY}px)`;
        orb.el.style.opacity = `${0.4 + falloff * 0.6}`;
      } else {
        // Beyond the influence radius the orb rests at its base position; the
        // SETTLE_MS transition returns it within the 500 ms budget (Req 4.4).
        orb.el.style.transform = `translate(${ox}px, ${oy}px)`;
        orb.el.style.opacity = "0.4";
      }
    }

    // Slow ambient drift of the base positions.
    const now = Date.now();
    for (const orb of list) {
      orb.baseX += Math.sin(now * 0.0003 * orb.speed) * 0.02;
      orb.baseY += Math.cos(now * 0.0004 * orb.speed) * 0.02;
      orb.baseX = Math.max(5, Math.min(95, orb.baseX));
      orb.baseY = Math.max(5, Math.min(95, orb.baseY));
    }
  });

  // Omit cursor-following output entirely on coarse pointers / reduced motion
  // (Req 4.2, 4.7, 7.2).
  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
