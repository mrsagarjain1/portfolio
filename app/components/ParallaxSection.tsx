"use client";

import { ReactNode, useEffect, useRef } from "react";

import { useFrameClock } from "../hooks/useFrameClock";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { SETTLE_MS } from "../lib/immersive/constants";
import { computeParallaxOffset } from "../lib/immersive/scroll";

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

/** No scroll event for this long (ms) counts as "scroll idle" (Req 3.4). */
const SCROLL_IDLE_MS = 100;
/** Ease-to-rest transition, bounded by the 500 ms settle budget (Req 3.4). */
const SETTLE_TRANSITION = `transform ${SETTLE_MS}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

/**
 * ParallaxSection — wraps content in a gentle scroll-driven parallax lift.
 *
 * Refactored to subscribe to the immersive coordination layer and delegate its
 * numeric decision to the pure-logic module:
 *
 *  - the translation is routed through {@link computeParallaxOffset}, so it is
 *    always clamped to ±100 px from the resting position (Req 3.3);
 *  - it is driven by the shared frame clock (one rAF loop for the whole app,
 *    paused centrally when the tab is hidden) rather than a per-instance scroll
 *    handler;
 *  - when no scroll event has occurred for ~100 ms it eases the element back to
 *    its resting position within `SETTLE_MS` (500 ms) via a CSS transition
 *    (Req 3.4);
 *  - while reduced motion is preferred it presents the child content at its
 *    final resting position with no scroll-driven translation (Req 3.5).
 *
 * The children are always rendered and remain visible; only the wrapper's
 * transform changes.
 *
 * _Requirements: 3.3, 3.4, 3.5_
 */
export function ParallaxSection({
  children,
  speed = 0.5,
  className = "",
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Timestamp (ms) of the most recent scroll event, used for idle detection.
  const lastScrollRef = useRef(0);
  // Whether the element is currently easing back to rest (transition applied).
  const settlingRef = useRef(false);

  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  // Record scroll activity; the frame clock reads this to detect idle.
  useEffect(() => {
    const onScroll = () => {
      lastScrollRef.current =
        typeof performance !== "undefined" ? performance.now() : Date.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Drive the transform from the shared frame clock (throttled to one update
  // per frame by construction — Req 7.3).
  useFrameClock(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: present the resting position, no scroll translation.
    if (reducedRef.current) {
      if (el.style.transform !== "none" && el.style.transform !== "") {
        el.style.transition = "none";
        el.style.transform = "none";
      }
      settlingRef.current = false;
      return;
    }

    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const idleFor = now - lastScrollRef.current;

    if (idleFor > SCROLL_IDLE_MS) {
      // Scroll idle: ease back to the resting position within SETTLE_MS.
      if (!settlingRef.current) {
        settlingRef.current = true;
        el.style.transition = SETTLE_TRANSITION;
        el.style.transform = "translate3d(0, 0, 0)";
      }
      return;
    }

    // Actively scrolling: track the bounded offset immediately (no transition
    // lag), routed through the pure clamp so it never exceeds ±100 px.
    settlingRef.current = false;
    el.style.transition = "none";
    const rect = el.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const offset = computeParallaxOffset(
      window.scrollY,
      elementTop,
      window.innerHeight,
      speed,
    );
    el.style.transform = `translate3d(0, ${offset}px, 0)`;
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
