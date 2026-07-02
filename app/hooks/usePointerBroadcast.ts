"use client";

/**
 * Subscribe to the shared, throttled pointer broadcaster.
 *
 * A thin wrapper over {@link useImmersiveContext}'s `subscribePointer`. The
 * provider runs a single `mousemove` listener and notifies subscribers at most
 * once per animation frame with the latest pointer position, replacing dozens
 * of duplicated `window` listeners (Req 4.1, 7.3). Higher-priority subscribers
 * are notified first within a frame.
 *
 * The subscription is registered once and torn down on unmount (the effect's
 * cleanup removes it). The latest `handler` is always invoked via a ref, so
 * passing an inline handler each render does not churn the subscription.
 *
 * _Requirements: 4.1, 7.3_
 */

import { useEffect, useRef } from "react";

import {
  useImmersiveContext,
  type PointerPosition,
  type PointerSubscribeOptions,
  type PointerSubscriber,
} from "../components/immersive/ImmersiveProvider";

export function usePointerBroadcast(
  handler: PointerSubscriber,
  options?: PointerSubscribeOptions,
): void {
  const { subscribePointer } = useImmersiveContext();
  const priority = options?.priority ?? 0;

  // Keep the latest handler in a ref so the subscription stays stable across
  // renders while always calling the freshest callback.
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = subscribePointer(
      (position: PointerPosition) => handlerRef.current(position),
      { priority },
    );
    return unsubscribe;
  }, [subscribePointer, priority]);
}
