import { SEND_BUTTON_FX } from "@/content/contactMeContents";

export type ButtonPoint = { x: number; y: number; w: number; h: number };

// Turns a mouse position into a position inside the button
export const getButtonPoint = (
  button: HTMLElement,
  e: { clientX: number; clientY: number },
): ButtonPoint => {
  const rect = button.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    w: rect.width,
    h: rect.height,
  };
};

// Controls the teal circle: grows from where the mouse enters, slides out with the mouse
export const createRipple = (layer: HTMLElement) => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const now = { x: 0, y: 0, r: 0 };
  const goal = { x: 0, y: 0, r: 0 };
  let frame = 0;
  let lastTime = 0;

  // Draws the circle at its current position and size
  const paint = () => {
    layer.style.clipPath = `circle(${now.r.toFixed(1)}px at ${now.x.toFixed(1)}px ${now.y.toFixed(1)}px)`;
  };

  // Moves the circle a little closer to its goal every frame (never jumps)
  const tick = (time: number) => {
    const dt = Math.min(0.05, (time - lastTime) / 1000 || 0.016);
    lastTime = time;
    const growing = goal.r > now.r;
    const radiusEase =
      1 -
      Math.exp(
        -dt *
          (growing
            ? SEND_BUTTON_FX.rippleGrowSpeed
            : SEND_BUTTON_FX.rippleShrinkSpeed),
      );
    const moveEase = 1 - Math.exp(-dt * SEND_BUTTON_FX.rippleMoveSpeed);

    now.r += (goal.r - now.r) * radiusEase;
    now.x += (goal.x - now.x) * moveEase;
    now.y += (goal.y - now.y) * moveEase;

    if (goal.r === 0 && now.r < 0.6) {
      now.r = 0;
      paint();
      frame = 0;
      return;
    }

    const arrived =
      Math.abs(goal.r - now.r) < 0.5 &&
      Math.abs(goal.x - now.x) < 0.5 &&
      Math.abs(goal.y - now.y) < 0.5;

    paint();
    frame = arrived ? 0 : requestAnimationFrame(tick);
  };

  const start = () => {
    if (frame) return;
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  };

  return {
    // Mouse entered: circle grows from the entry point until it covers the button
    enter: (p: ButtonPoint) => {
      const fullRadius =
        Math.hypot(Math.max(p.x, p.w - p.x), Math.max(p.y, p.h - p.y)) + 2;
      if (now.r < 2) {
        now.x = p.x;
        now.y = p.y;
      }
      goal.x = p.x;
      goal.y = p.y;
      goal.r = fullRadius;
      if (reduceMotion) {
        now.x = p.x;
        now.y = p.y;
        now.r = fullRadius;
        paint();
      } else {
        start();
      }
    },
    // Mouse left: circle shrinks while sliding toward the exit point
    leave: (p: ButtonPoint) => {
      goal.x = p.x;
      goal.y = p.y;
      goal.r = 0;
      if (reduceMotion) {
        now.r = 0;
        paint();
      } else {
        start();
      }
    },
    destroy: () => cancelAnimationFrame(frame),
  };
};
