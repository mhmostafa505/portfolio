"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import SectionHeader from "../SectionHeader";
import MyProjectsMainBox from "./MyProjectsMainBox";
import { myProjectsContents } from "@/content/myProjectsContents";
import {
  onScroll,
  handleSelect,
  handleMagnetMove,
  resetMagnet,
} from "@/utils/myProjectsFunctions";

const pills = ["#E-Commerce", "#Twitter-Demo", "#TaskManager"];

// Data Import
const {
  themes,
  projects,
  SCROLL_LOCK,
  SCROLL_PER_PROJECT,
  WHEEL_GAP,
  BOX_MAX_HEIGHT,
  BOX_GAP,
  GAP_ABOVE,
  GAP_BELOW,
  INTRO,
  INTRO_DURATION,
  TYPE_DELAY,
  TYPE_SPEED,
  RETYPE,
  RETYPE_SPEED,
  RETYPE_CURSOR,
  MAGNET,
  MAGNET_RADIUS,
  MAGNET_PULL,
  pad,
} = myProjectsContents;

const BOX_HEIGHT = `min(${BOX_MAX_HEIGHT}px, 100svh - ${BOX_GAP * 2}px)`;
const SPARE = `(100svh - ${BOX_HEIGHT}) / 2`; // empty space above/below the box inside the pinned stage

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
  const stackRef = useRef<HTMLDivElement>(null);

  const project = projects[active.index];
  const theme = themes[project.color];

  const isPlaying = intro === "playing";
  // Typed letter by letter until the intro is done, then always the full text
  const typeText =
    intro === "done" && !retyping
      ? project.type
      : project.type.slice(0, typedCount);

  const setProjectsRef = useCallback(
    (el: HTMLElement | null) => registerSection("projects", el),
    [registerSection],
  );

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
          <MyProjectsMainBox
            boxRef={boxRef}
            theme={theme}
            themes={themes}
            project={project}
            projects={projects}
            pad={pad}
            WHEEL_GAP={WHEEL_GAP}
            MAGNET={MAGNET}
            MAGNET_RADIUS={MAGNET_RADIUS}
            MAGNET_PULL={MAGNET_PULL}
            intro={intro}
            typeText={typeText}
            isPlaying={isPlaying}
            BOX_HEIGHT={BOX_HEIGHT}
            active={active}
            SCROLL_LOCK={SCROLL_LOCK}
            handleSelect={handleSelect}
            handleMagnetMove={handleMagnetMove}
            stackRef={stackRef}
            resetMagnet={resetMagnet}
            trackRef={trackRef}
            setActive={setActive}
            getStep={getStep}
            stageRef={stageRef}
            navTarget={navTarget}
            navTimer={navTimer}
          />
        </div>
      </div>
    </section>
  );
};

export default MyProjects;
