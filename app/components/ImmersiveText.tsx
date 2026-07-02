"use client";

/**
 * ImmersiveText — a character-stagger reveal for short headings/labels.
 *
 * Refactored onto the coordination layer: the reveal is driven by the shared
 * latched {@link useSectionReveal} hook (a single `IntersectionObserver` at a
 * ≈0.1 threshold) instead of a bespoke observer, so the entrance fires once as
 * the text crosses 10% into the viewport and is never replayed while it stays
 * mounted (Req 3.1, 3.6).
 *
 * Under reduced motion the characters render directly in their final visible
 * state with no stagger or reveal animation (Req 1.2, 3.5). The full text is
 * always present in the output.
 *
 * _Requirements: 3.1, 3.5, 3.6_
 */

import { useRef } from "react";
import { motion } from "framer-motion";

import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSectionReveal } from "../hooks/useSectionReveal";

interface ImmersiveTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
  delay?: number;
}

export function ImmersiveText({
  text,
  className = "",
  delay = 0,
}: ImmersiveTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useSectionReveal(ref);
  const reducedMotion = useReducedMotion();

  const characters = text.split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: delay,
      },
    },
  };

  const charVariants = {
    hidden: { opacity: 0, y: 20, rotateZ: -10 },
    visible: {
      opacity: 1,
      y: 0,
      rotateZ: 0,
      transition: { type: "spring" as const, stiffness: 200, damping: 20 },
    },
  };

  // Under reduced motion, mount straight into the final visible state so the
  // text is shown immediately with no stagger. Otherwise start hidden and
  // reveal once the latch flips.
  const visible = reducedMotion || revealed;

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial={reducedMotion ? "visible" : "hidden"}
      animate={visible ? "visible" : "hidden"}
    >
      {characters.map((char, idx) => (
        <motion.span key={idx} variants={charVariants} className="inline-block">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
}
