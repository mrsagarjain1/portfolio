"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface FloatingElementProps {
  children: React.ReactNode;
  intensity?: number;
  delay?: number;
}

export function FloatingElement({
  children,
  intensity = 20,
  delay = 0,
}: FloatingElementProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const elementCenterX = rect.left + rect.width / 2;
      const elementCenterY = rect.top + rect.height / 2;

      const distanceX = e.clientX - elementCenterX;
      const distanceY = e.clientY - elementCenterY;

      const distance = Math.sqrt(
        distanceX * distanceX + distanceY * distanceY
      );
      const maxDistance = 300;

      if (distance < maxDistance) {
        const angle = Math.atan2(distanceY, distanceX);
        const moveX = Math.cos(angle) * (intensity / 2);
        const moveY = Math.sin(angle) * (intensity / 2);

        setMousePosition({ x: moveX, y: moveY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [intensity]);

  return (
    <motion.div
      ref={ref}
      animate={{ x: mousePosition.x, y: mousePosition.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      initial={{ x: 0, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
