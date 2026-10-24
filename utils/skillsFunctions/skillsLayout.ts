import {
  DEPTHS,
  HERO_DEPTH,
  LAYOUT_PRESETS,
  LAYOUT_SEED,
} from "@/content/skillsContents";
import type {
  LayoutDef,
  LayoutMode,
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

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(Math.max(v, lo), hi);

export function buildLayout(
  skills: Skill[],
  mode: LayoutMode,
  boxW: number,
  boxH: number,
): LayoutDef {
  const p = LAYOUT_PRESETS[mode];
  const total = skills.length;
  const count = Math.max(1, total);
  const rand = mulberry32(LAYOUT_SEED + (mode === "mobile" ? 101 : 0));

  // Pixels per reference unit: as big as allowed, but small enough that every icon has room
  const areaPerIcon = (p.baseSize + p.gap) ** 2 * 1.9;
  const fit = Math.sqrt((boxW * boxH) / (count * areaPerIcon));
  const scale = Math.min(fit, p.maxIconPx / p.baseSize);
  const refW = boxW / scale;
  const refH = boxH / scale;

  const usableW = Math.max(1, refW - p.marginX * 2);
  const usableH = Math.max(1, refH - p.marginY * 2);
  const centerX = refW / 2;
  const centerY = refH / 2;

  const heroIndex = skills.findIndex((s) => s.hero);
  const others = total - (heroIndex >= 0 ? 1 : 0);

  // 1. A grid with more cells than icons. Random cells get a random point inside them.
  const totalCells = Math.ceil(count * 2.4);
  const cols = Math.max(
    1,
    Math.round(Math.sqrt((totalCells * usableW) / usableH)),
  );
  const rows = Math.max(1, Math.ceil(totalCells / cols));
  const cellW = usableW / cols;
  const cellH = usableH / rows;
  const cells: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: p.marginX + (c + rand()) * cellW,
        y: p.marginY + (r + rand()) * cellH,
      });
    }
  }

  if (heroIndex >= 0) {
    // Free the middle for the hero
    let nearest = 0;
    let best = Infinity;
    cells.forEach((cell, i) => {
      const d = Math.hypot(cell.x - centerX, cell.y - centerY);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    cells.splice(nearest, 1);
  }
  while (cells.length > others)
    cells.splice(Math.floor(rand() * cells.length), 1);

  // Shuffle, so the order of the list doesn't decide where a skill ends up on screen
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  let cursor = 0;
  const points: Point[] = skills.map((_, i) => {
    if (i === heroIndex) {
      return {
        x: centerX,
        y: centerY,
        r: (p.baseSize * HERO_DEPTH) / 2,
        depth: HERO_DEPTH,
        fixed: true,
      };
    }
    const depth = DEPTHS[cursor % DEPTHS.length];
    const cell = cells[cursor++];
    return {
      x: cell.x,
      y: cell.y,
      r: (p.baseSize * depth) / 2,
      depth,
      fixed: false,
    };
  });

  // 2. Push overlapping icons apart until everyone has room
  for (let iter = 0; iter < 400; iter++) {
    let moved = false;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        const need = a.r + b.r + p.gap;
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
    for (const pt of points) {
      if (pt.fixed) continue;
      pt.x = clamp(pt.x, p.marginX, refW - p.marginX);
      pt.y = clamp(pt.y, p.marginY, refH - p.marginY);
    }
    if (!moved) break;
  }

  const slots: LayoutSlot[] = skills.map((skill, i) => ({
    id: skill.id,
    x: points[i].x,
    y: points[i].y,
    depth: points[i].depth,
  }));

  return { refW, refH, baseSize: p.baseSize, scale, slots };
}
