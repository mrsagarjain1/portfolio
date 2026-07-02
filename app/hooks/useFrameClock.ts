"use client";

/**
 * Subscribe to the shared frame clock.
 *
 * A thin wrapper over {@link useImmersiveContext}'s `subscribeFrame`. The
 * provider drives a single `requestAnimationFrame` loop and invokes every
 * subscriber once per frame with the frame timestamp, so the performance
 * governor can pause/throttle all animation centrally (Req 7.3, 7.4).
 *
 * The subscription is registered once and torn down on unmount (the effect's
 * cleanup removes it). The latest `handler` is always invoked via a ref, so
 * passing an inline handler each render does not churn the subscription.
 *
 * _Requirements: 7.3_
 */

import { useEffect, useRef } from "react";

import {
  useImmersiveContext,
  type FrameSubscriber,
} from "../components/immersive/ImmersiveProvider";

export function useFrameClock(handler: FrameSubscriber): void {
  const { subscribeFrame } = useImmersiveContext();

  // Keep the latest handler in a ref so the subscription stays stable across
  // renders while always calling the freshest callback.
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = subscribeFrame((timestamp: number) =>
      handlerRef.current(timestamp),
    );
    return unsubscribe;
  }, [subscribeFrame]);
}
