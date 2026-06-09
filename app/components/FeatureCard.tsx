"use client";

import { motion } from "framer-motion";
import { DepthCard } from "./DepthCard";

interface FeatureCardProps {
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({ title, description, index }: FeatureCardProps) {
  return (
    <DepthCard index={index} direction={index % 2 === 0 ? "left" : "right"}
      className="p-6 rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] transition-colors hover:border-[#6ee7b7]/40"
    >
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
    </DepthCard>
  );
}
