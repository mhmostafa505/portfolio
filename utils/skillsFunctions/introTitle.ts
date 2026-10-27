import { clamp, hexToRgb } from "./math";
import { letterColors } from "./skillLabel";
import { INTRO_TITLE } from "@/content/skillsContents";
import type { Skill } from "@/types/skillsTypes";

export interface TitleSlot {
  index: number;
  start: number;
  end: number;
}

interface Letters {
  chars: string[];
  widths: number[];
  total: number;
  colors: string[];
  strokeAlpha: number[];
  fillAlpha: number[];
  size: number;
}

// Dark colors get a bit more opacity so they don't look dull on a dark sky
function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export class IntroTitle {
  private readonly skills: Skill[];
  private readonly fontFamily: string;
  private readonly cache = new Map<number, Letters>();
  private slots: TitleSlot[] = [];
  private introEnd = 0;
  private centerX = 0;
  private centerY = 0;
  private maxWidth = 0;
  private maxHeight = 0;
  private unit = 1;

  constructor(canvas: HTMLCanvasElement, skills: Skill[]) {
    this.skills = skills;
    this.fontFamily = getComputedStyle(canvas).fontFamily || "sans-serif";
  }

  setSchedule(slots: TitleSlot[], introEnd: number) {
    this.slots = slots;
    this.introEnd = introEnd;
  }

  resize(
    centerX: number,
    centerY: number,
    maxWidth: number,
    maxHeight: number,
    unit: number,
  ) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.unit = unit;
    this.cache.clear();
  }

  // Draw it on the background canvas, after the stars and before the dust
  draw(ctx: CanvasRenderingContext2D, t: number) {
    if (this.slots.length === 0 || t < this.slots[0].start) return;

    let index: number;
    let appear: number;
    let fade = 1;
    const slot = this.slots.find((s) => t >= s.start && t < s.end);
    if (slot) {
      index = slot.index;
      appear =
        1 - Math.pow(1 - clamp((t - slot.start) / INTRO_TITLE.appear, 0, 1), 3);
    } else if (t >= this.introEnd) {
      index = this.slots[this.slots.length - 1].index;
      appear = 1;
      fade = 1 - clamp((t - this.introEnd) / INTRO_TITLE.fadeOut, 0, 1);
      if (fade <= 0) return;
    } else return;

    const letters = this.letters(ctx, index);
    const spread = 1 + (1 - appear) * INTRO_TITLE.spread;
    const grow = 1 + (1 - appear) * INTRO_TITLE.grow;

    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    ctx.font = `${INTRO_TITLE.weight} ${letters.size}px ${this.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = INTRO_TITLE.stroke * this.unit;

    let acc = 0;
    letters.chars.forEach((ch, k) => {
      const w = letters.widths[k];
      const x = (acc + w / 2 - letters.total / 2) * spread; // letters fly in from the middle
      acc += w;
      ctx.save();
      ctx.translate(x, 0);
      ctx.scale(grow, grow);
      ctx.strokeStyle = letters.colors[k];
      ctx.fillStyle = letters.colors[k];
      ctx.globalAlpha = appear * fade * letters.strokeAlpha[k];
      ctx.strokeText(ch, 0, 0);
      ctx.globalAlpha = appear * fade * letters.fillAlpha[k];
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private letters(ctx: CanvasRenderingContext2D, index: number): Letters {
    const cached = this.cache.get(index);
    if (cached) return cached;

    const skill = this.skills[index];
    const chars = [...skill.name];
    const size = Math.min(
      INTRO_TITLE.cap * this.unit,
      this.maxWidth / (chars.length * 0.58),
      this.maxHeight * 0.8,
    );

    ctx.save();
    ctx.font = `${INTRO_TITLE.weight} ${size}px ${this.fontFamily}`;
    const widths = chars.map((ch) => ctx.measureText(ch).width);
    ctx.restore();

    const colors = letterColors(skill, chars.length);
    const dark = colors.map((c) => 0.5 - luminance(c));
    const letters: Letters = {
      chars,
      widths,
      total: widths.reduce((a, b) => a + b, 0),
      colors,
      strokeAlpha: dark.map((d) =>
        clamp(INTRO_TITLE.strokeAlpha + d * 0.35, 0.5, 0.85),
      ),
      fillAlpha: dark.map((d) =>
        clamp(INTRO_TITLE.fillAlpha + d * 0.12, 0.06, 0.2),
      ),
      size,
    };
    this.cache.set(index, letters);
    return letters;
  }
}
