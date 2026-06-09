"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface AnimatedUnderlineProps {
  className?: string;
  color?: string;
}

export function AnimatedUnderline({ className = "", color = "#6ee7b7" }: AnimatedUnderlineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "start 30%"],
  });
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div
        className="h-px"
        style={{
          width,
          background: `linear-gradient(to right, ${color}, transparent)`,
        }}
      />
    </div>
  );
}
