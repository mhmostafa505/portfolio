"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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
    date: "2024 — Present",
    title: "Senior Frontend Engineer",
    role: "Example Co.",
    description:
      "Leading the redesign of the core product's design system and shipping performance improvements across the app shell.",
  },
  {
    date: "2022 — 2024",
    title: "Frontend Engineer",
    role: "Another Startup",
    description:
      "Built the marketing site and onboarding flow from scratch using Next.js and Tailwind, cutting load time by 40%.",
  },
  {
    date: "2020 — 2022",
    title: "Junior Developer",
    role: "First Job Inc.",
    description:
      "Worked across the stack on internal tools, picked up React, and shipped my first production features.",
  },
  {
    date: "2019",
    title: "Computer Science Degree",
    role: "University",
    description:
      "Graduated, built a few side projects, and started freelancing on small web apps.",
  },
];

const CUE_TO_TRAVELER_THRESHOLD = 0.02;

const Experiences = () => {
  const { revealed, registerSection } = useScrollSpy();
  const [activePillsIndex, setActivePillsIndex] = useState<number | null>(null);
  const [progressHeight, setProgressHeight] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);
  const [cueVisible, setCueVisible] = useState(true);

  const timelineRef = useRef<HTMLDivElement>(null);

  const isRevealed = revealed.has("experiences");

  const setExperiencesRef = useCallback(
    (el: HTMLElement | null) => registerSection("experiences", el),
    [registerSection],
  );

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      ticking = false;
      const el = timelineRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height;

      const scrolled = Math.min(Math.max(vh * 0.5 - rect.top, 0), total);
      const fraction = total > 0 ? scrolled / total : 0;

      setProgressHeight(fraction * total);
      setCueVisible(fraction <= CUE_TO_TRAVELER_THRESHOLD);
      setVisibleCount(
        experienceItems.reduce(
          (count, _, i) =>
            fraction >= i / experienceItems.length + 0.06 ? count + 1 : count,
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
        className="relative mx-auto max-w-3xl px-4 pb-32 pt-8 mt-30"
      >
        {/* colored progress line only — no visible base track */}
        <div
          className="absolute left-1/2 top-0 w-1 -translate-x-1/2 rounded-full bg-linear-to-b from-primary-yellow to-primary-yellow/40 max-sm:left-5 max-sm:translate-x-0"
          style={{ height: progressHeight }}
        />

        {/* bouncing scroll cue */}
        <div
          className="absolute left-1/2 -top-4 -ml-4 z-10 h-8 w-8 animate-[bounceDot_1.4s_ease-in-out_infinite] rounded-full bg-primary-yellow shadow-[0_0_0_4px_rgba(250,204,21,0.15)] transition-opacity duration-500 ease-out max-sm:left-5 max-sm:ml-0"
          style={{ opacity: cueVisible ? 1 : 0 }}
        />

        {/* traveler dot riding the tip of the line */}
        <div
          className="absolute left-1/2 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-yellow shadow-[0_0_0_5px_rgba(250,204,21,0.15),0_0_12px_rgba(250,204,21,0.5)] transition-opacity duration-500 ease-out max-sm:left-5 max-sm:translate-x-0"
          style={{
            top: progressHeight,
            opacity: cueVisible ? 0 : 1,
          }}
        />

        {experienceItems.map((item, i) => {
          const isLeft = i % 2 === 0;
          const isVisible = i < visibleCount;

          return (
            <div
              key={item.title}
              className={`relative w-1/2 pb-16 transition-all duration-500 last:pb-0 max-sm:w-full max-sm:pl-11 max-sm:pr-0 max-sm:text-left ${
                isLeft ? "left-0 pr-10 text-right" : "left-1/2 pl-10 text-left"
              } max-sm:left-0 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0"
              }`}
            >
              <div
                className={`absolute top-0.5 h-6 w-6 rounded-full border-2 transition-colors duration-300 max-sm:left-3.5 max-sm:right-auto ${
                  isLeft ? "-right-3" : "-left-3"
                } ${
                  isVisible
                    ? "border-primary-yellow bg-primary-yellow shadow-[0_0_0_4px_rgba(250,204,21,0.15)]"
                    : "border-neutral-700 bg-neutral-900"
                }`}
              />

              <div className="inline-block max-w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-left">
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary-yellow">
                  {item.date}
                </div>
                <h3 className="mb-1 text-base font-semibold text-primary-white">
                  {item.title}
                </h3>
                <div className="mb-2 text-sm text-neutral-400">{item.role}</div>
                <p className="text-sm leading-relaxed text-neutral-300">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Experiences;
