"use client";

import { ReactNode, useEffect, useRef } from "react";

import { useFrameClock } from "../hooks/useFrameClock";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { MAX_PARALLAX_PX, SETTLE_MS } from "../lib/immersive/constants";
import { computeParallaxOffset } from "../lib/immersive/scroll";

interface ScrollDepthProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

/** No scroll event for this long (ms) counts as "scroll idle" (Req 3.4). */
const SCROLL_IDLE_MS = 100;
/** Perspective depth applied to the tilt (preserves the original visual). */
const PERSPECTIVE_PX = 1200;
/** Speed factor feeding the bounded offset that drives the tilt. */
const DEPTH_SPEED = 0.15;
/** Ease-to-rest transition, bounded by the 500 ms settle budget (Req 3.4). */
const SETTLE_TRANSITION = `transform ${SETTLE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

/**
 * ScrollDepth — wraps content in a subtle scroll-driven depth tilt (rotateX).
 *
 * Refactored to subscribe to the immersive coordination layer and delegate its
 * numeric decision to the pure-logic module. The tilt is derived from a bounded
 * parallax offset:
 *
 *  - the driving offset is routed through {@link computeParallaxOffset}, so it
 *    is clamped to ±100 px; the tilt is a linear mapping of that bounded offset
 *    onto `[-strength, +strength]` degrees, so it can never exceed `strength`
 *    (Req 3.3);
 *  - it is driven by the shared frame clock rather than a per-instance scroll
 *    subscription (Req 7.3);
 *  - when no scroll event has occurred for ~100 ms it eases back to the flat
 *    resting position within `SETTLE_MS` (500 ms) via a CSS transition
 *    (Req 3.4);
 *  - while reduced motion is preferred it presents the child content flat, with
 *    no scroll-driven tilt (Req 3.5).
 *
 * The children are always rendered and remain visible; only the wrapper's
 * transform changes. The resting transform still carries `perspective` and
 * `preserve-3d` so nested 3D content composes as before.
 *
 * _Requirements: 3.3, 3.4, 3.5_
 */
export function ScrollDepth({
  children,
  className = "",
  strength = 3,
}: ScrollDepthProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const lastScrollRef = useRef(0);
  const settlingRef = useRef(false);

  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  const restingTransform = `perspective(${PERSPECTIVE_PX}px) rotateX(0deg)`;

  // Record scroll activity for idle detection.
  useEffect(() => {
    const onScroll = () => {
      lastScrollRef.current =
        typeof performance !== "undefined" ? performance.now() : Date.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrameClock(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: present the flat resting position, no scroll-driven tilt.
    if (reducedRef.current) {
      el.style.transition = "none";
      el.style.transform = restingTransform;
      settlingRef.current = false;
      return;
    }

    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const idleFor = now - lastScrollRef.current;

    if (idleFor > SCROLL_IDLE_MS) {
      // Scroll idle: ease back to the flat resting position within SETTLE_MS.
      if (!settlingRef.current) {
        settlingRef.current = true;
        el.style.transition = SETTLE_TRANSITION;
        el.style.transform = restingTransform;
      }
      return;
    }

    // Actively scrolling: derive the tilt from the bounded parallax offset.
    settlingRef.current = false;
    el.style.transition = "none";
    const rect = el.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const offset = computeParallaxOffset(
      window.scrollY,
      elementTop,
      window.innerHeight,
      DEPTH_SPEED,
    );
    // Map the bounded offset (±100 px) onto ±strength degrees; the tilt is
    // therefore itself bounded by `strength`.
    const rotateX = -(offset / MAX_PARALLAX_PX) * strength;
    el.style.transform = `perspective(${PERSPECTIVE_PX}px) rotateX(${rotateX}deg)`;
  });

  return (
    <div
      ref={ref}
      className={className}
      style={{ transformStyle: "preserve-3d", transform: restingTransform }}
    >
      {children}
    </div>
  );
}
