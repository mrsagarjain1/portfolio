"use client";

import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({ title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -4 }}
      className="group relative p-6 rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] transition-colors hover:border-[#6ee7b7]/40"
      style={{ willChange: "transform", transitionDuration: "350ms", transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
    >
      {/* Accent dot with pulsing glow ring */}
      <div className="relative w-2 h-2 mb-4">
        <div className="absolute inset-0 rounded-full bg-[#6ee7b7]" />
        <motion.div
          className="absolute inset-0 rounded-full bg-[#6ee7b7]"
          animate={{ opacity: [0.4, 0, 0.4], scale: [1, 2.8, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.2 }}
        />
      </div>

      <h3 className="text-sm font-semibold text-[#e8e8e8] mb-2 group-hover:text-[#6ee7b7] transition-colors duration-300">
        {title}
      </h3>

      <p className="text-sm text-[#777] leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
