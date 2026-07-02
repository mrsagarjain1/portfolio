"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useImmersiveContext } from "./immersive/ImmersiveProvider";
import { usePointerBroadcast } from "../hooks/usePointerBroadcast";
import { usePointerCapability } from "../hooks/usePointerCapability";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * CursorGlow — a soft radial glow that follows the pointer, wrapped around the
 * primary content.
 *
 * Refactored onto the immersive coordination layer: it subscribes to the shared
 * pointer broadcaster (instead of its own `mousemove` listener) and registers
 * with the pointer-effect registry so the glow participates in the
 * concurrent-follower cap (priority just below the custom cursor).
 *
 * Because this component wraps the app's primary content, it must ALWAYS render
 * its children. Only the decorative glow layer is conditional: it is dropped on
 * a coarse pointer, under reduced motion, or when the registry caps this effect
 * out — the children stay present and visible in every case.
 *
 * _Requirements: 4.1, 4.2, 4.7, 7.2, 7.3_
 */

interface CursorGlowProps {
  children: React.ReactNode;
  className?: string;
}

const EFFECT_ID = "CursorGlow";
const EFFECT_PRIORITY = 40; // below CustomCursor, above magnetic/trails

export function CursorGlow({ children, className = "" }: CursorGlowProps) {
  const { registerPointerEffect, isPointerEffectActive } =
    useImmersiveContext();
  const pointerType = usePointerCapability();
  const reducedMotion = useReducedMotion();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Register as a continuous pointer follower so the registry can cap it.
  useEffect(
    () => registerPointerEffect(EFFECT_ID, EFFECT_PRIORITY, "glow"),
    [registerPointerEffect],
  );

  // The glow only follows on a fine pointer, with motion enabled, and while the
  // registry keeps it active. Continuous motion is gated on this flag.
  const glowActive =
    pointerType === "fine" &&
    !reducedMotion &&
    isPointerEffectActive(EFFECT_ID);

  usePointerBroadcast(
    ({ x, y }) => {
      if (glowActive) {
        setMousePosition({ x, y });
      }
    },
    { priority: EFFECT_PRIORITY },
  );

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {glowActive && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0"
          animate={{
            background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, rgba(110, 231, 183, 0.08) 0%, transparent 80%)`,
          }}
          transition={{ type: "tween", duration: 0.1 }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
