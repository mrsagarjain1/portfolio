"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Line {
  path: string;
  color?: string;
  width?: number;
}

interface SVGLineDrawProps {
  lines: Line[];
  className?: string;
  viewBox?: string;
}

export function SVGLineDraw({
  lines,
  className = "",
  viewBox = "0 0 1200 600",
}: SVGLineDrawProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });

  return (
    <div ref={containerRef} className={className}>
      <svg
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {lines.map((line, i) => {
          const progress = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
          return (
            <motion.path
              key={i}
              d={line.path}
              stroke={line.color ?? "#6ee7b7"}
              strokeWidth={line.width ?? 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              style={{ pathLength: progress, opacity: progress }}
              transition={{ duration: 0.1 }}
            />
          );
        })}
      </svg>
    </div>
  );
}
