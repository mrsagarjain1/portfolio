"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useParallax } from "@/app/hooks/useParallax";

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxSection({
  children,
  speed = 0.5,
  className = "",
}: ParallaxSectionProps) {
  const [ref, offset] = useParallax(speed);

  return (
    <motion.div
      ref={ref as any}
      style={{
        y: offset,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
