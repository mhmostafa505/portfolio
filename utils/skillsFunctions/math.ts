import { Rgb } from "@/types/skillsTypes";

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

// Frame-rate independent smoothing toward a target
export const damp = (
  current: number,
  target: number,
  rate: number,
  dt: number,
) => current + (target - current) * Math.min(1, dt * rate);

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

// Packs a color for a little-endian Uint32 pixel buffer (alpha is added later)
export const packColor = (r: number, g: number, b: number) =>
  (b << 16) | (g << 8) | r;

export const mixRgb = (a: Rgb, b: Rgb, t: number) =>
  `rgb(${Math.round(a[0] * (1 - t) + b[0] * t)},${Math.round(
    a[1] * (1 - t) + b[1] * t,
  )},${Math.round(a[2] * (1 - t) + b[2] * t)})`;
