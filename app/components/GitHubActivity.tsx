"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

function Placeholder() {
  return (
    <div
      aria-hidden="true"
      className="h-[120px] w-full border border-rule-soft bg-paper-warm"
    />
  );
}

// The calendar library and its network request are only loaded when the card
// is about to scroll into view, so they cost nothing for visitors who never
// get that far.
const GitHubHeatmap = dynamic(
  () => import("./GitHubHeatmap").then((module) => module.GitHubHeatmap),
  { ssr: false, loading: () => <Placeholder /> },
);

export function GitHubActivity({ username }: { username: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || near) return;

    if (typeof IntersectionObserver === "undefined") {
      const id = setTimeout(() => setNear(true), 0);
      return () => clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [near]);

  return (
    <div ref={ref}>
      {near ? <GitHubHeatmap username={username} /> : <Placeholder />}
    </div>
  );
}
