/**
 * WCAG contrast math for the immersive-experience feature.
 *
 * Framework-free (no React/DOM): every function operates on plain colors/numbers
 * so it can be exercised by property-based tests and reused by the ambient
 * background layer (`NeuralMeshBackground`) to prove that its opacity/brightness
 * range never pushes body-text contrast below the WCAG AA threshold of 4.5:1.
 *
 * See design.md "Ambient Background Layer" (Req 5.2) and Correctness Property 8.
 *
 * ---------------------------------------------------------------------------
 * Real site colors (from `app/globals.css`)
 * ---------------------------------------------------------------------------
 * - Body text  : `#e8e8e8`  (body { color: #e8e8e8 })
 * - Page base  : `#050508`  (body/html background-color)
 * - Ambient hue: `#6ee7b7`  (--color-accent; the brightest tone the ambient
 *                            mesh layer paints over the base)
 *
 * The ambient layer composites its accent hue over the near-black page base.
 * Because the accent (`#6ee7b7`, luminance ~0.64) is brighter than the base
 * (`#050508`, luminance ~0.0016) in every channel, the composited background
 * gets brighter — and body-text contrast gets lower — as either the layer's
 * opacity or its brightness increases. The worst case for contrast is therefore
 * at the top of both ranges.
 *
 * ---------------------------------------------------------------------------
 * Chosen ambient-layer allowed range (documented per task 6.2)
 * ---------------------------------------------------------------------------
 * - opacity    ∈ [0, 0.35]   (`MAX_AMBIENT_OPACITY`)
 * - brightness ∈ [0, 1]      (`MAX_AMBIENT_BRIGHTNESS`; a multiplier on the
 *                            accent hue — the layer can never be brighter than
 *                            its own source accent color)
 *
 * At the worst case (opacity 0.35, brightness 1) the composited background
 * luminance is ~0.073, giving a body-text contrast of ~6.98:1 — comfortably
 * above the 4.5:1 requirement, with headroom for anti-aliasing/blend variance.
 * This keeps the ambient mesh visible while guaranteeing Req 5.2 at every frame.
 */

/** An sRGB color with 8-bit channels in the range [0, 255]. */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** A color accepted by the contrast helpers: a `#rrggbb`/`#rgb` string or RGB. */
export type Color = string | RGB;

/** Body text color, from `body { color }` in globals.css. */
export const BODY_TEXT_COLOR = "#e8e8e8";

/** Page base background, from `body { background-color }` in globals.css. */
export const AMBIENT_BASE_COLOR = "#050508";

/** Brightest hue the ambient mesh paints, from `--color-accent`. */
export const AMBIENT_ACCENT_COLOR = "#6ee7b7";

/** Lower/upper bounds of the ambient layer's allowed opacity. */
export const MIN_AMBIENT_OPACITY = 0;
export const MAX_AMBIENT_OPACITY = 0.35;

/** Lower/upper bounds of the ambient layer's allowed brightness multiplier. */
export const MIN_AMBIENT_BRIGHTNESS = 0;
export const MAX_AMBIENT_BRIGHTNESS = 1;

/** WCAG AA minimum contrast ratio for normal body text. */
export const MIN_BODY_TEXT_CONTRAST = 4.5;

/** Clamp `value` into the inclusive range [min, max]. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Parse a color into an {@link RGB} triple with channels in [0, 255].
 *
 * Accepts `#rgb`, `#rrggbb` (with or without the leading `#`), or an existing
 * RGB object (whose channels are clamped/rounded defensively). Throws on an
 * unrecognized string so callers fail loudly on bad data rather than silently
 * mis-computing contrast.
 */
export function parseColor(color: Color): RGB {
  if (typeof color !== "string") {
    return {
      r: clamp(Math.round(color.r), 0, 255),
      g: clamp(Math.round(color.g), 0, 255),
      b: clamp(Math.round(color.b), 0, 255),
    };
  }

  const hex = color.trim().replace(/^#/, "");

  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return { r, g, b };
  }

  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }

  throw new Error(`Unrecognized color: "${color}"`);
}

/** Linearize a single gamma-encoded sRGB channel (0..1) per the WCAG formula. */
function linearizeChannel(channel: number): number {
  const c = clamp(channel, 0, 1);
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * Compute the WCAG relative luminance of a color, in [0, 1].
 *
 * L = 0.2126 R + 0.7152 G + 0.0722 B, over linearized sRGB channels.
 */
export function relativeLuminance(color: Color): number {
  const { r, g, b } = parseColor(color);
  const rl = linearizeChannel(r / 255);
  const gl = linearizeChannel(g / 255);
  const bl = linearizeChannel(b / 255);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/**
 * Compute the WCAG contrast ratio between two colors using the standard
 * relative-luminance formula `(L1 + 0.05) / (L2 + 0.05)`, where `L1` is the
 * lighter and `L2` the darker luminance. The result is always `>= 1`, and is
 * symmetric in its arguments.
 *
 * @param bodyTextColor        the foreground (body text) color
 * @param compositedBackground the background color the text sits on
 */
export function computeContrastRatio(
  bodyTextColor: Color,
  compositedBackground: Color
): number {
  const l1 = relativeLuminance(bodyTextColor);
  const l2 = relativeLuminance(compositedBackground);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Composite the ambient layer's accent hue over the page base within the
 * layer's allowed opacity/brightness range, returning the resulting background
 * color body text is rendered against.
 *
 * The layer paints `accent * brightness` over `base` with the given `opacity`
 * (standard source-over alpha compositing on gamma-encoded sRGB channels, which
 * matches how the browser blends the decorative canvas over the page). Inputs
 * are clamped into the allowed range so the returned background can never be
 * brighter than the range permits — the invariant Property 8 relies on.
 *
 * @param opacity    layer alpha, clamped to [MIN_AMBIENT_OPACITY, MAX_AMBIENT_OPACITY]
 * @param brightness accent multiplier, clamped to [MIN_AMBIENT_BRIGHTNESS, MAX_AMBIENT_BRIGHTNESS]
 * @param base       the underlying page color (defaults to the real page base)
 * @param accent     the layer's source hue (defaults to the real accent)
 */
export function compositeBackground(
  opacity: number,
  brightness: number,
  base: Color = AMBIENT_BASE_COLOR,
  accent: Color = AMBIENT_ACCENT_COLOR
): RGB {
  const a = clamp(opacity, MIN_AMBIENT_OPACITY, MAX_AMBIENT_OPACITY);
  const b = clamp(brightness, MIN_AMBIENT_BRIGHTNESS, MAX_AMBIENT_BRIGHTNESS);

  const baseRGB = parseColor(base);
  const accentRGB = parseColor(accent);

  const mix = (baseCh: number, accentCh: number): number => {
    const layer = accentCh * b; // brightness scales the accent hue
    return clamp(Math.round(baseCh * (1 - a) + layer * a), 0, 255);
  };

  return {
    r: mix(baseRGB.r, accentRGB.r),
    g: mix(baseRGB.g, accentRGB.g),
    b: mix(baseRGB.b, accentRGB.b),
  };
}
