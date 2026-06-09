"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreviewData {
  title: string;
  description: string;
  stats: string[];
}

const previews: Record<string, PreviewData> = {
  valocoach: {
    title: "valocoach.ai",
    description: "AI coaching dashboard with real-time match analysis, personalized quests, and agent-specific insights.",
    stats: ["20K+ Users", "1M+ Impressions/mo", "3K+ App Downloads", "100+ Coaches"],
  },
};

export function HoverPreview() {
  const [preview, setPreview] = useState<{ data: PreviewData; x: number; y: number } | null>(null);
  const hoveredRef = useRef(false);

  useEffect(() => {
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("[data-preview]") as HTMLElement;
      if (link) {
        hoveredRef.current = true;
        setPreview({
          data: previews[link.dataset.preview!] ?? previews.valocoach,
          x: e.clientX,
          y: e.clientY,
        });
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (hoveredRef.current) {
        setPreview((p) => (p ? { ...p, x: e.clientX + 20, y: e.clientY - 140 } : null));
      }
    };
    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-preview]")) {
        hoveredRef.current = false;
        setPreview(null);
      }
    };

    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseout", onMouseOut);
    return () => {
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  return (
    <AnimatePresence>
      {preview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[10001] pointer-events-none w-64"
          style={{ left: preview.x, top: preview.y }}
        >
          <div className="p-4 rounded-xl border border-[#6ee7b7]/30 bg-[#0c0c0c]/95 backdrop-blur-xl shadow-2xl">
            <p className="text-xs font-semibold text-[#6ee7b7] mb-2">{preview.data.title}</p>
            <p className="text-xs text-[#777] mb-3 leading-relaxed">{preview.data.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {preview.data.stats.map((s) => (
                <span key={s} className="px-2 py-0.5 text-[10px] rounded-md border border-[#6ee7b7]/20 bg-[#6ee7b7]/5 text-[#6ee7b7]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
