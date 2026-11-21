"use client";

import { useEffect, useRef, useState } from "react";
import { GitHubCalendar, type Activity } from "react-github-calendar";

const THEME = {
  light: ["#e2dcd4", "#b9cfd5", "#7fa0ae", "#3f6a7d", "#111312"],
  dark: ["#e2dcd4", "#b9cfd5", "#7fa0ae", "#3f6a7d", "#111312"],
};

/**
 * The GitHub contribution calendar. Browser only: it is loaded on demand by
 * GitHubActivity, so it never renders on the server and `window` is available.
 */
export function GitHubHeatmap({ username }: { username: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Keep the most recent weeks in view while the calendar finishes loading.
  useEffect(() => {
    const el = scrollRef.current;
    const interval = setInterval(() => {
      if (el) el.scrollLeft = el.scrollWidth;
    }, 200);
    const timeout = setTimeout(() => clearInterval(interval), 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const selectLastMonths = (contributions: Activity[]): Activity[] => {
    if (!isMobile) return contributions;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 5);
    return contributions.filter((day) => new Date(day.date) >= cutoff);
  };

  return (
    <div className="w-full overflow-x-auto py-2" ref={scrollRef}>
      <div className="min-w-max pr-2">
        <GitHubCalendar
          username={username}
          colorScheme="light"
          theme={THEME}
          fontSize={isMobile ? 10 : 12}
          blockMargin={isMobile ? 3 : 4}
          blockSize={isMobile ? 8 : 10}
          transformData={selectLastMonths}
        />
      </div>
    </div>
  );
}
