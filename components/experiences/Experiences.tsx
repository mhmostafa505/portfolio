"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import SectionHeader from "../SectionHeader";
import { EASE } from "@/content/ease";

interface ExperienceItem {
  date: string;
  title: string;
  role: string;
  description: string;
}

const pills = ["#BootCamp", "#Brad-Traversy", "#Front-End"];

const experienceItems: ExperienceItem[] = [
  {
    date: "2024",
    title: "Started Learning HTML & CSS",
    role: "Udemy — Brad Traversy",
    description:
      'Began my web development journey with Brad Traversy\'s "Modern HTML & CSS From The Beginning" on Udemy. This course shaped how I structure and write code to this day, and gave me a solid foundation in semantic HTML and CSS fundamentals.',
  },
  {
    date: "2025",
    title: "Learned JavaScript Fundamentals",
    role: "freeCodeCamp & Codecademy",
    description:
      "Moved on to JavaScript, learning the fundamentals through freeCodeCamp and Codecademy. Didn't get to go too deep before joining a bootcamp, but the core concepts I picked up here made a real difference once the bootcamp's JavaScript modules started.",
  },
  {
    date: "2025",
    title: "Front-End Bootcamp",
    role: "Quera Bootcamp",
    description:
      "A 3–4 month intensive front-end bootcamp covering HTML/CSS, JavaScript fundamentals, professional JavaScript, TypeScript, and Tailwind CSS. Built two team projects — a landing page (HTML/Tailwind) and a task manager app with full CRUD (HTML/Tailwind/JS) — as squad leader for both. Then learned React in depth and led a team building a full e-commerce site with React and TypeScript. Graduated with a perfect score as the top student in the bootcamp.",
  },
  {
    date: "2026",
    title: "Twitter-Style Social App",
    role: "Team Project — Front-End",
    description:
      "Built a Twitter-like social platform (posts, reposts, follow/unfollow, comments, and more) as one of three front-end developers, working alongside two back-end developers using Python/Django. Used React, TypeScript, Tailwind CSS, and several supporting libraries, with the UI designed from scratch in Adobe XD.",
  },
  {
    date: "2026",
    title: "Learned Next.js",
    role: "Udemy — Brad Traversy",
    description:
      "Took Brad Traversy's project-based \"Next.js From Scratch\" course, building a full application while picking up Next.js fundamentals along with some MongoDB. A course packed with new concepts I'm looking forward to applying in a real project.",
  },
  {
    date: "2026",
    title: "Learned SEO Fundamentals",
    role: "Quera",
    description:
      "Completed a course on SEO fundamentals through Quera, picking up practical techniques for improving visibility and discoverability — knowledge I'm looking forward to applying in upcoming projects.",
  },
  {
    date: "Up Next",
    title: "Animations & Backend",
    role: "Currently Exploring",
    description:
      "Looking to dive into web animation — likely GSAP, possibly Three.js — and considering starting Node.js to grow into a full-stack role.",
  },
];

const CUE_TO_TRAVELER_THRESHOLD = 0.02;
const TRIGGER = 0.4;
const DOT_LERP_FACTOR = 0.06;

const Experiences = () => {
  const { revealed, registerSection } = useScrollSpy();
  const [activePillsIndex, setActivePillsIndex] = useState<number | null>(null);
  const [dotTop, setDotTop] = useState(0);
  const [dotOffsets, setDotOffsets] = useState<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isBouncing, setIsBouncing] = useState(true);

  const timelineRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetHeightRef = useRef(0);
  const dotTopRef = useRef(0);

  const isRevealed = revealed.has("experiences");

  const setExperiencesRef = useCallback(
    (el: HTMLElement | null) => registerSection("experiences", el),
    [registerSection],
  );

  useLayoutEffect(() => {
    const measure = () => {
      setDotOffsets(itemRefs.current.map((el) => (el ? el.offsetTop : 0)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      ticking = false;
      const el = timelineRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height;
      const doc = document.documentElement;

      const maxScrollY = doc.scrollHeight - vh;
      const scrollRemaining = maxScrollY - window.scrollY;
      const rectTopAtPageEnd = rect.top - scrollRemaining;

      const scrolledNow = Math.max(vh * TRIGGER - rect.top, 0);
      const scrolledAtEnd = Math.max(vh * TRIGGER - rectTopAtPageEnd, 0);

      const fraction =
        scrolledAtEnd > 0 ? Math.min(scrolledNow / scrolledAtEnd, 1) : 1;

      const heightPx = fraction * total;
      setIsBouncing(fraction <= CUE_TO_TRAVELER_THRESHOLD);
      targetHeightRef.current = heightPx;

      setVisibleCount(
        fraction <= CUE_TO_TRAVELER_THRESHOLD
          ? 0
          : dotOffsets.reduce(
              (count, offset) => (heightPx >= offset ? count + 1 : count),
              0,
            ),
      );
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [dotOffsets]);

  useEffect(() => {
    let frameId: number;

    const tick = () => {
      const target = targetHeightRef.current;
      const current = dotTopRef.current;
      const next = current + (target - current) * DOT_LERP_FACTOR;

      dotTopRef.current = Math.abs(target - next) < 0.05 ? target : next;
      setDotTop(dotTopRef.current);

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <section
      id="experiences"
      ref={setExperiencesRef}
      className="mt-10 mb-20 scroll-mt-45"
    >
      {/* Title and Pills */}
      <SectionHeader
        pills={pills}
        isRevealed={isRevealed}
        EASE={EASE}
        activePillsIndex={activePillsIndex}
        setActivePillsIndex={setActivePillsIndex}
        color="primary-yellow"
        title="My Experiences"
        number={2}
        isReverse={true}
      />

      <div
        ref={timelineRef}
        className="relative mx-auto max-w-full px-6 pb-32 pt-8 mt-30"
      >
        {/* colored progress line only — no visible base track */}
        {!isBouncing && (
          <div
            className="absolute left-1/2 top-0 w-1 -translate-x-1/2 rounded-full bg-linear-to-b from-primary-yellow to-primary-yellow/40 max-sm:left-5 max-sm:translate-x-0"
            style={{ height: dotTop }}
          />
        )}

        {/* Scroll-Mouse Pill */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-10 transition-[width,border-radius,border-color,background-color,box-shadow] duration-500 ease-out max-sm:left-5 ${
            isBouncing
              ? "w-8 h-14 rounded-full border-[1.5px] border-primary-yellow bg-transparent"
              : "w-8 h-8 rounded-full border-transparent bg-primary-yellow animate-[neonFlicker_1.4s_ease-in-out_infinite]"
          }`}
          style={{ top: dotTop - 16 }}
        >
          {/* the wheel: only meaningful in the pill state, fades out as
              the shell fills in and becomes the solid dot */}
          <div
            className={`absolute left-1/2 top-2 ml-[-1.5px] h-2.5 w-0.75 rounded-full bg-primary-yellow transition-opacity duration-300 ${
              isBouncing
                ? "opacity-100 animate-[wheelBounce_1.6s_ease-in-out_infinite]"
                : "opacity-0"
            }`}
          />
        </div>

        {/* Experience Cards */}
        {experienceItems.map((item, i) => {
          const isLeft = i % 2 === 0;
          const isVisible = i < visibleCount;

          return (
            <div
              key={item.title}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`relative w-1/2 pb-20 cursor-default transition-all duration-500 last:pb-0 max-sm:w-full max-sm:pl-11 max-sm:pr-0 max-sm:text-left ${
                isLeft ? "left-0 pr-10 text-right" : "left-1/2 pl-10 text-left"
              } max-sm:left-0 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0"
              }`}
            >
              {/* Dot Near Each Card */}
              <div
                className={`absolute top-0.5 h-6 w-6 max-sm:left-3.5 max-sm:right-auto ${
                  isLeft ? "-right-3" : "-left-3"
                }`}
              >
                {/* core dot — same on/off states as before, just no border now since
                the halo rings replace that visual role */}
                <div
                  className={`absolute inset-0 z-10 rounded-full transition-colors duration-300 ${
                    isVisible
                      ? "bg-primary-yellow shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                      : "bg-neutral-700"
                  }`}
                />

                {/* halo rings — only pulse once the card is actually revealed;
                pointer-events-none so they never block clicks on the card */}
                {isVisible && (
                  <>
                    <div className="pointer-events-none absolute inset-0 animate-[haloPulse_1.3s_ease-out_infinite] rounded-full border-[1.5px] border-primary-yellow" />
                    <div className="pointer-events-none absolute inset-0 animate-[haloPulse_1.3s_ease-out_infinite] rounded-full border-[1.5px] border-primary-yellow [animation-delay:0.65s]" />
                  </>
                )}
              </div>

              <div
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty(
                    "--mx",
                    `${e.clientX - rect.left}px`,
                  );
                  e.currentTarget.style.setProperty(
                    "--my",
                    `${e.clientY - rect.top}px`,
                  );
                }}
                className="group relative inline-block max-w-full overflow-hidden rounded-2xl border-2 border-[#17f1d199] p-5 text-left backdrop-blur-md transition-[border-color,box-shadow,transform] duration-300"
                style={{
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                {/* spotlight glow — follows the cursor via --mx/--my set on mousemove,
                 only shown on hover via group-hover opacity */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(280px circle at var(--mx, 50%) var(--my, 0%), rgba(250,204,21,0.18), transparent 60%)",
                  }}
                />

                {/* content sits above the spotlight layer */}
                <div className="relative">
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary-yellow">
                    {item.date}
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-primary-white">
                    {item.title}
                  </h3>
                  <div className="mb-2 text-sm text-primary-purple">
                    {item.role}
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-300">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Experiences;
