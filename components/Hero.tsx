"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import HeroTitle from "./HeroTitle";
import HeroFloatingTags from "./HeroFloatingTags";
import HeroRoles from "./HeroRoles";
import HeroDownloadCVButton from "./HeroDownloadCVButton";
import {
  floatingTagsScatterBurst,
  magneticLetters,
  nameScrambleDecode,
  roleTypewriterFunction,
} from "@/utils/heroFunctions";
import { heroBackground } from "@/utils/heroBackgroundFunction";
import { heroContents } from "@/content/heroContents";

const { NAME, ROLES } = heroContents;

const useHasMounted = () => {
  return useSyncExternalStore(
    () => () => {}, // subscribe: no-op, nothing to subscribe to
    () => true, // client snapshot
    () => false, // server snapshot
  );
};

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tagRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [displayName, setDisplayName] = useState(NAME);
  const [nameDecoded, setNameDecoded] = useState(false);
  const [roleText, setRoleText] = useState("");
  const [hasEntered, setHasEntered] = useState(false);
  const [showDots, setShowDots] = useState(true);

  const { registerSection } = useScrollSpy();

  const hasMounted = useHasMounted();

  // Name: scramble-decode on mount
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      queueMicrotask(() => {
        setDisplayName(NAME);
        setNameDecoded(true);
      });
      return;
    }

    return nameScrambleDecode(NAME, setDisplayName, setNameDecoded);
  }, []);

  // Floating Tags: Scatter Burst From Center Animation
  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    return floatingTagsScatterBurst(heroEl, tagRefs, reduceMotion);
  }, []);

  // Role line: typewriter, types then deletes then types the next
  useEffect(() => {
    if (!nameDecoded) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      queueMicrotask(() => setRoleText(ROLES[0]));
      return;
    }

    return roleTypewriterFunction(ROLES, setRoleText, setShowDots);
  }, [nameDecoded]);

  // Magnetic letters: nudge nearby letters toward the cursor
  useEffect(() => {
    const heroEl = heroRef.current;
    const nameEl = nameRef.current;
    if (!heroEl || !nameEl) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    return magneticLetters(heroEl, nameEl);
  }, []);

  // Particle constellation background
  useEffect(() => {
    const canvas = canvasRef.current;
    const heroEl = heroRef.current;
    if (!canvas || !heroEl) return;

    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!ctx || reduceMotion) return;

    return heroBackground(canvas, heroEl, ctx);
  }, []);

  return (
    <section
      id="home"
      ref={(el) => {
        heroRef.current = el;
        registerSection("home", el);
      }}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center bg-primary-bg"
    >
      {/* Background */}
      <canvas ref={canvasRef} className="absolute w-full inset-0 z-1" />

      {/* FloatingTags */}
      <HeroFloatingTags tagRefs={tagRefs} />

      <div className="relative z-3 px-5">
        {/* Title */}
        <HeroTitle />

        {/* Name */}
        <h1
          ref={nameRef}
          className="mb-4 text-5xl font-bold leading-none text-primary-white sm:text-7xl cursor-default"
        >
          {(hasMounted ? displayName : NAME).split("").map((ch, i) => (
            <span
              key={i}
              className="inline-block transition-transform duration-150 ease-out"
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h1>

        {/* Role Text Cycling */}
        <HeroRoles roleText={roleText} showDots={showDots} />

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-3.5">
          <Link
            href="#projects"
            onAnimationEnd={() => setHasEntered(true)}
            className={`group inline-flex items-center gap-2 rounded-lg bg-primary-white px-6 py-3 text-sm text-primary-bg ${
              hasEntered
                ? "opacity-100"
                : "animate-[riseBounce_0.6s_cubic-bezier(.22,1,.36,1)_forwards] opacity-0"
            }`}
            style={{ animationDelay: "400ms" }}
          >
            <span className="glitch-label" data-text="View my work">
              View my work
            </span>
          </Link>

          <HeroDownloadCVButton />
        </div>
      </div>
    </section>
  );
};

export default Hero;
