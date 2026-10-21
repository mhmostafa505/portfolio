"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import MyProjectsGalleryTopBar from "./MyProjectsGalleryTopBar";
import MyProjectsGalleryBottomBar from "./MyProjectsGalleryBottomBar";
import MyProjectsGalleryImages from "./MyProjectsGalleryImages";
import {
  fit,
  getMaxBox,
  onKey,
  playCloseAnimation,
  playOpenAnimation,
} from "@/utils/projectsGalleryFunctions";
import { projectsGalleryContents } from "@/content/projectsGalleryContents";
import {
  GalleryImage,
  MyProjectsContentsType,
  ThemeColor,
} from "@/types/myProjectsTypes";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface MyProjectsGalleryType {
  images: GalleryImage[];
  projectName: string;
  theme: MyProjectsContentsType["themes"][ThemeColor];
  originRef: React.RefObject<HTMLElement | null>; // the cover: the circle grows from it
  pointerRef: React.RefObject<{ x: number; y: number }>;
  onClose: () => void; // called AFTER the close animation
}

// Data Import
const {
  OPEN_MS,
  CLOSE_MS,
  OPEN_EASE,
  CLOSE_EASE,
  SLIDE_GAP,
  LENS,
  LENS_SIZE,
  LENS_ZOOM,
  pad,
} = projectsGalleryContents;

const MyProjectsGallery = ({
  images,
  projectName,
  theme,
  originRef,
  pointerRef,
  onClose,
}: MyProjectsGalleryType) => {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [prevIndex, setPrevIndex] = useState(index);
  const [canHover] = useState(
    () => window.matchMedia("(hover: hover)").matches,
  );
  const [max, setMax] = useState(getMaxBox());
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

  // Navigate between images while keeping the index within valid bounds.
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

  // re-sends a mouse event at the pointer's position so the custom cursor re-checks what is under it
  const refreshCursor = useCallback(() => {
    const { x, y } = pointerRef.current;
    if (x < 0 || y < 0) return;
    requestAnimationFrame(() => {
      const el = document.elementFromPoint(x, y);
      if (!el) return;
      const init = { clientX: x, clientY: y, bubbles: true };
      el.dispatchEvent(
        new PointerEvent("pointermove", {
          ...init,
          pointerType: "mouse",
          isPrimary: true,
        }),
      );
      el.dispatchEvent(new MouseEvent("mousemove", init));
      el.dispatchEvent(new MouseEvent("mouseover", init));
    });
  }, [pointerRef]);

  /* hidden before the first paint, so there is no flash */
  useLayoutEffect(() => {
    const [c0] = getCircles();
    if (wipeRef.current) wipeRef.current.style.clipPath = c0;
    if (innerRef.current) innerRef.current.style.clipPath = c0;
  }, [getCircles]);

  // Animate the gallery closing and call onClose when the animation finishes.
  const close = useCallback(() => {
    const inner = innerRef.current;
    if (!inner || phase.current === "closing") return;
    if (phase.current === "opening") {
      pending.current = true; // runs as soon as the opening ends
      return;
    }

    phase.current = "closing";
    const [c0, c1] = getCircles();

    playCloseAnimation(
      inner,
      c0,
      c1,
      reduce,
      () => onCloseRef.current(),
      CLOSE_MS,
      CLOSE_EASE,
    );
  }, [getCircles, reduce]);

  // Keep the latest onClose callback in the ref without restarting effects.
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // zoom turned on / off: the cursor shape changes right away
  useEffect(() => {
    refreshCursor();
  }, [zoom, refreshCursor]);

  // another photo slid under the pointer: refresh now and again when the strip has stopped
  useEffect(() => {
    refreshCursor();
    const t = setTimeout(refreshCursor, reduce ? 50 : 700);
    return () => clearTimeout(t);
  }, [index, refreshCursor, reduce]);

  /* Opening Animation For Gallery */
  useEffect(() => {
    const wipe = wipeRef.current;
    const inner = innerRef.current;

    if (!wipe || !inner) return;

    const [c0, c1] = getCircles();

    return playOpenAnimation(
      wipe,
      inner,
      c0,
      c1,
      reduce,
      refreshCursor,
      pending,
      phase,
      close,
      OPEN_MS,
      OPEN_EASE,
    );
  }, [getCircles, close, reduce, refreshCursor]);

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
    const handleKeyDown = (e: KeyboardEvent) =>
      onKey(e, phase, step, images, innerRef, close);

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close, step, images, phase, innerRef]);

  // Update the maximum box dimensions when the window is resized.
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

      {/* Dark gallery layer */}
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
        <MyProjectsGalleryTopBar
          pad={pad}
          index={index}
          theme={theme}
          images={images}
          projectName={projectName}
          closeBtnRef={closeBtnRef}
          close={close}
        />

        {/* Stage: film strip switch images animation*/}
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
                <MyProjectsGalleryImages
                  key={img.title}
                  img={img}
                  index={i}
                  theme={theme}
                  s={s}
                  on={on}
                  reduce={reduce}
                  setIndex={setIndex}
                  lensOn={lensOn}
                  zoom={zoom}
                  setZoom={setZoom}
                  lensRef={lensRef}
                  LENS_SIZE={LENS_SIZE}
                  LENS_ZOOM={LENS_ZOOM}
                />
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
        <MyProjectsGalleryBottomBar
          images={images}
          index={index}
          setIndex={setIndex}
          theme={theme}
        />
      </div>
    </div>,
    document.body,
  );
};

export default MyProjectsGallery;
