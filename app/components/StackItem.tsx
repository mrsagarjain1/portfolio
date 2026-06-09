"use client";

import { motion } from "framer-motion";

interface StackItemProps {
  name: string;
  category: string;
  index: number;
}

export function StackItem({ name, category, index }: StackItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group p-4 rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] transition-colors hover:border-[#6ee7b7]/40"
      style={{ willChange: "transform", transitionDuration: "350ms", transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
    >
      <p className="text-[10px] text-[#555] tracking-widest uppercase mb-1 font-medium">
        {category}
      </p>
      <p className="text-sm font-semibold text-[#e8e8e8] group-hover:text-[#6ee7b7] transition-colors duration-300">
        {name}
      </p>
    </motion.div>
  );
}
