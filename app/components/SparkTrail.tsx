"use client";

/**
 * SparkTrail — short-lived spark particles spawned when the pointer moves fast.
 *
 * Refactored onto the immersive coordination layer (task 12.2): it subscribes to
 * the shared pointer broadcaster instead of its own `mousemove` listener and
 * registers with the pointer-effect registry (lowest follower priority, so it
 * is shed first under the cap/governor). It emits no sparks on a coarse pointer
 * or under reduced motion (Req 4.2, 4.7).
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

/** Registry id and priority (lowest of the continuous pointer followers). */
const EFFECT_ID = "spark-trail";
const EFFECT_PRIORITY = 20;

export function SparkTrail() {
  const pointerType = usePointerCapability();
  const reducedMotion = useReducedMotion();
  const { registerPointerEffect, isPointerEffectActive } =
    useImmersiveContext();

  const lastPos = useRef({ x: -100, y: -100, time: 0 });
  // Track live spark elements so we can clean them up on unmount.
  const sparks = useRef(new Set<HTMLElement>());

  // Sparks only make sense on a fine pointer with motion allowed.
  const eligible = pointerType === "fine" && !reducedMotion;

  useEffect(() => {
    if (!eligible) return;
    return registerPointerEffect(EFFECT_ID, EFFECT_PRIORITY, "trail");
  }, [eligible, registerPointerEffect]);

  const active = eligible && isPointerEffectActive(EFFECT_ID);

  // Subscribe to the shared, throttled pointer broadcaster (Req 4.1, 7.3).
  usePointerBroadcast((position: PointerPosition) => {
    if (!active) return;

    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const dx = position.x - lastPos.current.x;
    const dy = position.y - lastPos.current.y;
    const dt = now - lastPos.current.time;
    const speed = dt > 0 ? Math.sqrt(dx * dx + dy * dy) / dt : 0;

    lastPos.current = { x: position.x, y: position.y, time: now };

    // Spawn sparks only when moving fast.
    if (speed > 0.8) {
      const count = Math.min(Math.floor(speed * 2), 5);
      for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.className = "spark-particle";
        el.setAttribute("aria-hidden", "true");
        el.style.left = `${position.x + (Math.random() - 0.5) * 12}px`;
        el.style.top = `${position.y + (Math.random() - 0.5) * 12}px`;
        el.style.width = `${1 + Math.random() * 3}px`;
        el.style.height = el.style.width;
        document.body.appendChild(el);
        sparks.current.add(el);
        setTimeout(() => {
          el.remove();
          sparks.current.delete(el);
        }, 600);
      }
    }
  });

  // Remove any lingering spark elements when the component unmounts.
  useEffect(() => {
    const live = sparks.current;
    return () => {
      for (const el of live) el.remove();
      live.clear();
    };
  }, []);

  return null;
}
