"use client";

import { useEffect, useState } from "react";

export function AvailabilityBadge() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6ee7b7]/20 bg-[#0a0a0a]/70 backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34d399]" />
      </span>
      <span className="text-xs text-[#888]">
        Available for projects · IST {time}
      </span>
    </div>
  );
}
