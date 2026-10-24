const TRACK = "[data-projects-track]";
let latest = 0;
let chain: Promise<unknown> = Promise.resolve();

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

async function run(target: HTMLElement | number, extra: number) {
  const behavior: ScrollBehavior = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches
    ? "instant"
    : "smooth";
  const getY = () =>
    typeof target === "number" ? target : topOf(target, extra);
  const plain = async () => {
    window.scrollTo({ top: getY(), behavior });
    await waitForScrollEnd();
  };

  const track = document.querySelector<HTMLElement>(TRACK);
  if (
    !track ||
    (typeof target !== "number" &&
      (target.contains(track) || track.contains(target)))
  )
    return plain();

  const vh = window.innerHeight;
  const trackTop = absTop(track);
  const pinEnd = trackTop + track.offsetHeight - vh; // after this the track has finished pinning
  const y0 = window.scrollY;
  const y1 = getY();

  // only when the jump goes from one side of the projects section to the other
  const crossing =
    (y0 <= trackTop && y1 >= pinEnd) || (y0 >= pinEnd && y1 <= trackTop);
  if (!crossing) return plain();

  const html = document.documentElement;
  html.style.overflowAnchor = "none"; // so the browser doesn't also adjust the scroll by itself
  let collapsedHeight = html.scrollHeight;

  try {
    // 1. collapse the tall track
    const before = html.scrollHeight;
    track.dataset.skip = "true";
    collapsedHeight = html.scrollHeight; // reading this forces the new layout
    if (y0 >= pinEnd) {
      // we are below the track: move up by the same amount so the screen looks identical
      window.scrollTo({
        top: y0 - (before - collapsedHeight),
        behavior: "instant",
      });
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
  }
}

/**
 * target: the section element, or a number like 0 for "top of the page"
 * extra: extra px to stop above the target (for example a fixed navbar height)
 * Returns a promise that resolves when the page has stopped moving.
 * If you call it again quickly, only the last call runs.
 */
export function navigateTo(target: HTMLElement | number, extra = 0) {
  const id = ++latest;
  chain = chain
    .then(() => (id === latest ? run(target, extra) : undefined))
    .catch(() => {});
  return chain;
}
