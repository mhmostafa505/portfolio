import { SCROLL } from "@/content/skillsContents";

const CANCEL_EVENTS = ["wheel", "touchstart", "keydown", "mousedown"] as const;

// Scroll position that centres the stage in the window
export const getAlignTarget = (stage: HTMLElement) => {
  const rect = stage.getBoundingClientRect();
  const spare = Math.max(0, (window.innerHeight - rect.height) / 2);
  return Math.max(0, rect.top + window.scrollY - spare);
};

const jumpTo = (y: number) =>
  window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });

// Eased scroll that stops the moment the user touches the page. Returns a cancel function
export function animateScrollTo(target: number, duration: number): () => void {
  const start = window.scrollY;
  const distance = target - start;
  if (Math.abs(distance) < SCROLL.tolerance) return () => {};

  if (
    duration <= 0 ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    jumpTo(target);
    return () => {};
  }

  let raf = 0;
  const startTime = performance.now();

  const stop = () => {
    cancelAnimationFrame(raf);
    CANCEL_EVENTS.forEach((name) => window.removeEventListener(name, stop));
  };

  const step = (now: number) => {
    const t = Math.min(1, (now - startTime) / duration);
    jumpTo(start + distance * (1 - Math.pow(1 - t, 3)));
    if (t < 1) raf = requestAnimationFrame(step);
    else stop();
  };

  CANCEL_EVENTS.forEach((name) =>
    window.addEventListener(name, stop, { passive: true }),
  );
  raf = requestAnimationFrame(step);
  return stop;
}

// Calls onIdle shortly after the page stops scrolling (and once right after mounting)
export function onScrollIdle(
  onIdle: () => void,
  delay: number = SCROLL.idleMs,
): () => void {
  let timer = 0;
  const arm = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(onIdle, delay);
  };
  window.addEventListener("scroll", arm, { passive: true });
  arm();
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("scroll", arm);
  };
}
