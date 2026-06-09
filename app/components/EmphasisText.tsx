"use client";

import { ReactNode } from "react";

interface EmphasisTextProps {
  children: ReactNode;
  className?: string;
}

export function EmphasisText({ children, className = "" }: EmphasisTextProps) {
  return (
    <div className={`emphasis-text ${className}`}>
      {children}
    </div>
  );
}

/** Wrap keywords to highlight on parent hover */
export function Em({ children }: { children: ReactNode }) {
  return <span className="em-keyword">{children}</span>;
}
