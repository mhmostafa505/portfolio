import { type StaticImageData } from "next/image";
import { GalleryImage } from "@/types/myProjectsTypes";

export const getMaxBox = () => ({
  w: Math.min(960, window.innerWidth * 0.9),
  h: Math.max(160, window.innerHeight - 236),
});

// biggest box with the image's own ratio that fits inside max
export const fit = (img: StaticImageData, max: { w: number; h: number }) => {
  const ratio = img.width / img.height;
  const w = Math.min(max.w, max.h * ratio);
  return { w, h: w / ratio };
};

// Close Animation Function for Gallery
export const playCloseAnimation = (
  inner: HTMLDivElement,
  c0: string,
  c1: string,
  reduce: boolean,
  onClose: () => void,
  CLOSE_MS: number,
  CLOSE_EASE: string,
) => {
  inner.style.clipPath = c1;

  inner.querySelectorAll<HTMLElement>("[data-gal-ui]").forEach((el) =>
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: reduce ? 1 : 160,
      fill: "forwards",
    }),
  );

  inner
    .animate([{ clipPath: c1 }, { clipPath: c0 }], {
      duration: reduce ? 1 : CLOSE_MS,
      easing: CLOSE_EASE,
      fill: "forwards",
    })
    .finished.then(onClose)
    .catch(() => {});
};

// Magnifier Functions
export const moveLens = (
  e: React.MouseEvent<HTMLButtonElement>,
  w: number,
  h: number,
  lensRef: React.RefObject<HTMLSpanElement | null>,
  LENS_SIZE: number,
  LENS_ZOOM: number,
) => {
  const lens = lensRef.current;
  if (!lens) return;
  const r = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * w;
  const y = ((e.clientY - r.top) / r.height) * h;
  lens.style.opacity = "1";
  lens.style.transform = `translate(${x - LENS_SIZE / 2}px, ${y - LENS_SIZE / 2}px)`;
  lens.style.backgroundPosition = `${LENS_SIZE / 2 - x * LENS_ZOOM}px ${LENS_SIZE / 2 - y * LENS_ZOOM}px`;
};

export const hideLens = (lensRef: React.RefObject<HTMLSpanElement | null>) => {
  if (lensRef.current) lensRef.current.style.opacity = "0";
};

// Opening Animation Function for Gallery
export const playOpenAnimation = (
  wipe: HTMLDivElement,
  inner: HTMLDivElement,
  c0: string,
  c1: string,
  reduce: boolean,
  refreshCursor: () => void,
  pending: React.RefObject<boolean>,
  phase: React.RefObject<"opening" | "open" | "closing">,
  close: () => void,
  OPEN_MS: number,
  OPEN_EASE: string,
) => {
  const t = reduce ? 1 : OPEN_MS;
  const anims: Animation[] = [];

  // Animate the background wipe
  anims.push(
    wipe.animate([{ clipPath: c0 }, { clipPath: c1 }], {
      duration: t,
      easing: OPEN_EASE,
      fill: "forwards",
    }),
  );

  // Animate the gallery layer
  const innerAnim = inner.animate([{ clipPath: c0 }, { clipPath: c1 }], {
    duration: t,
    delay: reduce ? 0 : 140,
    easing: OPEN_EASE,
    fill: "forwards",
  });

  anims.push(innerAnim);

  // Fade in the gallery UI
  inner.querySelectorAll<HTMLElement>("[data-gal-ui]").forEach((el) =>
    anims.push(
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: reduce ? 1 : 320,
        delay: reduce ? 0 : 440,
        fill: "backwards",
      }),
    ),
  );

  // Finalize the opening animation
  innerAnim.finished
    .then(() => {
      inner.style.clipPath = "none";
      wipe.style.display = "none";
      anims.forEach((a) => a.cancel());
      phase.current = "open";
      refreshCursor();
      if (pending.current) {
        pending.current = false;
        close();
      }
    })
    .catch(() => {});

  // Return cleanup for useEffect
  return () => anims.forEach((a) => a.cancel());
};

// Keyboard Functionality for Gallery
export const onKey = (
  e: KeyboardEvent,
  phase: React.RefObject<"opening" | "open" | "closing">,
  step: (d: number) => void,
  images: GalleryImage[],
  innerRef: React.RefObject<HTMLDivElement | null>,
  close: () => void,
) => {
  if (phase.current === "closing") return;
  if (e.key === "Escape") {
    e.preventDefault();
    close();
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    step(1);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    step(-1);
  } else if (e.key === "Home") {
    e.preventDefault();
    step(-images.length);
  } else if (e.key === "End") {
    e.preventDefault();
    step(images.length);
  } else if (e.key === "Tab") {
    const f = [
      ...(innerRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled])",
      ) ?? []),
    ];

    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) {
      e.preventDefault();
      f[f.length - 1].focus();
    } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
      e.preventDefault();
      f[0].focus();
    }
  }
};
