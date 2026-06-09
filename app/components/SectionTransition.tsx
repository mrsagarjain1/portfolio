"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionTransitionProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  blur?: boolean;
}

export function SectionTransition({
  children,
  delay = 0,
  direction = "up",
  blur = true,
}: SectionTransitionProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: 60, opacity: 0 };
      case "down":
        return { y: -60, opacity: 0 };
      case "left":
        return { x: -60, opacity: 0 };
      case "right":
        return { x: 60, opacity: 0 };
      default:
        return { y: 60, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={{
        ...getInitialPosition(),
        filter: blur ? "blur(10px)" : "blur(0px)",
      }}
      whileInView={{
        x: 0,
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        margin: "-100px",
        amount: 0.3,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
