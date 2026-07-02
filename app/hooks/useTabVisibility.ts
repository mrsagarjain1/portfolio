"use client";

/**
 * Reactive tab-visibility signal for the immersive-experience coordination
 * layer.
 *
 * A thin wrapper over {@link useImmersiveContext} that surfaces the provider's
 * live `document.visibilitychange` signal. Continuous animation loops (ambient
 * background, frame-clock subscribers) read this to pause while the tab is
 * hidden and resume when it becomes visible again (Req 5.3, 5.4, 7.4).
 *
 * Returns `true` while the tab is visible.
 *
 * _Requirements: 7.3_
 */

import { useImmersiveContext } from "../components/immersive/ImmersiveProvider";

export function useTabVisibility(): boolean {
  return useImmersiveContext().tabVisible;
}
