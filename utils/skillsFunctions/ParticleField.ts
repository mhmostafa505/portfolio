import { buildLayout } from "./skillsLayout";
import { clamp, damp, hexToRgb, mixRgb } from "./math";
import { Starfield } from "./Starfield";
import {
  FLOAT,
  CONTENT,
  HOVER,
  INTRO,
  POINTER,
  SAMPLE_SIZE,
  SPRING,
  STAR,
  STAGE,
} from "@/content/skillsContents";
import {
  FieldEvents,
  IconSample,
  IconState,
  LayoutMode,
  Particle,
  Rgb,
  Skill,
} from "@/types/skillsTypes";

export class ParticleField {
  private readonly bg: HTMLCanvasElement;
  private readonly fg: HTMLCanvasElement;
  private readonly skills: Skill[];
  private readonly events: FieldEvents;
  private readonly bgCtx: CanvasRenderingContext2D;
  private readonly fgCtx: CanvasRenderingContext2D;
  private readonly icons: IconState[];
  private readonly stars = new Starfield();
  private readonly order: number[] = [];

  private particles: Particle[] = [];
  private image: ImageData | null = null;
  private pixels: Uint32Array | null = null;

  private width = 0;
  private height = 0;
  private unit = 1;
  private time = 0;
  private introEnd = 0;
  private slamCursor = 0;
  private introDone = false;
  private started = false;
  private running = false;
  private raf = 0;
  private lastFrame = 0;

  private pointer: { x: number; y: number } | null = null;
  private cam = { x: 0, y: 0 };
  private hovered = -1;
  private speed: number = STAR.warpSpeed;
  private vp = { x: 0, y: 0 };
  private tint = 0;
  private tintRgb: Rgb = STAR.base;
  private dirty = { x0: 0, y0: 0, x1: 0, y1: 0 };

  constructor(
    bg: HTMLCanvasElement,
    fg: HTMLCanvasElement,
    skills: Skill[],
    events: FieldEvents,
  ) {
    const bgCtx = bg.getContext("2d");
    const fgCtx = fg.getContext("2d");
    if (!bgCtx || !fgCtx) throw new Error("Canvas 2D is not supported");
    this.bg = bg;
    this.fg = fg;
    this.skills = skills;
    this.events = events;
    this.bgCtx = bgCtx;
    this.fgCtx = fgCtx;
    this.icons = skills.map((skill) => ({
      skill,
      x: 0,
      y: 0,
      depth: 1,
      size: 0,
      fp: 0,
      block: 2,
      slamScale: 1,
      slamBlock: 4,
      hs: 1,
      ia: 1,
      tf: 0,
      ts: 1,
      cur: { x: 0, y: 0, r: 0 },
      cos: 1,
      sin: 0,
      alphaByte: 255,
      start: Number.POSITIVE_INFINITY,
      end: Number.POSITIVE_INFINITY,
    }));
    this.buildSchedule();
  }

  /* ----------------------------- public API ----------------------------- */

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.bg.width = this.fg.width = width;
    this.bg.height = this.fg.height = height;
    this.image = this.fgCtx.createImageData(width, height);
    this.pixels = new Uint32Array(this.image.data.buffer);
    this.dirty = { x0: width, y0: height, x1: 0, y1: 0 };

    // The canvas is full width. The icons are arranged inside a wide box in its middle.
    const mode: LayoutMode = width / height < 1 ? "mobile" : "desktop";
    // The navbar covers the top of the screen, so the icons are centred in the space below it
    const topInset = Math.min(STAGE.navOffset, height * 0.3);
    const areaH = height - topInset;
    const boxW = Math.min(width * CONTENT.widthRatio, CONTENT.maxWidth);
    const boxH = areaH * CONTENT.heightRatio;
    const layout = buildLayout(this.skills, mode, boxW, boxH);
    this.unit = layout.scale;
    const offsetX = (width - boxW) / 2;
    const offsetY = topInset + (areaH - boxH) / 2;
    const slamSize = layout.baseSize * this.unit * 2.4;

    for (const icon of this.icons) {
      const slot = layout.slots.find((s) => s.id === icon.skill.id);
      if (!slot) {
        icon.size = 0;
        continue;
      }
      icon.x = offsetX + slot.x * this.unit;
      icon.y = offsetY + slot.y * this.unit;
      icon.depth = slot.depth;
      icon.size = layout.baseSize * slot.depth * this.unit;
      icon.fp = icon.size / SAMPLE_SIZE;
      icon.block = Math.max(2, Math.ceil(icon.fp * 1.7));
      icon.slamScale = (slamSize / SAMPLE_SIZE) * (icon.skill.hero ? 1.25 : 1);
      icon.slamBlock = Math.ceil(icon.slamScale * 2);
      if (!this.started) {
        icon.cur.x = icon.x;
        icon.cur.y = icon.y;
      }
    }
    this.stars.resize(width, height);
    this.vp.x = width / 2;
    this.vp.y = height / 2;
  }

  setSamples(samples: IconSample[][]) {
    this.particles = [];
    samples.forEach((list, icon) => {
      for (const s of list) {
        this.particles.push({
          icon,
          ox: s.ox,
          oy: s.oy,
          color: s.color,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          delay: Math.random() * INTRO.slamSpread,
          phase: Math.random() * Math.PI * 2,
          ready: false,
        });
      }
    });
  }

  setPointer(point: { x: number; y: number } | null) {
    this.pointer = point;
  }

  /** Starts the intro the first time, then just resumes after a pause. */
  start() {
    if (!this.started) {
      this.started = true;
      this.time = 0;
      this.events.onStart();
    }
    this.resume();
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy() {
    this.pause();
  }

  /* ------------------------------ internals ----------------------------- */

  private resume() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    this.update(dt);
    this.raf = requestAnimationFrame(this.frame);
  };

  private buildSchedule() {
    // Skills load in the order of the SKILLS list. The hero always goes last.
    const all = this.skills.map((_, i) => i);
    const regular = all.filter((i) => !this.skills[i].hero);
    const order = [...regular, ...all.filter((i) => this.skills[i].hero)];
    const slot = clamp(
      INTRO.budget / Math.max(1, regular.length),
      INTRO.minSlot,
      INTRO.slot,
    );

    let t = INTRO.start;
    for (const index of order) {
      const duration = this.skills[index].hero ? INTRO.heroSlot : slot;
      this.icons[index].start = t;
      this.icons[index].end = t + duration;
      this.order.push(index);
      t += duration;
    }
    this.introEnd = t;
  }

  private update(dt: number) {
    if (!this.started || !this.image || !this.pixels) return;
    this.time += dt;
    const t = this.time;

    this.advanceIntro(t);
    const live = t > this.introEnd + INTRO.liveDelay;

    const p = this.pointer;
    this.cam.x = damp(this.cam.x, p ? p.x - this.width / 2 : 0, 3.6, dt);
    this.cam.y = damp(this.cam.y, p ? p.y - this.height / 2 : 0, 3.6, dt);

    this.updateHover(live);
    this.updateIcons(dt);
    this.drawBackground(dt, t);
    this.drawParticles(dt, t, live, this.image, this.pixels);
  }

  private advanceIntro(t: number) {
    while (
      this.slamCursor < this.order.length &&
      t >= this.icons[this.order[this.slamCursor]].start
    ) {
      const index = this.order[this.slamCursor];
      this.events.onSlam(this.skills[index], this.slamCursor);
      this.slamCursor++;
    }
    if (!this.introDone && t >= this.introEnd) {
      this.introDone = true;
      this.events.onIntroEnd();
    }
  }

  private updateHover(live: boolean) {
    const p = this.pointer;
    let next = -1;
    if (live && p) {
      let best = Infinity;
      this.icons.forEach((icon, i) => {
        if (icon.size === 0) return;
        const d = Math.hypot(p.x - icon.cur.x, p.y - icon.cur.y);
        if (d < icon.size * 0.5 * icon.hs + 4 && d < best) {
          best = d;
          next = i;
        }
      });
    }
    if (next === this.hovered) return;
    this.hovered = next;
    if (next >= 0) this.tintRgb = hexToRgb(this.skills[next].color);
    this.events.onHover(next >= 0 ? next : null);
  }

  private updateIcons(dt: number) {
    this.icons.forEach((icon, i) => {
      const isHovered = i === this.hovered;
      icon.ts = damp(icon.ts, isHovered ? HOVER.floatSlowdown : 1, 6, dt);
      icon.tf += dt * icon.ts;
      const wave = Math.sin(
        ((Math.PI * 2) / (FLOAT.period + i * FLOAT.periodStep)) * icon.tf,
      );
      icon.cur.x = icon.x - this.cam.x * icon.depth * 0.05;
      icon.cur.y =
        icon.y +
        FLOAT.amplitude * this.unit * wave -
        this.cam.y * icon.depth * 0.05;
      icon.cur.r = FLOAT.rotation * wave;
      icon.hs = damp(icon.hs, isHovered ? HOVER.scale : 1, 8, dt);
      icon.ia = damp(
        icon.ia,
        this.hovered >= 0 && !isHovered ? HOVER.dimAlpha : 1,
        8,
        dt,
      );
    });
  }

  private drawBackground(dt: number, t: number) {
    const warp = t < this.introEnd;
    const target = warp
      ? STAR.warpSpeed
      : this.hovered >= 0
        ? STAR.hoverSpeed
        : STAR.idleSpeed;
    this.speed = damp(this.speed, target, warp ? 20 : 3, dt);

    // The camera flies toward the hovered skill: stars radiate from it.
    const focus =
      this.hovered >= 0
        ? this.icons[this.hovered].cur
        : { x: this.width / 2, y: this.height / 2 };
    this.vp.x = damp(this.vp.x, focus.x, 4.8, dt);
    this.vp.y = damp(this.vp.y, focus.y, 4.8, dt);
    this.tint = damp(this.tint, this.hovered >= 0 ? 1 : 0, 5, dt);

    this.bgCtx.clearRect(0, 0, this.width, this.height);
    this.stars.draw(
      this.bgCtx,
      this.vp.x,
      this.vp.y,
      this.speed,
      dt,
      mixRgb(STAR.base, this.tintRgb, this.tint),
      clamp(t / 0.5, 0, 1), // stars fade in: no flicker, no flash
    );
  }

  private drawParticles(
    dt: number,
    t: number,
    live: boolean,
    image: ImageData,
    pixels: Uint32Array,
  ) {
    const W = this.width;
    const H = this.height;
    const cx = W / 2;
    const cy = H / 2;
    const pdt = Math.min(dt, 0.033);
    const eSlam = Math.exp(-SPRING.slam.damp * pdt);
    const eFly = Math.exp(-SPRING.fly.damp * pdt);
    const eLive = Math.exp(-SPRING.live.damp * pdt);
    const pointer = live ? this.pointer : null;
    const radius = POINTER.radius * this.unit;
    const radius2 = radius * radius;
    const strength = POINTER.strength * this.unit;

    for (const icon of this.icons) {
      icon.cos = Math.cos(icon.cur.r);
      icon.sin = Math.sin(icon.cur.r);
      icon.alphaByte = Math.round(icon.ia * 255);
    }

    // Only clear what was drawn last frame (the canvas is much bigger now)
    const prev = this.dirty;
    for (let y = Math.max(0, prev.y0); y < Math.min(H, prev.y1); y++) {
      pixels.fill(
        0,
        y * W + Math.max(0, prev.x0),
        y * W + Math.min(W, prev.x1),
      );
    }

    let minX = W;
    let minY = H;
    let maxX = 0;
    let maxY = 0;

    for (const p of this.particles) {
      const icon = this.icons[p.icon];
      if (icon.size === 0 || t < icon.start) continue;

      if (!p.ready) {
        p.ready = true;
        const angle = Math.random() * Math.PI * 2;
        const dist = (0.22 + Math.random() * 0.21) * W;
        p.x = cx + Math.cos(angle) * dist;
        p.y = cy + Math.sin(angle) * dist;
        p.vx = 0;
        p.vy = 0;
      }

      const slamming = t < icon.end + p.delay;
      let tx: number;
      let ty: number;
      let k: number;
      let damping: number;

      if (slamming) {
        // Big logo in the middle of the screen
        tx = cx + p.ox * icon.slamScale;
        ty = cy + p.oy * icon.slamScale;
        k = SPRING.slam.k;
        damping = eSlam;
      } else {
        const s = icon.fp * icon.hs;
        tx =
          icon.cur.x +
          (p.ox * icon.cos - p.oy * icon.sin) * s +
          Math.sin(t * 1.8 + p.phase) * 0.5;
        ty =
          icon.cur.y +
          (p.ox * icon.sin + p.oy * icon.cos) * s +
          Math.cos(t * 1.6 + p.phase) * 0.5;
        const flying = t - icon.end < SPRING.fly.duration;
        k = flying ? SPRING.fly.k : SPRING.live.k;
        damping = flying ? eFly : eLive;
      }

      p.vx += (tx - p.x) * k * pdt;
      p.vy += (ty - p.y) * k * pdt;

      if (pointer) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < radius2) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / radius) * strength * pdt;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
      }

      p.vx *= damping;
      p.vy *= damping;
      p.x += p.vx * pdt;
      p.y += p.vy * pdt;

      const block = t < icon.end + p.delay + 0.05 ? icon.slamBlock : icon.block;
      const ix = p.x | 0;
      const iy = p.y | 0;
      if (ix < 0 || iy < 0 || ix + block >= W || iy + block >= H) continue;
      if (ix < minX) minX = ix;
      if (iy < minY) minY = iy;
      if (ix + block > maxX) maxX = ix + block;
      if (iy + block > maxY) maxY = iy + block;

      const color = ((icon.alphaByte << 24) | p.color) >>> 0;
      for (let a = 0; a < block; a++) {
        const row = (iy + a) * W + ix;
        for (let b = 0; b < block; b++) pixels[row + b] = color;
      }
    }

    const x0 = Math.max(0, Math.min(prev.x0, minX));
    const y0 = Math.max(0, Math.min(prev.y0, minY));
    const x1 = Math.min(W, Math.max(prev.x1, maxX));
    const y1 = Math.min(H, Math.max(prev.y1, maxY));
    if (x1 > x0 && y1 > y0)
      this.fgCtx.putImageData(image, 0, 0, x0, y0, x1 - x0, y1 - y0);
    this.dirty = { x0: minX, y0: minY, x1: maxX, y1: maxY };
  }
}
