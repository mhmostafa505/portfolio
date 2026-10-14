"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLiveIcon } from "@/hooks/useLiveDemoIcon";
import MyProjectsGallery from "./MyProjectsGallery";
import {
  MyProjectsContentsType,
  Project,
  ThemeColor,
} from "@/types/myProjectsTypes";
import { FaGithub } from "react-icons/fa";
import { FiExternalLink, FiMaximize2 } from "react-icons/fi";

interface MyProjectsItemDetailsType {
  project: Project;
  active: { index: number; direction: number };
  theme: MyProjectsContentsType["themes"][ThemeColor];
  stackRef: React.RefObject<HTMLDivElement | null>;
}

const MyProjectsItemDetails = ({
  project,
  active,
  theme,
  stackRef,
}: MyProjectsItemDetailsType) => {
  const { iconRef, playIcon, rewindIcon } = useLiveIcon(project.name);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [asleep, setAsleep] = useState(false);

  const coverRef = useRef<HTMLButtonElement>(null);
  const pointer = useRef({ x: -1, y: -1 });

  // the gallery photos: your gallery, or just the cover if there is none
  const images = project.gallery?.length
    ? project.gallery
    : project.image
      ? [{ src: project.image, title: project.name }]
      : [];

  // remember where the mouse is while the gallery is open
  useEffect(() => {
    if (!galleryOpen) return;
    const move = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("pointermove", move, { passive: true });

    return () => window.removeEventListener("pointermove", move);
  }, [galleryOpen]);

  // Open Gallery
  const openGallery = (e: React.MouseEvent) => {
    if (e.detail > 0) pointer.current = { x: e.clientX, y: e.clientY };
    setGalleryOpen(true);
  };

  // Close Gallery
  const closeGallery = () => {
    // mouse still over the cover? then keep it asleep until the mouse leaves
    const r = coverRef.current?.getBoundingClientRect();
    const { x, y } = pointer.current;
    setAsleep(
      !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom,
    );
    setGalleryOpen(false);
  };

  return (
    <div
      key={project.name}
      style={{ "--direction": active.direction } as CSSProperties}
      className="animate-project-in flex h-full flex-col gap-4"
    >
      {/* Cover Image */}
      <button
        ref={coverRef}
        type="button"
        data-cursor="pointer"
        disabled={!images.length}
        onClick={openGallery}
        onMouseLeave={() => setAsleep(false)}
        aria-label={`Open ${project.name} gallery`}
        className={`${theme.text} ${theme.border} ${theme.tint} ${asleep ? "is-asleep" : ""} cover-frame relative flex h-25 w-full shrink-0 items-start justify-center overflow-hidden rounded-md pt-4 border text-2xl font-bold tracking-tight md:h-37.5 md:text-4xl`}
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in srgb, currentColor 35%, transparent) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        {project.image ? (
          <Image
            src={project.image}
            alt={project.name}
            sizes="(min-width: 768px) 460px, 60vw"
            quality={90}
            className="wake-img h-auto w-[88%] rounded-t-xl md:w-[78%]"
          />
        ) : (
          <span className="relative self-center">{project.name}</span>
        )}

        {/* Photo Count Chip */}
        {images.length > 1 && (
          <span
            aria-hidden="true"
            className={`${theme.text} ${theme.border} cover-hint pointer-events-none absolute right-2.5 bottom-2 inline-flex items-center gap-1.5 rounded-full border bg-primary-bg/80 px-2.5 py-1 font-mono text-[10.5px] tracking-wider`}
          >
            <FiMaximize2 size={11} />
            {images.length} photos
          </span>
        )}
      </button>

      {/* Title */}
      <h3 className="text-2xl font-bold tracking-tight text-primary-white md:text-3xl">
        {project.name}
      </h3>

      {/* Description */}
      <p className="max-w-[90%] text-sm leading-relaxed text-primary-white/60 md:text-[15px]">
        {project.description}
      </p>

      {/* Stack */}
      <div ref={stackRef} className="flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <div key={tech} className="group">
            <span
              className={`block cursor-default rounded border border-primary-white/20 px-2.5 py-1 font-mono text-[11.5px] text-primary-white/55 transition-[transform,color,border-color,background-color] duration-200 ease-out ${theme.tagHover}`}
            >
              {tech}
            </span>
          </div>
        ))}
      </div>

      {/* Links: Github & Live Demo */}
      <div className="mt-auto flex flex-wrap justify-end gap-2.5">
        {/* Live Demo */}
        {project.live && (
          <div
            onMouseEnter={playIcon}
            onMouseLeave={rewindIcon}
            data-cursor="pointer"
            className="group flex"
          >
            <Link
              href={project.live}
              data-cursor="pointer"
              target="_blank"
              rel="noreferrer"
              aria-label="Live demo"
              className={`${theme.bg} inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-primary-bg group-hover:-translate-y-0.5 group-hover:scale-105 transition-all duration-700 ease-in-out`}
            >
              <span aria-hidden="true">
                {"Live demo".split("").map((char, i) => (
                  <span
                    key={i}
                    className="wave-letter"
                    style={{ "--i": i } as CSSProperties}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>{" "}
              <span ref={iconRef} aria-hidden="true" className="inline-flex">
                <FiExternalLink />
              </span>
            </Link>
          </div>
        )}

        {/* Github */}
        <div data-cursor="pointer" className="group flex">
          <Link
            href={project.github}
            data-cursor="pointer"
            target="_blank"
            rel="noreferrer"
            className={`${theme.hover} float-hover inline-flex items-center gap-2 rounded-md border border-primary-white/60 px-4 py-2.5 text-sm text-primary-white`}
          >
            <FaGithub /> GitHub
          </Link>
        </div>
      </div>

      {/* Image Gallery */}
      {galleryOpen && (
        <MyProjectsGallery
          images={images}
          projectName={project.name}
          theme={theme}
          originRef={coverRef}
          onClose={closeGallery}
        />
      )}
    </div>
  );
};

export default MyProjectsItemDetails;
