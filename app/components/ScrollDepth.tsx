"use client";

import { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ScrollDepthProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function ScrollDepth({ children, className = "", strength = 3 }: ScrollDepthProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [strength, 0, -strength]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, perspective: "1200px", transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}
