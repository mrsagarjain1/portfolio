"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface InteractiveSpotlightProps {
  children: React.ReactNode;
  className?: string;
}

export function InteractiveSpotlight({
  children,
  className = "",
}: InteractiveSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}

      {/* Spotlight effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0"
        animate={{
          opacity: isHovering ? 0.3 : 0,
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 80 }}
        style={{
          background:
            "radial-gradient(circle 100px at center, rgba(110, 231, 183, 0.4) 0%, transparent 70%)",
          width: 200,
          height: 200,
          marginLeft: -100,
          marginTop: -100,
        }}
      />
    </div>
  );
}
