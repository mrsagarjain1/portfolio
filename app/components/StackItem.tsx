"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useCard3D } from "@/app/hooks/useMouseEffects";

interface StackItemProps {
  name: string;
  category: string;
  index: number;
}

export function StackItem({ name, category, index }: StackItemProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotation = useCard3D(cardRef);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl border border-[#6ee7b7]/20 bg-gradient-to-br from-[#111]/60 to-[#0a0a0a]/40 backdrop-blur-sm hover:border-[#6ee7b7]/50 hover:from-[#111]/80 hover:to-[#0a0a0a]/60 transition-all group relative overflow-hidden"
      whileHover={{ y: -4, scale: 1.05 }}
      style={{
        perspective: "1000px",
      }}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Hover glow */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        animate={{
          background: [
            "radial-gradient(circle at 0% 50%, rgba(110, 231, 183, 0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 50%, rgba(110, 231, 183, 0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 50%, rgba(110, 231, 183, 0.08) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <p className="text-xs text-[#888] group-hover:text-[#6ee7b7] transition-colors mb-1 font-semibold uppercase tracking-wide">
        {category}
      </p>
      <p className="text-sm font-medium text-[#e8e8e8] group-hover:text-[#34d399] transition-colors">{name}</p>
    </motion.div>
  );
}
