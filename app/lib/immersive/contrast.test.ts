import { describe, it, expect } from "vitest";
import fc from "fast-check";

import {
  BODY_TEXT_COLOR,
  MIN_AMBIENT_OPACITY,
  MAX_AMBIENT_OPACITY,
  MIN_AMBIENT_BRIGHTNESS,
  MAX_AMBIENT_BRIGHTNESS,
  MIN_BODY_TEXT_CONTRAST,
  compositeBackground,
  computeContrastRatio,
  relativeLuminance,
} from "./contrast";

describe("computeContrastRatio", () => {
  it("is 1 for identical colors", () => {
    expect(computeContrastRatio("#777777", "#777777")).toBeCloseTo(1, 6);
  });

  it("is 21 for black on white (WCAG maximum)", () => {
    expect(computeContrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 4);
  });

  it("is symmetric in its arguments", () => {
    const a = computeContrastRatio(BODY_TEXT_COLOR, "#050508");
    const b = computeContrastRatio("#050508", BODY_TEXT_COLOR);
    expect(a).toBeCloseTo(b, 9);
  });

  it("body text over the untouched page base far exceeds 4.5:1", () => {
    expect(computeContrastRatio(BODY_TEXT_COLOR, "#050508")).toBeGreaterThan(4.5);
  });
});

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 9);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 9);
  });
});

// Feature: immersive-experience, Property 8: Background preserves body-text contrast
//
// For any background opacity and brightness within the ambient layer's allowed
// range, computeContrastRatio(bodyTextColor, compositedBackground) is at least 4.5.
// Validates: Requirements 5.2
describe("compositeBackground contrast", () => {
  it("Property 8: composited background keeps body-text contrast >= 4.5 across the allowed range", () => {
    fc.assert(
      fc.property(
        fc.double({
          min: MIN_AMBIENT_OPACITY,
          max: MAX_AMBIENT_OPACITY,
          noNaN: true,
        }),
        fc.double({
          min: MIN_AMBIENT_BRIGHTNESS,
          max: MAX_AMBIENT_BRIGHTNESS,
          noNaN: true,
        }),
        (opacity, brightness) => {
          const background = compositeBackground(opacity, brightness);
          const ratio = computeContrastRatio(BODY_TEXT_COLOR, background);
          expect(ratio).toBeGreaterThanOrEqual(MIN_BODY_TEXT_CONTRAST);
        },
      ),
    );
  });
});
