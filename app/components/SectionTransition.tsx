"use client";

/**
 * SectionTransition — a once-only entrance wrapper for Section content.
 *
 * Refactored onto the coordination layer: the reveal is driven by
 * {@link useSectionReveal} (a single latched `IntersectionObserver` at a ≈0.1
 * threshold) rather than framer-motion's own `whileInView`, so the entrance
 * fires when the element crosses 10% into the viewport and completes within
 * 1000 ms (Req 3.1). Because the reveal latch is monotone, the final state is
 * held without replaying the entrance while the Section stays in view (Req 3.6).
 *
 * Under reduced motion the children render directly in their final visible
 * state with no reveal animation (Req 1.2, 3.5). The wrapped children are always
 * present in the output (Req 2.2, 2.6).
 *
 * _Requirements: 3.1, 3.5, 3.6_
 */

import { motion } from "framer-motion";
import { ReactNode, useRef } from "react";

import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSectionReveal } from "../hooks/useSectionReveal";

interface SectionTransitionProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  blur?: boolean;
  className?: string;
}

export function SectionTransition({
  children,
  delay = 0,
  direction = "up",
  blur = true,
  className,
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useSectionReveal(ref);
  const reducedMotion = useReducedMotion();

  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: 60, opacity: 0 };
      case "down":
        return { y: -60, opacity: 0 };
      case "left":
        return { x: -60, opacity: 0 };
      case "right":
        return { x: 60, opacity: 0 };
      default:
        return { y: 60, opacity: 0 };
    }
  };

  // The resting, fully visible target for the content.
  const finalState = { x: 0, y: 0, opacity: 1, filter: "blur(0px)" };

  // Under reduced motion, start (and stay) in the final visible state so the
  // content appears immediately with no motion-based reveal.
  const initial = reducedMotion
    ? finalState
    : {
        ...getInitialPosition(),
        filter: blur ? "blur(10px)" : "blur(0px)",
      };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={reducedMotion || revealed ? finalState : initial}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: 0.8, delay, ease: "easeOut" }
      }
    >
      {children}
    </motion.div>
  );
}
