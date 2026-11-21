"use client";

/**
 * Whether the browser tab is visible. Animation loops read this to pause while
 * the tab is hidden and resume when it comes back.
 */

import { useImmersiveContext } from "../components/immersive/ImmersiveProvider";

export function useTabVisibility(): boolean {
  return useImmersiveContext().tabVisible;
}
