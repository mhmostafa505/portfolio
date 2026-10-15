"use client";

import Image, { type StaticImageData } from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  GalleryImage,
  MyProjectsContentsType,
  ThemeColor,
} from "@/types/myProjectsTypes";
import {
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";

const OPEN_MS = 600; // circle wipe in
const CLOSE_MS = 520; // circle wipe out
const OPEN_EASE = "cubic-bezier(.55,0,.2,1)";
const CLOSE_EASE = "cubic-bezier(.6,0,.4,1)";
const SLIDE_GAP = 28; // px between photos in the film strip
const LENS = true; // false removes the magnifier
const LENS_SIZE = 230; // px
const LENS_ZOOM = 1.5; // how much it magnifies

interface MyProjectsGalleryType {
  images: GalleryImage[];
  projectName: string;
  theme: MyProjectsContentsType["themes"][ThemeColor];
  originRef: React.RefObject<HTMLElement | null>; // the cover: the circle grows from it
  onClose: () => void; // called AFTER the close animation
}

const pad = (n: number) => String(n).padStart(2, "0");

const getMaxBox = () => ({
  w: Math.min(960, window.innerWidth * 0.9),
  h: Math.max(160, window.innerHeight - 236),
});

// biggest box with the image's own ratio that fits inside max
const fit = (img: StaticImageData, max: { w: number; h: number }) => {
  const ratio = img.width / img.height;
  const w = Math.min(max.w, max.h * ratio);
  return { w, h: w / ratio };
};

const MyProjectsGallery = ({
  images,
  projectName,
  theme,
  originRef,
  onClose,
}: MyProjectsGalleryType) => {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [prevIndex, setPrevIndex] = useState(index);
  const [canHover] = useState(
    () => window.matchMedia("(hover: hover)").matches,
  );
  const [max, setMax] = useState(getMaxBox);
  const [reduce] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const wipeRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const phase = useRef<"opening" | "open" | "closing">("opening");
  const pending = useRef(false); // close requested while still opening
  const touchX = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const lensRef = useRef<HTMLSpanElement>(null);

  const lensOn = LENS && canHover; // the magnifier only exists on devices with a mouse

  // leaving a photo turns the zoom off (done during render, so no effect is needed)
  if (prevIndex !== index) {
    setPrevIndex(index);
    setZoom(false);
  }

  const sizes = images.map((img) => fit(img.src, max));
  const centers = sizes.map(
    (s, i) =>
      sizes.slice(0, i).reduce((sum, p) => sum + p.w + SLIDE_GAP, 0) + s.w / 2,
  );

  const moveLens = (
    e: React.MouseEvent<HTMLButtonElement>,
    w: number,
    h: number,
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

  const hideLens = () => {
    if (lensRef.current) lensRef.current.style.opacity = "0";
  };

  const step = useCallback(
    (d: number) =>
      setIndex((i) => Math.min(images.length - 1, Math.max(0, i + d))),
    [images.length],
  );

  /* circle start (0px) and end (covers the screen), centered on the cover */
  const getCircles = useCallback(() => {
    const r = originRef.current?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
    const y = r ? r.top + r.height / 2 : window.innerHeight / 2;
    const R =
      Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      ) + 10;
    return [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${R}px at ${x}px ${y}px)`,
    ] as const;
  }, [originRef]);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  /* hidden before the first paint, so there is no flash */
  useLayoutEffect(() => {
    const [c0] = getCircles();
    if (wipeRef.current) wipeRef.current.style.clipPath = c0;
    if (innerRef.current) innerRef.current.style.clipPath = c0;
  }, [getCircles]);

  const close = useCallback(() => {
    const inner = innerRef.current;
    if (!inner || phase.current === "closing") return;
    if (phase.current === "opening") {
      pending.current = true; // runs as soon as the opening ends
      return;
    }

    phase.current = "closing";
    const [c0, c1] = getCircles();
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
      .finished.then(() => onCloseRef.current())
      .catch(() => {});
  }, [getCircles, reduce]);

  /* open: teal circle first, the dark gallery follows right behind it */
  useEffect(() => {
    const wipe = wipeRef.current;
    const inner = innerRef.current;

    if (!wipe || !inner) return;

    const [c0, c1] = getCircles();
    const t = reduce ? 1 : OPEN_MS;
    const anims: Animation[] = [];

    anims.push(
      wipe.animate([{ clipPath: c0 }, { clipPath: c1 }], {
        duration: t,
        easing: OPEN_EASE,
        fill: "forwards",
      }),
    );

    const innerAnim = inner.animate([{ clipPath: c0 }, { clipPath: c1 }], {
      duration: t,
      delay: reduce ? 0 : 140,
      easing: OPEN_EASE,
      fill: "forwards",
    });

    anims.push(innerAnim);
    inner.querySelectorAll<HTMLElement>("[data-gal-ui]").forEach((el) =>
      anims.push(
        el.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: reduce ? 1 : 320,
          delay: reduce ? 0 : 440,
          fill: "backwards",
        }),
      ),
    );

    innerAnim.finished
      .then(() => {
        inner.style.clipPath = "none"; // no big clipped layer left behind
        wipe.style.display = "none";
        anims.forEach((a) => a.cancel());
        phase.current = "open";
        if (pending.current) {
          pending.current = false;
          close();
        }
      })
      .catch(() => {});

    return () => anims.forEach((a) => a.cancel());
  }, [getCircles, close, reduce]);

  /* lock page scroll + move focus into the gallery, restore both on close */
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    const opener = document.activeElement as HTMLElement | null;
    html.style.overflow = "hidden";
    closeBtnRef.current?.focus({ preventScroll: true });
    return () => {
      html.style.overflow = prevOverflow;
      opener?.focus?.({ preventScroll: true });
    };
  }, []);

  /* keyboard: Esc closes, arrows / Home / End browse, Tab stays inside */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [close, step, images.length]);

  useEffect(() => {
    const onResize = () => setMax(getMaxBox());

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${projectName} gallery`}
      className="fixed inset-0 z-100 text-primary-white"
    >
      {/* Circle wipe color (sits behind the dark layer) */}
      <div
        ref={wipeRef}
        className={`${theme.bg} absolute inset-0 will-change-[clip-path]`}
      />

      {/* Dark gallery layer: fully solid, no blur */}
      <div
        ref={innerRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,227,.07) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        className="absolute inset-0 bg-[#0b0d0c] will-change-[clip-path]"
      >
        {/* Top bar: counter, project name, close */}
        <div
          data-gal-ui
          className="pointer-events-none absolute inset-x-0 top-0 grid h-16 grid-cols-[1fr_auto_1fr] items-center px-5 font-mono text-xs tracking-widest text-primary-white/55"
        >
          {/* Image Counter */}
          <span>
            <b className={`${theme.text} font-medium`}>{pad(index + 1)}</b> /{" "}
            {pad(images.length)}
          </span>

          {/* Project Title */}
          <span className="hidden text-primary-white sm:block">
            <span
              className={`${theme.text} text-[12px] pr-2 transition-colors`}
            >
              ●
            </span>
            {projectName}
          </span>

          {/* Close Gallery Button */}
          <button
            ref={closeBtnRef}
            type="button"
            onClick={close}
            data-cursor="pointer"
            aria-label="Close gallery"
            className={`${theme.hover} pointer-events-auto inline-flex items-center gap-2.5 justify-self-end rounded-full border border-primary-white/10 bg-primary-white/5 py-1.5 pr-2 pl-3.5 text-primary-white transition-colors`}
          >
            <FiX aria-hidden="true" />
            <kbd className="rounded-full bg-primary-white/10 px-2 py-0.5 text-[10px] text-primary-white/55">
              esc
            </kbd>
          </button>
        </div>

        {/* Stage: film strip */}
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          onPointerDown={(e) => {
            if (e.pointerType === "touch") touchX.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (touchX.current === null) return;
            const dx = e.clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
          }}
          className="absolute inset-x-0 top-16 bottom-28 touch-pan-y select-none"
        >
          <div
            style={{
              gap: SLIDE_GAP,
              transform: `translateX(${-centers[index]}px)`,
              transition: reduce
                ? "none"
                : "transform 650ms cubic-bezier(.65,0,.35,1)",
            }}
            className="pointer-events-none absolute top-0 bottom-0 left-1/2 flex items-center"
          >
            {/* Project Images */}
            {images.map((img, i) => {
              const on = i === index;
              const s = sizes[i];

              return (
                <div
                  key={img.title}
                  className={`${theme.text} ${theme.border} pointer-events-auto relative shrink-0 rounded-xl border`}
                  style={{
                    width: s.w,
                    height: s.h,
                    transform: on ? "none" : "scale(.8)",
                    boxShadow: on
                      ? "0 0 70px -8px color-mix(in srgb, currentColor 55%, transparent)"
                      : "0 0 0 0 transparent",
                    transition: reduce
                      ? "none"
                      : "transform 600ms cubic-bezier(.3,1.2,.5,1), box-shadow 400ms",
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      if (!on) return setIndex(i);
                      if (!lensOn) return;
                      if (zoom) {
                        hideLens();
                        setZoom(false);
                      } else {
                        setZoom(true);
                        if (e.detail > 0) moveLens(e, s.w, s.h); // show the lens right where you clicked
                      }
                    }}
                    onPointerMove={
                      on && lensOn
                        ? (e) => zoom && moveLens(e, s.w, s.h)
                        : undefined
                    }
                    onPointerLeave={on && lensOn ? hideLens : undefined}
                    aria-label={`Photo ${i + 1}: ${img.title}`}
                    aria-current={on}
                    aria-pressed={on && lensOn ? zoom : undefined}
                    data-cursor={on && !lensOn ? undefined : "pointer"}
                    className={`${on && lensOn ? (zoom ? "cursor-zoom-out" : "cursor-zoom-in") : ""} absolute inset-0 overflow-hidden rounded-xl ring-1 ring-primary-white/10`}
                  >
                    <Image
                      src={img.src}
                      alt={img.title}
                      fill
                      sizes={`${Math.round(s.w)}px`}
                      quality={85}
                      loading="eager"
                      draggable={false}
                      className="object-contain"
                    />
                    {/* dim the neighbors with an overlay */}
                    <span
                      aria-hidden="true"
                      style={{
                        opacity: on ? 0 : 0.6,
                        transition: "opacity 400ms",
                      }}
                      className="absolute inset-0 bg-[#0b0d0c]"
                    />

                    {/* Hint: tells the user the photo can be zoomed */}
                    {on && lensOn && (
                      <span
                        aria-hidden="true"
                        className={`${theme.text} pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-current bg-primary-bg/80 px-3 py-1.5 font-mono text-[11px] tracking-wider`}
                      >
                        {zoom ? (
                          <FiZoomOut size={13} />
                        ) : (
                          <FiZoomIn size={13} />
                        )}
                        {zoom ? "Click to exit zoom" : "Click to zoom"}
                      </span>
                    )}
                  </button>

                  {/* Magnifier Hover Effect */}
                  {on && lensOn && (
                    <span
                      ref={lensRef}
                      aria-hidden="true"
                      style={{
                        width: LENS_SIZE,
                        height: LENS_SIZE,
                        backgroundImage: `url(${img.src.src})`,
                        backgroundSize: `${s.w * LENS_ZOOM}px ${s.h * LENS_ZOOM}px`,
                        backgroundRepeat: "no-repeat",
                      }}
                      className="pointer-events-none absolute top-0 left-0 rounded-full border-2 border-current bg-[#0b0d0c] opacity-0 shadow-xl shadow-black/60 transition-opacity duration-150"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                data-gal-ui
                type="button"
                onClick={() => step(-1)}
                disabled={index === 0}
                data-cursor="pointer"
                aria-label="Previous photo"
                className={`${theme.hover} absolute top-1/2 left-3 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-primary-white/10 bg-primary-bg/70 transition-colors disabled:pointer-events-none disabled:opacity-25`}
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                data-gal-ui
                type="button"
                onClick={() => step(1)}
                disabled={index === images.length - 1}
                data-cursor="pointer"
                aria-label="Next photo"
                className={`${theme.hover} absolute top-1/2 right-3 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-primary-white/10 bg-primary-bg/70 transition-colors disabled:pointer-events-none disabled:opacity-25`}
              >
                <FiChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Bottom: photo name ABOVE the thumbnails */}
        <div
          data-gal-ui
          className="pointer-events-none absolute inset-x-0 bottom-0 flex h-28 flex-col items-center justify-center gap-3"
        >
          <p aria-live="polite" className="text-sm">
            {images[index].title}
          </p>
          {images.length > 1 && (
            <div className="pointer-events-auto flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img.title}
                  type="button"
                  onClick={() => setIndex(i)}
                  data-cursor="pointer"
                  aria-label={`Photo ${i + 1}: ${img.title}`}
                  className={`${
                    i === index
                      ? `${theme.text} -translate-y-0.5 border-current opacity-100`
                      : "border-primary-white/10 opacity-50 hover:opacity-85"
                  } relative aspect-16/10 w-14 overflow-hidden rounded-md border transition-[opacity,translate,border-color] duration-300 sm:w-17`}
                >
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    sizes="68px"
                    loading="eager"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default MyProjectsGallery;
