"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useCard3D } from "@/app/hooks/useMouseEffects";

interface FeatureCardProps {
  title: string;
  description: string;
  index: number;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeatureCard({ title, description, index }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotation = useCard3D(cardRef);

  return (
    <motion.div
      ref={cardRef}
      variants={itemVariants}
      className="p-6 rounded-xl border border-[#6ee7b7]/20 bg-gradient-to-br from-[#111]/80 via-[#0a0a0a]/70 to-[#0a0a0a]/60 backdrop-blur-md transition-all group relative overflow-hidden"
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        perspective: "1000px",
      }}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(110, 231, 183, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, rgba(110, 231, 183, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(110, 231, 183, 0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Border glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl border border-[#6ee7b7]/0 group-hover:border-[#6ee7b7]/40 opacity-0 group-hover:opacity-100 transition-all pointer-events-none"
        animate={{ boxShadow: ["0 0 0px rgba(110, 231, 183, 0)", "0 0 20px rgba(110, 231, 183, 0.2)", "0 0 0px rgba(110, 231, 183, 0)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <motion.div
        className="w-2 h-2 rounded-full bg-gradient-to-r from-[#6ee7b7] to-[#34d399] mb-4 shadow-lg shadow-[#6ee7b7]/50 relative z-10"
        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.2 }}
      />
      <h3 className="text-sm font-medium text-[#e8e8e8] mb-2 group-hover:text-[#6ee7b7] transition-colors relative z-10">
        {title}
      </h3>
      <p className="text-sm text-[#888] leading-relaxed group-hover:text-[#6ee7b7] transition-colors relative z-10">
        {description}
      </p>
    </motion.div>
  );
}
