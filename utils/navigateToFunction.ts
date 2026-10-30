const TRACK = "[data-projects-track]";
const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);
let latest = 0;
let chain: Promise<unknown> = Promise.resolve();
let stopCurrent: (() => void) | null = null;

const absTop = (el: HTMLElement) =>
  el.getBoundingClientRect().top + window.scrollY;

// where the page should be scrolled to for this element (like scrollIntoView block: "start")
const topOf = (el: HTMLElement, extra: number) =>
  absTop(el) -
  (parseFloat(getComputedStyle(el).scrollMarginTop) || 0) -
  (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
    0) -
  extra;

// resolves when the page has stopped moving
const waitForScrollEnd = (maxMs = 3500) =>
  new Promise<void>((resolve) => {
    const start = performance.now();
    let last = window.scrollY;
    let since = start;
    let moved = false;
    const tick = (now: number) => {
      if (window.scrollY !== last) {
        last = window.scrollY;
        since = now;
        moved = true;
      }
      if (
        (moved && now - since > 120) ||
        (!moved && now - start > 400) ||
        now - start > maxMs
      )
        return resolve();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

// the user scrolls by hand (or another click happens): stop the smooth scroll right where it is
function watchForTakeover() {
  let done: () => void = () => {};
  const promise = new Promise<void>((resolve) => {
    done = resolve;
  });
  const stop = () => {
    window.scrollTo({ top: window.scrollY, behavior: "instant" });
    done();
  };
  const onInput = (e: Event) => {
    if (e instanceof KeyboardEvent && !SCROLL_KEYS.has(e.key)) return;
    if (e.type === "mousedown" && e.target !== document.documentElement) return; // only the scrollbar
    stop();
  };
  const events = ["wheel", "touchstart", "mousedown", "keydown"] as const;
  events.forEach((ev) =>
    window.addEventListener(ev, onInput, { passive: true }),
  );
  return {
    promise,
    stop,
    off: () => events.forEach((ev) => window.removeEventListener(ev, onInput)),
  };
}

async function go(
  target: HTMLElement | number,
  extra: number,
  settle: () => Promise<unknown>,
) {
  const behavior: ScrollBehavior = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches
    ? "instant"
    : "smooth";
  const getY = () =>
    typeof target === "number" ? target : topOf(target, extra);
  const plain = async () => {
    window.scrollTo({ top: getY(), behavior });
    await settle();
  };

  const track = document.querySelector<HTMLElement>(TRACK);
  if (!track || (typeof target !== "number" && track.contains(target)))
    return plain();

  const vh = window.innerHeight;
  const trackTop = absTop(track);
  const pinEnd = trackTop + track.offsetHeight - vh; // after this the track has finished pinning
  const y0 = window.scrollY;
  const y1 = getY();

  // skip the scroll lock whenever the way to the target goes through the projects section, or starts inside it
  const passesThrough =
    Math.min(y0, y1) < pinEnd && Math.max(y0, y1) > trackTop;
  if (!passesThrough) return plain();

  const html = document.documentElement;
  html.style.overflowAnchor = "none"; // so the browser doesn't also adjust the scroll by itself
  html.dataset.navigating = "true"; // hides the scrollbar thumb while the page height changes
  const toStart = y1 <= trackTop + vh * 0.5; // going to / before the section, or after it?
  let collapsedHeight = html.scrollHeight;

  try {
    // 1. collapse the tall track
    const before = html.scrollHeight;
    track.dataset.skip = toStart ? "start" : "end";
    window.dispatchEvent(new Event("scroll")); // shows the right project right away
    collapsedHeight = html.scrollHeight; // reading this forces the new layout
    if (y0 >= pinEnd) {
      // we are below the track: move up by the same amount so the screen looks identical
      window.scrollTo({
        top: y0 - (before - collapsedHeight),
        behavior: "instant",
      });
    } else if (y0 > trackTop) {
      // we are inside the pinned part: the collapsed section is one screen tall, and its top looks exactly like the pinned box, so the screen stays the same
      window.scrollTo({ top: trackTop, behavior: "instant" });
    }

    // 2. scroll to the target (the section is only one screen tall now)
    await plain();
  } finally {
    // 3. expand the track again, and keep the screen still
    const endedBelow =
      window.scrollY >= absTop(track) + window.innerHeight * 0.5;
    track.removeAttribute("data-skip");
    const grown = html.scrollHeight - collapsedHeight;
    if (endedBelow) {
      window.scrollTo({ top: window.scrollY + grown, behavior: "instant" });
    }

    html.style.overflowAnchor = "";
    html.removeAttribute("data-navigating");

    window.dispatchEvent(new Event("scroll")); // normal behavior is back: the project follows the real position
  }
}

async function run(target: HTMLElement | number, extra: number) {
  const watch = watchForTakeover();
  stopCurrent = watch.stop;
  try {
    await go(target, extra, () =>
      Promise.race([waitForScrollEnd(), watch.promise]),
    );
  } finally {
    watch.off();
    if (stopCurrent === watch.stop) stopCurrent = null;
  }
}

/**
 * target: the section element, or a number like 0 for "top of the page"
 * extra: extra px to stop above the target (for example a fixed navbar height)
 * Returns a promise that resolves when the page has stopped moving.
 * A new call stops the one that is still running, and only the last call runs.
 */
export function navigateTo(target: HTMLElement | number, extra = 0) {
  const id = ++latest;
  stopCurrent?.();
  chain = chain
    .then(() => (id === latest ? run(target, extra) : undefined))
    .catch(() => {});
  return chain;
}
