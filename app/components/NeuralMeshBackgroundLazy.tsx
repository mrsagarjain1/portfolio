"use client";

import dynamic from "next/dynamic";

/**
 * Client-only, code-split loader for the WebGL galaxy background.
 *
 * `three.js` and its post-processing passes are heavy, so the background is
 * dynamically imported with `ssr: false`. This keeps it out of the initial
 * client bundle and off the critical rendering path — the page paints and
 * becomes interactive first, then the galaxy hydrates in. There is no loading
 * placeholder because the background is purely decorative (`aria-hidden`).
 */
const NeuralMeshBackground = dynamic(
  () =>
    import("./NeuralMeshBackground").then((m) => m.NeuralMeshBackground),
  { ssr: false },
);

export function NeuralMeshBackgroundLazy() {
  return <NeuralMeshBackground />;
}
