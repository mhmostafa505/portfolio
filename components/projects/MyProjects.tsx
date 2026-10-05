"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import SectionHeader from "../SectionHeader";
import { myProjectsContents } from "@/content/myProjectsContents";
import { handleSelect, onScroll } from "@/utils/myProjectsFunctions";
import { FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

const pills = ["#E-Commerce", "#Twitter-Demo", "#TaskManager"];

const SCROLL_LOCK = true;
const SCROLL_PER_PROJECT = 60; // vh of scrolling each project gets
const WHEEL_GAP = 64; // px between the names in the drum wheel
const BOX_MAX_HEIGHT = 620;
const BOX_GAP = 100; // px always kept free above and below the box while pinned
const GAP_ABOVE = 30; // px between the header and the box before it pins
const GAP_BELOW = 0; // px between the box and the next section after it unpins

const BOX_HEIGHT = `min(${BOX_MAX_HEIGHT}px, 100svh - ${BOX_GAP * 2}px)`;
const SPARE = `(100svh - ${BOX_HEIGHT}) / 2`; // empty space above/below the box inside the pinned stage

const pad = (n: number) => String(n).padStart(2, "0");

// Data Import
const { themes, projects } = myProjectsContents;

// Pixels of scrolling each project gets, read from the real layout
const getStep = (track: HTMLElement | null, stage: HTMLElement | null) =>
  track && stage
    ? (track.offsetHeight - stage.offsetHeight) / projects.length
    : 0;

const MyProjects = () => {
  const { registerSection } = useScrollSpy();
  const [activePillsIndex, setActivePillsIndex] = useState<number | null>(null);
  const [active, setActive] = useState({ index: 0, direction: 1 });

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const navTarget = useRef<number | null>(null);
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setProjectsRef = useCallback(
    (el: HTMLElement | null) => registerSection("projects", el),
    [registerSection],
  );

  const project = projects[active.index];
  const theme = themes[project.color];

  // Scroll position -> active project
  useEffect(() => {
    if (!SCROLL_LOCK) return;

    const handleScroll = () => {
      onScroll({
        trackRef,
        getStep,
        stageRef,
        projects,
        navTarget,
        navTimer,
        setActive,
      });
    };

    // User takes over the scroll -> back to normal behavior
    const cancelNav = () => {
      navTarget.current = null;
    };

    // Capture the timer that exists when this effect finishes.
    const timer = navTimer.current;

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", cancelNav, { passive: true });
    window.addEventListener("touchstart", cancelNav, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", cancelNav);
      window.removeEventListener("touchstart", cancelNav);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  return (
    <section
      id="projects"
      ref={setProjectsRef}
      className="mt-40 mb-40 scroll-mt-35"
    >
      {/* Title and Pills */}
      <SectionHeader
        pills={pills}
        activePillsIndex={activePillsIndex}
        setActivePillsIndex={setActivePillsIndex}
        color="primary-hover"
        title="My Projects"
        number={3}
        isReverse={false}
      />

      {/* Scroll track: gives every project its own scroll distance */}
      <div
        ref={trackRef}
        style={
          SCROLL_LOCK
            ? {
                height: `calc(100svh + ${projects.length * SCROLL_PER_PROJECT}svh)`,
                marginTop: `calc(${GAP_ABOVE}px - ${SPARE})`,
                marginBottom: `calc(${GAP_BELOW}px - ${SPARE})`,
                overflowAnchor: "none",
              }
            : undefined
        }
      >
        {/* Sticky stage: stays pinned while the projects change */}
        <div
          ref={stageRef}
          className={`pointer-events-none flex items-center justify-center px-3 md:px-6 ${SCROLL_LOCK ? "sticky top-0 h-svh" : "py-6"}`}
        >
          {/* Main Project Box */}
          <div
            className={`pointer-events-auto relative grid w-full max-w-5xl grid-rows-[48px_1fr] overflow-hidden rounded-xl border border-primary-white/10 bg-primary-bg shadow-[0_24px_70px_-28px] transition-shadow duration-500 ${theme.glow}`}
            style={{ height: BOX_HEIGHT }}
          >
            {/* Browser bar: dots, project type, counter */}
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-primary-white/10 bg-primary-white/3 px-3 font-mono text-[11px] tracking-widest text-primary-white/55 md:grid-cols-[1fr_minmax(0,340px)_1fr] md:px-4">
              <div className="flex gap-1.75">
                <span className="size-2.5 rounded-full bg-primary-hover md:size-3" />
                <span className="size-2.5 rounded-full bg-primary-yellow md:size-3" />
                <span className="size-2.5 rounded-full bg-primary-purple md:size-3" />
              </div>

              <div className="flex items-center justify-center gap-2 truncate rounded-full bg-primary-white/6 px-4 py-1.5 text-xs tracking-wide text-primary-white">
                <span className={`${theme.text} text-[10px] transition-colors`}>
                  ●
                </span>
                {project.type}
              </div>

              <div className="justify-self-end uppercase">
                <span className={`${theme.text} transition-colors`}>
                  {pad(active.index + 1)}
                </span>{" "}
                / {pad(projects.length)}
              </div>
            </div>

            <div className="grid min-h-0 grid-cols-[150px_1fr] md:grid-cols-[340px_1fr]">
              {/* Drum wheel */}
              <div className="relative overflow-hidden border-r border-primary-white/10">
                {/* Selection band */}
                <div
                  className={`pointer-events-none absolute inset-x-0 top-1/2 h-19 -translate-y-1/2 border-y transition-colors duration-500 ${theme.line}`}
                />

                {projects.map((item, i) => {
                  const offset = i - active.index;
                  const distance = Math.abs(offset);

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() =>
                        // Click on a project name
                        handleSelect({
                          index: i,
                          active,
                          SCROLL_LOCK,
                          trackRef,
                          setActive,
                          getStep,
                          stageRef,
                          navTarget,
                          navTimer,
                        })
                      }
                      style={{
                        transform: `translateY(calc(-50% + ${offset * WHEEL_GAP}px)) translateX(${distance * distance * -8}px) scale(${1 - distance * 0.14})`,
                        opacity: Math.max(0, 1 - distance * 0.42),
                      }}
                      className={`absolute top-1/2 left-3.5 right-2 flex h-14 origin-left cursor-pointer items-center gap-1.5 text-left text-[15px] font-semibold tracking-tight transition-[transform,opacity,color] duration-500 md:left-7 md:right-3 md:gap-3 md:text-[27px] ${
                        i === active.index
                          ? themes[item.color].text
                          : "text-primary-white/55 hover:text-primary-white"
                      }`}
                    >
                      <span className="font-mono text-[11px] font-normal opacity-65 md:text-[15px]">
                        {pad(i + 1)}.
                      </span>
                      {item.name}
                    </button>
                  );
                })}

                {SCROLL_LOCK && (
                  <p className="absolute bottom-4 left-7 hidden font-mono text-[10.5px] tracking-[0.14em] text-primary-white/55 uppercase md:block">
                    scroll to browse ↓
                  </p>
                )}
              </div>

              {/* Project details: key makes it re-mount (and animate) only when the project changes */}
              <div className="min-h-0 overflow-hidden p-4 md:px-10 md:py-9">
                <div
                  key={project.name}
                  style={{ "--direction": active.direction } as CSSProperties}
                  className="animate-project-in flex h-full flex-col gap-4"
                >
                  {/* Cover: replace with <Image /> when you have screenshots */}
                  <div
                    className={`relative grid h-25 shrink-0 place-items-center overflow-hidden rounded-md border text-2xl font-bold tracking-tight md:h-37.5 md:text-4xl ${theme.text} ${theme.border} ${theme.tint}`}
                  >
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      sizes="(min-width: 768px) 600px, 100vw"
                      className="object-contain"
                    />
                    {/* <span className="relative">{project.name}</span> */}
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-primary-white md:text-3xl">
                    {project.name}
                  </h3>

                  <p className="max-w-[60ch] text-sm leading-relaxed text-primary-white/55 md:text-[15px]">
                    {project.description}
                  </p>

                  {/* Stack */}
                  <div className="flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded border border-primary-white/10 px-2.5 py-1 font-mono text-[11.5px] text-primary-white/55"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="mt-auto flex flex-wrap justify-end gap-2.5">
                    {project.live && (
                      <Link
                        href={project.live}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 rounded-md border border-transparent px-4 py-2.5 text-sm font-semibold text-primary-bg transition hover:-translate-y-0.5 ${theme.bg}`}
                      >
                        Live demo <FiExternalLink />
                      </Link>
                    )}
                    <Link
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-2 rounded-md border border-primary-white/10 px-4 py-2.5 text-sm text-primary-white transition hover:-translate-y-0.5 ${theme.hover}`}
                    >
                      <FaGithub /> GitHub
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyProjects;
