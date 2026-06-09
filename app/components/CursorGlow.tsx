"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CursorGlowProps {
  children: React.ReactNode;
  className?: string;
}

export function CursorGlow({ children, className = "" }: CursorGlowProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        animate={{
          background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, rgba(110, 231, 183, 0.08) 0%, transparent 80%)`,
        }}
        transition={{ type: "tween", duration: 0.1 }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
