"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ElasticRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ElasticReveal({
  children,
  delay = 0,
  className = "",
}: ElasticRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px", amount: 0.2 }}
      transition={{
        duration: 0.8,
        delay,
        type: "spring",
        stiffness: 150,
        damping: 14,
      }}
    >
      {children}
    </motion.div>
  );
}
