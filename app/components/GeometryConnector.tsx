"use client";

import { motion } from "framer-motion";

export function GeometryConnector() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-center gap-3" aria-hidden="true">
      <motion.div
        className="w-1 h-1 rounded-full bg-[#6ee7b7] connector-dot"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={{ once: true }}
      />
      <motion.div
        className="h-px bg-gradient-to-r from-[#6ee7b7]/20 via-[#6ee7b7]/30 to-[#6ee7b7]/20"
        initial={{ width: 0 }}
        whileInView={{ width: 60 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-[#34d399]"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2, type: "spring", stiffness: 400 }}
      />
      <motion.div
        className="h-px bg-gradient-to-r from-[#6ee7b7]/20 via-[#6ee7b7]/30 to-[#6ee7b7]/20"
        initial={{ width: 0 }}
        whileInView={{ width: 60 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      <motion.div
        className="w-1 h-1 rounded-full bg-[#6ee7b7] connector-dot"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={{ once: true }}
      />
      <motion.div
        className="w-2 h-2 rounded-full border border-[#6ee7b7]/40"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.35, type: "spring", stiffness: 300 }}
      />
    </div>
  );
}
