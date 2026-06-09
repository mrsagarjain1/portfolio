"use client";

import { motion } from "framer-motion";
import { useRef, useState, ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  strength?: number;
}

export function MagneticButton({
  children,
  onClick,
  href,
  className = "",
  strength = 0.3,
  target,
  rel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
    const maxDistance = 100;

    if (distance < maxDistance) {
      setPosition({
        x: distanceX * strength,
        y: distanceY * strength,
      });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  if (href) {
    return (
      <motion.a
        ref={ref as any}
        href={href}
        target={target}
        rel={rel}
        className={className}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={position}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as any}
      onClick={onClick}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={position}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}
