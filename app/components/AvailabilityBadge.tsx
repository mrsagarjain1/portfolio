"use client";

import { useSyncExternalStore } from "react";

import { now } from "../lib/content";

/** Current time in India as "03:47 PM". */
function readIndiaTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, 10_000);
  return () => clearInterval(id);
}

/** No time on the server: it would be stale by the time the page arrives. */
function readServerTime(): string {
  return "";
}

/**
 * "Open to collaborations" with a live clock in the owner's time zone.
 *
 * It sits in the page flow (in the hero) rather than floating over the content,
 * so it can never cover text as the page scrolls. The clock appears after the
 * page loads, which keeps the server and client markup identical.
 */
export function AvailabilityBadge({ className = "" }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, readIndiaTime, readServerTime);

  return (
    <div
      className={`inline-flex items-center gap-2 border border-text/25 bg-[#f6f2ea] px-3 py-1.5 ${className}`}
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2f9e6e]" />
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.08em] text-text">
        {now.status}
        {time ? ` · IST ${time}` : ""}
      </span>
    </div>
  );
}
