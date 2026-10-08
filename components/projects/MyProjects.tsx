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

const INTRO = true;
const INTRO_DURATION = 2400; // ms, must be longer than the last intro animation (about 2s)
const TYPE_DELAY = 700; // ms before the address bar starts typing
const TYPE_SPEED = 55; // ms per letter

const RETYPE = true; // set to false to turn the retype off
const RETYPE_SPEED = 38; // ms per letter when the project switches
const RETYPE_CURSOR = 500; // ms the cursor stays after the last letter

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
  // Intro: "pre" (hidden) -> "playing" (boot sequence) -> "done" (normal)
  const [intro, setIntro] = useState<"pre" | "playing" | "done">(
    INTRO ? "pre" : "done",
  );
  const [typedCount, setTypedCount] = useState(0);
  const [retyping, setRetyping] = useState(false);
  const [prevIndex, setPrevIndex] = useState(active.index);

  // Project changed after the intro: restart the typing from an empty address bar.
  if (prevIndex !== active.index) {
    setPrevIndex(active.index);
    if (
      RETYPE &&
      intro === "done" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTypedCount(0);
      setRetyping(true);
    }
  }

  const boxRef = useRef<HTMLDivElement>(null);
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

  const isPlaying = intro === "playing";
  // Typed letter by letter until the intro is done, then always the full text
  const typeText =
    intro === "done" && !retyping
      ? project.type
      : project.type.slice(0, typedCount);

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

  // Intro: start the first time the box is 40% on screen
  useEffect(() => {
    if (!INTRO) return;

    const box = boxRef.current;
    if (!box) return;

    let endTimer: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();

        // "Reduce motion" users: show everything right away
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setIntro("done");
          return;
        }

        setIntro("playing");
        endTimer = setTimeout(() => setIntro("done"), INTRO_DURATION);
      },
      { threshold: 0.4 },
    );

    observer.observe(box);

    return () => {
      observer.disconnect();
      if (endTimer) clearTimeout(endTimer);
    };
  }, []);

  // Intro: type the project type into the address bar
  useEffect(() => {
    if (!isPlaying) return;

    let interval: ReturnType<typeof setInterval> | undefined;

    const start = setTimeout(() => {
      interval = setInterval(() => setTypedCount((c) => c + 1), TYPE_SPEED);
    }, TYPE_DELAY);

    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Retype: type the new project type letter by letter
  useEffect(() => {
    if (!retyping) return;

    const interval = setInterval(
      () => setTypedCount((c) => c + 1),
      RETYPE_SPEED,
    );

    return () => clearInterval(interval);
  }, [retyping, active.index]);

  // Retype: when it's finished, remove the cursor after a moment
  useEffect(() => {
    if (!retyping || typedCount < project.type.length) return;

    const timer = setTimeout(() => setRetyping(false), RETYPE_CURSOR);

    return () => clearTimeout(timer);
  }, [retyping, typedCount, project.type.length]);

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
          className={`${SCROLL_LOCK ? "sticky top-0 h-svh" : "py-6"} pointer-events-none flex items-center justify-center px-3 md:px-6`}
        >
          {/* Main Project Box */}
          <div
            ref={boxRef}
            className={`${theme.glow} ${intro === "pre" ? "opacity-0" : ""} ${isPlaying ? "is-intro" : ""} pointer-events-auto relative grid w-full max-w-5xl grid-rows-[48px_1fr] overflow-hidden rounded-xl border border-primary-white/10 bg-primary-bg shadow-[0_24px_70px_-28px] transition-shadow duration-500`}
            style={{ height: BOX_HEIGHT }}
          >
            {/* Browser bar: dots, project type, counter */}
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-primary-white/10 bg-primary-white/3 px-3 font-mono text-[11px] tracking-widest text-primary-white/55 md:grid-cols-[1fr_minmax(0,340px)_1fr] md:px-4">
              <div className="flex gap-1.75">
                <span
                  className="intro-dot size-2.5 rounded-full bg-primary-hover md:size-3"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="intro-dot size-2.5 rounded-full bg-primary-yellow md:size-3"
                  style={{ animationDelay: "0.25s" }}
                />
                <span
                  className="intro-dot size-2.5 rounded-full bg-primary-purple md:size-3"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 truncate rounded-full bg-primary-white/6 px-4 py-1.5 text-xs tracking-wide text-primary-white">
                <span className={`${theme.text} text-[10px] transition-colors`}>
                  ●
                </span>
                {typeText}

                {/* Typing Cursor */}
                <span
                  className={`${theme.bg} intro-cursor ml-0.5 inline-block h-3 w-1.75 transition-colors`}
                />
              </div>

              {/* Project Counter */}
              <div className="intro-count justify-self-end uppercase tabular-nums">
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
                  className={`${theme.line} intro-band pointer-events-none absolute inset-x-0 top-1/2 h-19 -translate-y-1/2 border-y transition-colors duration-500`}
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
                        animationDelay: `${1.1 + distance * 0.15}s`,
                      }}
                      className={`intro-item absolute top-1/2 left-3.5 right-2 flex h-14 origin-left cursor-pointer items-center gap-1.5 text-left text-[15px] font-semibold tracking-tight transition-[transform,opacity,color] duration-500 md:left-7 md:right-3 md:gap-3 md:text-[27px] ${
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

                {/* Scroll Info */}
                {/* {SCROLL_LOCK && (
                  <p className="absolute bottom-4 left-7 hidden font-mono text-[10.5px] tracking-[0.14em] text-primary-white/55 uppercase md:block">
                    scroll to browse ↓
                  </p>
                )} */}
              </div>

              {/* Project details: key makes it re-mount (and animate) only when the project changes */}
              <div className="intro-view min-h-0 overflow-hidden p-4 md:px-10 md:py-9">
                <div
                  key={project.name}
                  style={{ "--direction": active.direction } as CSSProperties}
                  className="animate-project-in flex h-full flex-col gap-4"
                >
                  {/* Cover Image */}
                  <div
                    className={`${theme.text} ${theme.border} ${theme.tint} relative grid h-25 shrink-0 place-items-center overflow-hidden rounded-md border text-2xl font-bold tracking-tight md:h-37.5 md:text-4xl`}
                  >
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        sizes="(min-width: 768px) 600px, 100vw"
                        className="object-contain"
                      />
                    ) : (
                      <span className="relative">{project.name}</span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-primary-white md:text-3xl">
                    {project.name}
                  </h3>

                  <p className="max-w-[90%] text-sm leading-relaxed text-primary-white/55 md:text-[15px]">
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
                        data-cursor="pointer"
                        target="_blank"
                        rel="noreferrer"
                        className={`${theme.bg} inline-flex items-center gap-2 rounded-md border border-transparent px-4 py-2.5 text-sm font-semibold text-primary-bg transition hover:-translate-y-0.5`}
                      >
                        Live demo <FiExternalLink />
                      </Link>
                    )}
                    <Link
                      href={project.github}
                      data-cursor="pointer"
                      target="_blank"
                      rel="noreferrer"
                      className={`${theme.hover} inline-flex items-center gap-2 rounded-md border border-primary-white/60 px-4 py-2.5 text-sm text-primary-white transition hover:-translate-y-0.5`}
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
