import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { hideLens, moveLens } from "@/utils/projectsGalleryFunctions";
import {
  GalleryImage,
  MyProjectsContentsType,
  ThemeColor,
} from "@/types/myProjectsTypes";

interface MyProjectsGalleryImagesType {
  img: GalleryImage;
  index: number;
  theme: MyProjectsContentsType["themes"][ThemeColor];
  s: { w: number; h: number };
  on: boolean;
  reduce: boolean;
  setIndex: Dispatch<SetStateAction<number>>;
  lensOn: boolean;
  zoom: boolean;
  setZoom: Dispatch<SetStateAction<boolean>>;
  lensRef: React.RefObject<HTMLSpanElement | null>;
  LENS_SIZE: number;
  LENS_ZOOM: number;
}

const MyProjectsGalleryImages = ({
  img,
  index,
  theme,
  s,
  on,
  reduce,
  setIndex,
  lensOn,
  zoom,
  setZoom,
  lensRef,
  LENS_SIZE,
  LENS_ZOOM,
}: MyProjectsGalleryImagesType) => {
  return (
    <div
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
          if (!on) return setIndex(index);
          if (!lensOn) return;
          if (zoom) {
            hideLens(lensRef);
            setZoom(false);
          } else {
            setZoom(true);
            if (e.detail > 0)
              moveLens(e, s.w, s.h, lensRef, LENS_SIZE, LENS_ZOOM); // show the lens right where you clicked
          }
        }}
        onPointerMove={
          on && lensOn
            ? (e) =>
                zoom && moveLens(e, s.w, s.h, lensRef, LENS_SIZE, LENS_ZOOM)
            : undefined
        }
        onPointerLeave={on && lensOn ? () => hideLens(lensRef) : undefined}
        aria-label={`Photo ${index + 1}: ${img.title}`}
        aria-current={on}
        aria-pressed={on && lensOn ? zoom : undefined}
        data-cursor={
          on ? (lensOn ? (zoom ? "zoomOut" : "zoomIn") : undefined) : "pointer"
        }
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
};

export default MyProjectsGalleryImages;
