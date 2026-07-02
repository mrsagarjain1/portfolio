"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface WaveSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function WaveSection({ children, className = "" }: WaveSectionProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      
      {/* Wave divider (purely decorative: hidden from a11y tree and never
          intercepts pointer/keyboard input directed at underlying content). */}
      <svg
        aria-hidden="true"
        className="absolute -bottom-1 left-0 w-full h-16 text-[#0a0a0a] pointer-events-none"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z"
          fill="currentColor"
          animate={{
            d: [
              "M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z",
              "M0,30 Q300,80 600,30 T1200,30 L1200,120 L0,120 Z",
              "M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
