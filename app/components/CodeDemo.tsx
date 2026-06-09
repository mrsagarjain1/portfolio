"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function CodeDemo() {
  const [output, setOutput] = useState<string | null>(null);

  return (
    <div
      className="inline-block group cursor-pointer"
      onMouseEnter={() => setOutput("→ Analyzing venator#fear...\n→ KDR: 1.42 | HS%: 32% | ACS: 245\n→ Rank: Immortal 2 | Win Rate: 58%\n→ AI Insight: Improve crosshair placement on Haven")}
      onMouseLeave={() => setOutput(null)}
    >
      <motion.div
        className="px-4 py-2 rounded-lg border border-[#6ee7b7]/20 bg-[#0c0c0c] font-mono text-xs"
        whileHover={{ borderColor: "rgba(110,231,183,0.5)" }}
      >
        <span className="text-[#6ee7b7]">valocoach</span>
        <span className="text-[#e8e8e8]">.analyze(</span>
        <span className="text-[#34d399]">"venator#fear"</span>
        <span className="text-[#e8e8e8]">)</span>

        {output && (
          <motion.pre
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-3 pt-3 border-t border-[#1f1f1f] text-white leading-relaxed overflow-hidden"
          >
            {output}
          </motion.pre>
        )}
      </motion.div>
    </div>
  );
}
