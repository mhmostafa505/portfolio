import {
  DEPTHS,
  HERO_DEPTH,
  LAYOUT_ATTEMPTS,
  LAYOUT_EVENNESS,
  LAYOUT_PRESETS,
  LAYOUT_SEED,
} from "@/content/skillsContents";
import type {
  LayoutDef,
  LayoutMode,
  LayoutPreset,
  LayoutSlot,
  Skill,
} from "@/types/skillsTypes";

// Small deterministic random generator, so the layout is identical on every load
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Point {
  x: number;
  y: number;
  r: number;
  depth: number;
  fixed: boolean;
}

interface Area {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi);

// Nearest site (power distance, so the big hero icon gets a bigger cell)
function nearest(points: Point[], x: number, y: number) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < points.length; i++) {
    const dx = x - points[i].x;
    const dy = y - points[i].y;
    const d = dx * dx + dy * dy - points[i].r * points[i].r;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

// Moves every point toward the centre of the space it "owns" (gentle Lloyd relaxation)
function even(
  points: Point[],
  samples: { x: number; y: number }[],
  area: Area,
) {
  for (let step = 0; step < LAYOUT_EVENNESS; step++) {
    const sx = new Array<number>(points.length).fill(0);
    const sy = new Array<number>(points.length).fill(0);
    const n = new Array<number>(points.length).fill(0);
    for (const s of samples) {
      const i = nearest(points, s.x, s.y);
      sx[i] += s.x;
      sy[i] += s.y;
      n[i]++;
    }
    points.forEach((p, i) => {
      if (p.fixed || n[i] === 0) return;
      p.x = clamp(p.x + (sx[i] / n[i] - p.x) * 0.8, area.x0, area.x1);
      p.y = clamp(p.y + (sy[i] / n[i] - p.y) * 0.8, area.y0, area.y1);
    });
  }
}

// Pushes icons that are too close apart
function separate(
  points: Point[],
  area: Area,
  gap: number,
  rand: () => number,
) {
  for (let iter = 0; iter < 300; iter++) {
    let moved = false;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        const need = a.r + b.r + gap;
        if (d >= need) continue;
        if (d < 0.001) {
          dx = rand() - 0.5;
          dy = rand() - 0.5;
          d = Math.hypot(dx, dy) || 1;
        }
        const nx = dx / d;
        const ny = dy / d;
        const push = (need - d) * 0.3;
        if (!a.fixed && !b.fixed) {
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
        } else if (a.fixed) {
          b.x += nx * push * 2;
          b.y += ny * push * 2;
        } else {
          a.x -= nx * push * 2;
          a.y -= ny * push * 2;
        }
        moved = true;
      }
    }
    for (const p of points) {
      if (p.fixed) continue;
      p.x = clamp(p.x, area.x0, area.x1);
      p.y = clamp(p.y, area.y0, area.y1);
    }
    if (!moved) break;
  }
}

// Lower is better: balanced left/right/top/bottom, no big holes, no loners
function rate(
  points: Point[],
  samples: { x: number; y: number }[],
  area: Area,
  cx: number,
  cy: number,
) {
  const free = points.filter((p) => !p.fixed);
  if (free.length < 3) return 0;
  const w = area.x1 - area.x0;
  const h = area.y1 - area.y0;

  let left = 0;
  let top = 0;
  let mx = 0;
  let my = 0;
  for (const p of free) {
    if (p.x < cx) left++;
    if (p.y < cy) top++;
    mx += p.x - cx;
    my += p.y - cy;
  }
  const right = free.length - left;
  const bottom = free.length - top;
  const counts =
    Math.max(0, Math.abs(left - right) - 1) +
    Math.max(0, Math.abs(top - bottom) - 1);
  const mass = Math.hypot(mx / free.length / w, my / free.length / h);

  let hole = 0;
  for (const s of samples) {
    let d = Infinity;
    for (const p of points) d = Math.min(d, Math.hypot(s.x - p.x, s.y - p.y));
    hole = Math.max(hole, d);
  }
  const holeNorm = hole / Math.sqrt((w * h) / points.length);

  let sum = 0;
  let max = 0;
  for (const a of points) {
    let d = Infinity;
    for (const b of points)
      if (a !== b) d = Math.min(d, Math.hypot(a.x - b.x, a.y - b.y));
    sum += d;
    max = Math.max(max, d);
  }
  const mean = sum / points.length;
  const loner = mean > 0 ? (max - mean) / mean : 0;

  return counts * 3 + mass * 6 + holeNorm * 4 + loner * 3;
}

function scatter(
  skills: Skill[],
  heroIndex: number,
  depths: number[],
  p: LayoutPreset,
  area: Area,
  cx: number,
  cy: number,
  samples: { x: number; y: number }[],
  rand: () => number,
): Point[] {
  const points: Point[] = skills.map((_, i) =>
    i === heroIndex
      ? {
          x: cx,
          y: cy,
          r: (p.baseSize * HERO_DEPTH) / 2,
          depth: HERO_DEPTH,
          fixed: true,
        }
      : {
          x: area.x0 + rand() * (area.x1 - area.x0),
          y: area.y0 + rand() * (area.y1 - area.y0),
          r: (p.baseSize * depths[i]) / 2,
          depth: depths[i],
          fixed: false,
        },
  );
  even(points, samples, area);
  separate(points, area, p.gap, rand);
  return points;
}

let cache: { key: string; layout: LayoutDef } | null = null;

export function buildLayout(
  skills: Skill[],
  mode: LayoutMode,
  boxW: number,
  boxH: number,
): LayoutDef {
  const key = [
    mode,
    Math.round(boxW / 8),
    Math.round(boxH / 8),
    LAYOUT_SEED,
    LAYOUT_ATTEMPTS,
    LAYOUT_EVENNESS,
    skills.map((s) => s.id + (s.hero ? "!" : "")).join(","),
  ].join("|");
  if (cache?.key === key) return cache.layout;

  const p = LAYOUT_PRESETS[mode];
  const count = Math.max(1, skills.length);

  // Pixels per reference unit: as big as allowed, but small enough that every icon has room
  const areaPerIcon = (p.baseSize + p.gap) ** 2 * 1.9;
  const fit = Math.sqrt((boxW * boxH) / (count * areaPerIcon));
  const scale = Math.min(fit, p.maxIconPx / p.baseSize);
  const refW = boxW / scale;
  const refH = boxH / scale;

  const area: Area = {
    x0: p.marginX,
    y0: p.marginY,
    x1: Math.max(p.marginX + 1, refW - p.marginX),
    y1: Math.max(p.marginY + 1, refH - p.marginY),
  };
  const cx = refW / 2;
  const cy = refH / 2;
  const heroIndex = skills.findIndex((s) => s.hero);

  // Every non-hero skill gets a size from the DEPTHS list
  let cursor = 0;
  const depths = skills.map((_, i) =>
    i === heroIndex ? HERO_DEPTH : DEPTHS[cursor++ % DEPTHS.length],
  );

  // A coarse grid that stands for "all the space on screen"
  const gx = 28;
  const gy = Math.max(
    6,
    Math.round((gx * (area.y1 - area.y0)) / (area.x1 - area.x0)),
  );
  const samples: { x: number; y: number }[] = [];
  for (let i = 0; i < gx; i++) {
    for (let j = 0; j < gy; j++) {
      samples.push({
        x: area.x0 + ((i + 0.5) / gx) * (area.x1 - area.x0),
        y: area.y0 + ((j + 0.5) / gy) * (area.y1 - area.y0),
      });
    }
  }

  // Try many arrangements and keep the most balanced one
  const baseSeed = LAYOUT_SEED + (mode === "mobile" ? 101 : 0);
  let best: Point[] = [];
  let bestScore = Infinity;
  for (let attempt = 0; attempt < LAYOUT_ATTEMPTS; attempt++) {
    const rand = mulberry32(baseSeed * 7919 + attempt * 104729 + 13);
    const points = scatter(
      skills,
      heroIndex,
      depths,
      p,
      area,
      cx,
      cy,
      samples,
      rand,
    );
    const score = rate(points, samples, area, cx, cy);
    if (score < bestScore) {
      bestScore = score;
      best = points;
    }
  }

  const slots: LayoutSlot[] = skills.map((skill, i) => ({
    id: skill.id,
    x: best[i].x,
    y: best[i].y,
    depth: best[i].depth,
  }));

  const layout: LayoutDef = { refW, refH, baseSize: p.baseSize, scale, slots };
  cache = { key, layout };
  return layout;
}
