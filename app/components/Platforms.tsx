"use client";

import { motion } from "framer-motion";

import { platforms, type Platform } from "../lib/content";
import { MotionPolicy } from "./MotionPolicy";

function PlatformIcon({ id }: { id: Platform["id"] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (id === "web") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.6 2.4 4 5.5 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.5-4-9s1.4-6.6 4-9Z" />
      </svg>
    );
  }
  if (id === "mobile") {
    return (
      <svg {...common}>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path d="M11 18.5h2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

/** Where the product runs, with a link for each platform. */
export function Platforms() {
  return (
    <MotionPolicy>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {platforms.map((platform, i) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -3 }}
            className="flex flex-col rounded-xl border border-[#222] bg-gradient-to-br from-[#111]/80 to-[#050505]/80 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md transition-colors hover:border-[#6ee7b7]/30"
          >
            <div className="mb-2 flex items-center gap-2.5">
              <span className="text-[#6ee7b7]">
                <PlatformIcon id={platform.id} />
              </span>
              <h3 className="text-sm font-semibold tracking-tight text-[#e8e8e8]">
                {platform.title}
              </h3>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-[#d4d4d4]">
              {platform.blurb}
            </p>
            <div className="relative z-10 mt-auto flex flex-wrap gap-2">
              {platform.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs font-medium text-[#e8e8e8] transition-colors hover:border-[#6ee7b7]/40 hover:text-[#6ee7b7]"
                >
                  {link.label}
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M2 10L10 2M10 2H4M10 2V8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </MotionPolicy>
  );
}
