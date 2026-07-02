"use client";

/**
 * Reactive pointer-capability signal for the immersive-experience coordination
 * layer.
 *
 * A thin wrapper over {@link useImmersiveContext} that surfaces the provider's
 * live `(pointer: fine)` / `(hover: hover)` signal. Pointer-following components
 * read this to render `null` on a coarse (touch-primary) device (Req 4.2, 7.2).
 *
 * _Requirements: 4.1_
 */

import { useImmersiveContext } from "../components/immersive/ImmersiveProvider";
import type { PointerType } from "../lib/immersive/types";

export function usePointerCapability(): PointerType {
  return useImmersiveContext().pointerType;
}
