import { clamp } from "./math";
import { LABEL } from "@/content/skillsContents";
import type { IconState, Skill } from "@/types/skillsTypes";

interface Dot {
  x: number;
  y: number;
  size: number;
  color: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

// One skill's name as particles, in the order the pen writes them
interface Name {
  dots: Dot[];
  width: number;
  inkTop: number;
  inkBottom: number;
}

const END = LABEL.approach + LABEL.duration;
const PROBE = 4; // the letters are measured at 4x, so the particles follow the letter shapes closely

// The color of each letter. A list is spread over the letters (5 colors on "Figma" = one each)
function letterColors(skill: Skill, count: number): string[] {
  const colors = skill.labelColors?.length ? skill.labelColors : [skill.color];
  return Array.from(
    { length: count },
    (_, k) =>
      colors[
        Math.min(colors.length - 1, Math.floor((k / count) * colors.length))
      ],
  );
}

export class SkillLabel {
  private readonly canvas: HTMLCanvasElement;
  private readonly skills: Skill[];
  private readonly ctx: CanvasRenderingContext2D;
  private readonly fontFamily: string;
  private readonly cache = new Map<number, Name>();

  private sparks: Spark[] = [];
  private dpr = 1;
  private width = 0;
  private height = 0;
  private fontSize: number = LABEL.size;
  private active = -1;
  private time = 0;

  constructor(canvas: HTMLCanvasElement, skills: Skill[]) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is not supported");
    this.canvas = canvas;
    this.skills = skills;
    this.ctx = ctx;
    this.fontFamily = getComputedStyle(canvas).fontFamily || "sans-serif";
  }

  resize(width: number, height: number, unit: number) {
    this.width = width;
    this.height = height;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.fontSize = LABEL.size * clamp(unit, 0.85, 1.35);
    this.cache.clear();
  }

  // Once per frame. hovered = index of the skill under the cursor, or -1
  draw(dt: number, hovered: number, icons: IconState[]) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // One clock, capped at the end of the writing: leaving starts the erase instantly.
    if (hovered >= 0) {
      if (hovered !== this.active) {
        this.active = hovered;
        this.time = 0;
        this.sparks = [];
      }
      this.time = Math.min(END, this.time + dt);
    } else {
      this.time = Math.max(0, this.time - dt * LABEL.eraseSpeed);
      if (this.time === 0) this.active = -1;
    }

    if (this.active >= 0 && this.time > 0)
      this.drawName(dt, icons[this.active]);
    this.drawSparks(dt);
  }

  private snap(value: number) {
    return Math.round(value * this.dpr) / this.dpr;
  }

  private drawName(dt: number, icon: IconState) {
    const name = this.build(this.active);
    if (!name || name.dots.length === 0) return;
    const { dots, width, inkTop, inkBottom } = name;

    // Below the top icons, above the bottom ones. The gap is measured from the letters themselves.
    const half = (icon.size * icon.hs) / 2;
    const below = icon.cur.y <= this.height * 0.6;
    const left =
      clamp(icon.cur.x, width / 2 + 8, this.width - width / 2 - 8) - width / 2;
    const top = below
      ? icon.cur.y + half + LABEL.gap - inkTop
      : icon.cur.y - half - LABEL.gap - inkBottom;

    const progress = clamp((this.time - LABEL.approach) / LABEL.duration, 0, 1);
    const count = Math.floor(progress * dots.length);

    const ctx = this.ctx;
    let color = "";
    for (let i = 0; i < count; i++) {
      const d = dots[i];
      if (d.color !== color) {
        color = d.color;
        ctx.fillStyle = color;
      }
      ctx.fillRect(
        this.snap(left + d.x - d.size / 2),
        this.snap(top + d.y - d.size / 2),
        d.size,
        d.size,
      );
    }

    // The spark
    const approaching = this.time < LABEL.approach;
    if (!approaching && (progress <= 0 || progress >= 1)) return;

    let x: number;
    let y: number;
    let sparkColor: string;
    if (approaching) {
      const f = this.time / LABEL.approach;
      const first = dots[0];
      x = icon.cur.x + (left + first.x - icon.cur.x) * f;
      y = icon.cur.y + (top + first.y - icon.cur.y) * f;
      sparkColor = first.color;
    } else {
      const p = dots[Math.min(count, dots.length - 1)];
      x = left + p.x;
      y = top + p.y;
      sparkColor = p.color;
    }

    ctx.globalAlpha = 0.45;
    ctx.fillStyle = sparkColor;
    ctx.fillRect(x - 5, y - 5, 10, 10);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffe3";
    ctx.fillRect(x - 2.5, y - 2.5, 5, 5);

    const burst = Math.max(1, Math.round(dt * LABEL.sparksPerSecond));
    for (let i = 0; i < burst; i++) {
      this.sparks.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 170,
        vy: (Math.random() - 0.5) * 170 - 30,
        life: LABEL.sparkLife,
        color: sparkColor,
      });
    }
    if (this.sparks.length > 300)
      this.sparks.splice(0, this.sparks.length - 300);
  }

  private drawSparks(dt: number) {
    const ctx = this.ctx;
    this.sparks = this.sparks.filter((s) => {
      s.life -= dt;
      if (s.life <= 0) return false;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      ctx.globalAlpha = s.life / LABEL.sparkLife;
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, 2, 2);
      return true;
    });
    ctx.globalAlpha = 1;
  }

  // Turns a skill's name into particles, ordered the way a pen would write them
  private build(index: number): Name | null {
    const cached = this.cache.get(index);
    if (cached) return cached;

    const chars = [...this.skills[index].name];
    const font = `${LABEL.weight} ${this.fontSize}px ${this.fontFamily}`;
    const probe = document.createElement("canvas");
    const pctx = probe.getContext("2d", { willReadFrequently: true });
    if (!pctx) return null;

    pctx.font = font;
    const widths = chars.map((ch) => pctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0);
    const pad = 4;
    const width = Math.ceil(total + pad * 2);
    const height = Math.ceil(this.fontSize * 1.5);

    // Draw the letters large, then look at them every dotStep px
    probe.width = width * PROBE;
    probe.height = height * PROBE;
    pctx.scale(PROBE, PROBE);
    pctx.font = font;
    pctx.textBaseline = "middle";
    pctx.fillStyle = "#fff";
    let x = pad;
    chars.forEach((ch, k) => {
      pctx.fillText(ch, x, height / 2);
      x += widths[k];
    });
    const { data } = pctx.getImageData(0, 0, probe.width, probe.height);

    const colors = letterColors(this.skills[index], chars.length);
    const edges: number[] = [];
    let edge = pad;
    widths.forEach((w) => {
      edge += w;
      edges.push(edge);
    });

    const stride = Math.max(1, Math.round(LABEL.dotStep * PROBE));
    const points: Dot[] = [];
    for (let py = 0; py < probe.height; py += stride) {
      for (let px = 0; px < probe.width; px += stride) {
        if (data[(py * probe.width + px) * 4 + 3] < 128) continue;
        const dx = px / PROBE;
        let k = 0;
        while (k < edges.length - 1 && dx > edges[k]) k++;
        points.push({
          x: dx,
          y: py / PROBE,
          size: LABEL.dotSize * (0.9 + (0.2 * ((px * 7 + py * 13) % 10)) / 10),
          color: colors[k],
        });
      }
    }

    // Pen order: start at the left, always go to the nearest particle not written yet
    const used = new Uint8Array(points.length);
    const dots: Dot[] = [];
    let current = 0;
    let leftmost = Infinity;
    points.forEach((p, k) => {
      if (p.x < leftmost) {
        leftmost = p.x;
        current = k;
      }
    });
    for (let step = 0; step < points.length; step++) {
      used[current] = 1;
      dots.push(points[current]);
      let best = -1;
      let bestDist = Infinity;
      for (let k = 0; k < points.length; k++) {
        if (used[k]) continue;
        const ddx = points[k].x - points[current].x;
        const ddy = points[k].y - points[current].y;
        const d = ddx * ddx + ddy * ddy;
        if (d < bestDist) {
          bestDist = d;
          best = k;
        }
      }
      if (best < 0) break;
      current = best;
    }

    const name: Name = {
      dots,
      width,
      inkTop: Math.min(...dots.map((d) => d.y - d.size / 2)),
      inkBottom: Math.max(...dots.map((d) => d.y + d.size / 2)),
    };
    this.cache.set(index, name);
    return name;
  }
}
