import { clamp } from "./math";

interface Star {
  angle: number;
  radius: number;
}

export class Starfield {
  private stars: Star[] = [];
  private maxRadius = 1;

  resize(width: number, height: number) {
    this.maxRadius = Math.hypot(width, height) * 0.6;
    const count = clamp(Math.round((width * height) / 3500), 120, 520);
    while (this.stars.length < count) this.stars.push(this.spawn(true));
    this.stars.length = Math.min(this.stars.length, count);
  }

  private spawn(initial: boolean): Star {
    return {
      angle: Math.random() * Math.PI * 2,
      radius: initial
        ? 6 + Math.random() * this.maxRadius
        : 4 + Math.random() * 30,
    };
  }

  draw(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    speed: number,
    dt: number,
    color: string,
    alpha: number,
  ) {
    const grow = Math.exp(speed * dt);
    const tail = Math.exp(-Math.min(speed, 3) * 0.1);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;

    for (const star of this.stars) {
      star.radius *= grow;
      if (star.radius > this.maxRadius) {
        star.radius = 4 + Math.random() * 30;
        star.angle = Math.random() * Math.PI * 2;
      }
      const r1 = star.radius;
      const r0 = r1 - Math.max(1.5, r1 * (1 - tail));
      const cos = Math.cos(star.angle);
      const sin = Math.sin(star.angle);
      ctx.globalAlpha = Math.min(1, r1 / 150) * alpha;
      ctx.beginPath();
      ctx.moveTo(cx + cos * r0, cy + sin * r0);
      ctx.lineTo(cx + cos * r1, cy + sin * r1);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
