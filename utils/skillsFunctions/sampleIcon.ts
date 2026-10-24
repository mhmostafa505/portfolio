import { hexToRgb, packColor } from "./math";
import {
  ALPHA_THRESHOLD,
  SAMPLE_SIZE,
  SAMPLE_STEP,
} from "@/content/skillsContents";
import { IconSample, Skill } from "@/types/skillsTypes";

const cache = new Map<string, Promise<IconSample[]>>();

// Adds width/height to SVGs that only have a viewBox (needed by Firefox)
function withSize(svg: string) {
  let out = svg;
  if (!/<svg[^>]*\swidth=/i.test(out))
    out = out.replace(/<svg/i, `<svg width="${SAMPLE_SIZE}"`);
  if (!/<svg[^>]*\sheight=/i.test(out))
    out = out.replace(/<svg/i, `<svg height="${SAMPLE_SIZE}"`);
  return out;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  let url = src;
  if (src.toLowerCase().endsWith(".svg")) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Could not load ${src}`);
    const blob = new Blob([withSize(await res.text())], {
      type: "image/svg+xml",
    });
    url = URL.createObjectURL(blob);
  }
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Could not load ${src}`));
      img.src = url;
    });
  } finally {
    if (url !== src) URL.revokeObjectURL(url);
  }
}

async function build(skill: Skill): Promise<IconSample[]> {
  const img = await loadImage(skill.src);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const tint = skill.tint ? hexToRgb(skill.tint) : null;
  const half = SAMPLE_SIZE / 2;
  const samples: IconSample[] = [];

  for (let y = 0; y < SAMPLE_SIZE; y += SAMPLE_STEP) {
    for (let x = 0; x < SAMPLE_SIZE; x += SAMPLE_STEP) {
      const i = (y * SAMPLE_SIZE + x) * 4;
      if (data[i + 3] < ALPHA_THRESHOLD) continue;
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      if (tint) {
        [r, g, b] = tint;
      } else if (skill.invert) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }
      samples.push({ ox: x - half, oy: y - half, color: packColor(r, g, b) });
    }
  }
  return samples;
}

/** Turns an icon file into a list of coloured points. Cached per skill. */
export function sampleSkill(skill: Skill): Promise<IconSample[]> {
  let promise = cache.get(skill.id);
  if (!promise) {
    promise = build(skill);
    cache.set(skill.id, promise);
  }
  return promise;
}
