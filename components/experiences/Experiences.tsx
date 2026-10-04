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
import ExperiencesScrollMousePill from "./ExperiencesScrollMousePill";
import ExperienceCard from "./ExperienceCard";
import ExperienceCardLogos from "./ExperienceCardLogos";
import { experienceContents } from "@/content/experiencesContents";
import { updateProgress } from "@/utils/experiencesFunctions";

const pills = ["#BootCamp", "#Brad-Traversy", "#Front-End"];

const Experiences = () => {
  const { registerSection } = useScrollSpy();
  const [activePillsIndex, setActivePillsIndex] = useState<number | null>(null);
  const [dotTop, setDotTop] = useState(0);
  const [dotOffsets, setDotOffsets] = useState<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isBouncing, setIsBouncing] = useState(true);
  const [introStarted, setIntroStarted] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetHeightRef = useRef(0);
  const dotTopRef = useRef(0);

  const setItemRef = (index: number, element: HTMLDivElement | null) => {
    itemRefs.current[index] = element;
  };

  // Data Import
  const { experienceItems, DOT_LERP_FACTOR } = experienceContents;

  const setExperiencesRef = useCallback(
    (el: HTMLElement | null) => registerSection("experiences", el),
    [registerSection],
  );

  // Measure experience card positions for timeline progress
  useLayoutEffect(() => {
    const measure = () => {
      setDotOffsets(itemRefs.current.map((el) => (el ? el.offsetTop : 0)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Track scroll progress and update timeline animations
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        ticking = true;

        requestAnimationFrame(() => {
          ticking = false;
          updateProgress({
            timelineRef,
            setIsBouncing,
            setIntroDone,
            setIntroStarted,
            targetHeightRef,
            setVisibleCount,
            dotOffsets,
          });
        });
      }
    };

    updateProgress({
      timelineRef,
      setIsBouncing,
      setIntroDone,
      setIntroStarted,
      targetHeightRef,
      setVisibleCount,
      dotOffsets,
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [dotOffsets]);

  // Smoothly animate the timeline dot toward its target position
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
  }, [DOT_LERP_FACTOR]);

  return (
    <section
      id="experiences"
      ref={setExperiencesRef}
      className="mt-10 mb-20 scroll-mt-40"
    >
      {/* Title and Pills */}
      <SectionHeader
        pills={pills}
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
        {/* Colored Progress Line */}
        {!isBouncing && (
          <div
            className="absolute left-1/2 top-0 w-1 -translate-x-1/2 rounded-full bg-linear-to-b from-primary-yellow to-primary-yellow/40 max-sm:left-5 max-sm:translate-x-0"
            style={{ height: dotTop }}
          />
        )}

        {/* Scroll-Mouse Pill */}
        <ExperiencesScrollMousePill
          setIntroDone={setIntroDone}
          isBouncing={isBouncing}
          introDone={introDone}
          introStarted={introStarted}
          dotTop={dotTop}
        />

        {/* Experience Cards */}
        {experienceItems.map((item, i) => {
          const isLeft = i % 2 === 0;
          const isVisible = i < visibleCount;

          return (
            <ExperienceCard
              key={i}
              item={item}
              setItemRef={setItemRef}
              isLeft={isLeft}
              isVisible={isVisible}
              index={i}
            >
              <ExperienceCardLogos index={i} />
            </ExperienceCard>
          );
        })}
      </div>
    </section>
  );
};

export default Experiences;
