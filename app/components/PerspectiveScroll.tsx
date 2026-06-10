"use client";

import { useEffect, useState, ReactNode } from "react";
import { motion } from "framer-motion";

export function PerspectiveScroll({ children }: { children: ReactNode }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 4;  // ±2°
      const y = (e.clientY / window.innerHeight - 0.5) * 4; // ±2°
      setTilt({ x: -y, y: x });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <motion.div
      className="perspective-container h-full w-full"
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: "spring", stiffness: 100, damping: 40 }}
      style={{ perspective: "2000px" }}
    >
      {children}
    </motion.div>
  );
}
