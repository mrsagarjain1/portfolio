"use client";

import { motion } from "framer-motion";
import { DepthCard } from "./DepthCard";
import { InteractiveSpotlight } from "./InteractiveSpotlight";

interface FeatureCardProps {
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({ title, description, index }: FeatureCardProps) {
  return (
    <InteractiveSpotlight className="rounded-2xl">
      <DepthCard index={index} direction={index % 2 === 0 ? "left" : "right"}
        className="relative p-7 rounded-2xl border border-[#222] bg-gradient-to-br from-[#111]/90 to-[#050505]/90 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-500 hover:border-[#6ee7b7]/50 hover:shadow-[0_0_30px_-5px_rgba(110,231,183,0.15)] h-full w-full group overflow-hidden"
      >
        {/* Subtle top glow line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#6ee7b7]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="flex items-center gap-3 mb-2.5">
          <div className="relative w-2.5 h-2.5 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#6ee7b7] shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
            <motion.div
              className="absolute inset-0 rounded-full bg-[#6ee7b7]"
              animate={{ opacity: [0.6, 0, 0.6], scale: [1, 3.5, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
            />
          </div>
          <h3 className="text-base font-semibold text-white group-hover:text-[#6ee7b7] transition-colors duration-300 tracking-tight">
            {title}
          </h3>
        </div>
        <p className="text-sm text-[#d4d4d4] leading-relaxed font-medium">
          {description}
        </p>
      </DepthCard>
    </InteractiveSpotlight>
  );
}
