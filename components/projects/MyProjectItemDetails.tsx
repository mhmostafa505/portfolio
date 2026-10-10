import Image from "next/image";
import Link from "next/link";
import { type CSSProperties } from "react";
import {
  MyProjectsContentsType,
  Project,
  ThemeColor,
} from "@/types/myProjectsTypes";
import { FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

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
  return (
    <div
      key={project.name}
      style={{ "--direction": active.direction } as CSSProperties}
      className="animate-project-in flex h-full flex-col gap-4"
    >
      {/* Cover Image */}
      <div
        className={`${theme.text} ${theme.border} ${theme.tint} group relative grid h-25 shrink-0 place-items-center overflow-hidden rounded-md border text-2xl font-bold tracking-tight md:h-37.5 md:text-4xl`}
      >
        {project.image ? (
          <Image
            src={project.image}
            alt={project.name}
            fill
            sizes="(min-width: 768px) 600px, 100vw"
            className="object-contain group-hover:scale-110 group-hover:rotate-6 group-hover:translate-y-10 transition-all duration-200 ease-in-out"
          />
        ) : (
          <span className="relative">{project.name}</span>
        )}
      </div>

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
        {project.live && (
          <Link
            href={project.live}
            data-cursor="pointer"
            target="_blank"
            rel="noreferrer"
            aria-label="Live demo"
            className={`${theme.bg} inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-primary-bg transition hover:-translate-y-0.5`}
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
            <FiExternalLink />
          </Link>
        )}
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
    </div>
  );
};

export default MyProjectsItemDetails;
