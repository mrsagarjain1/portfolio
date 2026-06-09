"use client";

import { motion } from "framer-motion";

interface FloatingOrbProps {
  size?: number;
  color?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export function FloatingOrb({
  size = 100,
  color = "rgba(110, 231, 183, 0.1)",
  duration = 6,
  delay = 0,
  className = "",
}: FloatingOrbProps) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none blur-3xl ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}
