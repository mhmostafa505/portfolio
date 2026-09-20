"use client";
import { useState } from "react";
import Image from "next/image";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import ThreeFlipPills from "./ThreeFlipPills";
import AboutSpanFlipText from "./AboutSpanFlipText";
import { FaQuoteRight } from "react-icons/fa";
import photo from "@/assets/images/about-me-photo.webp";

const pills = ["#React", "#Front-End", "#Next.js"];
const EASE = "cubic-bezier(0.22,1,0.36,1)";

const About = () => {
  const { revealed, registerSection } = useScrollSpy();
  const [activePillsIndex, setActivePillsIndex] = useState<number | null>(null);

  const isRevealed = revealed.has("about");

  return (
    <section id="about" ref={(el) => registerSection("about", el)}>
      <div className="flex justify-between items-center my-15">
        {/* Title: wipe-reveal, fires first */}
        <div className="relative overflow-hidden pr-10 py-2">
          <h2
            className="relative text-5xl font-black ml-9.5"
            style={{
              transform: isRevealed ? "translateY(0)" : "translateY(110%)",
              transition: `transform 0.7s ${EASE}`,
              transitionDelay: "0.1s",
            }}
          >
            <span className="font-mono text-xl text-primary-purple pr-2">
              01.
            </span>
            About Me
            <FaQuoteRight
              size={20}
              className="absolute -top-2 -right-8 text-primary-purple"
            />
          </h2>
          <div
            className="absolute inset-0 bg-primary-purple pointer-events-none"
            style={{
              transformOrigin: "right",
              transform: isRevealed ? "scaleX(0)" : "scaleX(1)",
              transition: `transform 0.7s ${EASE}`,
              transitionDelay: "0.1s",
            }}
          />
        </div>

        {/* Pills: slide up, staggered, after the title */}
        <div className="flex items-center gap-12 mr-15">
          {pills.map((text, i) => (
            <div
              key={text}
              style={{
                opacity: isRevealed ? 1 : 0,
                transform: isRevealed ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.6s ${EASE}`,
                transitionDelay: `${0.5 + i * 0.12}s`,
              }}
            >
              <ThreeFlipPills
                key={text}
                text={text}
                flipped={activePillsIndex === i}
                onClick={() =>
                  setActivePillsIndex((prev) => (prev === i ? null : i))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center gap-10 mb-10">
        {/* Paragraph: wipe-reveal, driven by the same isRevealed — no separate observer */}
        <div className="relative w-3/5 overflow-hidden text-[23px]/relaxed">
          <p
            style={{
              transform: isRevealed ? "translateY(0)" : "translateY(110%)",
              transition: `transform 0.8s ${EASE}`,
              transitionDelay: "0.3s",
            }}
          >
            I&apos;m{" "}
            <strong className="inline-block text-primary-hover hover:-rotate-2 transition-transform duration-200">
              Mohammad Hossein Mostafa
            </strong>
            , a{" "}
            <span className="inline-block group">
              <span className="inline-block text-primary-yellow group-hover:animate-[bounceOnce_0.5s_ease]">
                Front-End Developer
              </span>
            </span>{" "}
            who loves turning ideas into clean, responsive, and genuinely
            enjoyable web experiences. I work mainly with{" "}
            <AboutSpanFlipText text="React" className="text-primary-purple" />,{" "}
            <AboutSpanFlipText
              text="TypeScript"
              className="text-primary-hover"
            />
            , and{" "}
            <AboutSpanFlipText text="Next.js" className="text-primary-yellow" />
            , building projects like a task manager, an e-commerce platform, and
            a Twitter-inspired social app — each one an excuse to sharpen my eye
            for UI/UX and my instinct for reusable, maintainable code. These
            days I&apos;m thinking about exploring animations and 3D web
            experiences with tools like Three.js — and who knows, full-stack
            development might be next!
          </p>
          <div
            className="absolute inset-0 bg-primary-purple pointer-events-none"
            style={{
              transformOrigin: "right",
              transform: isRevealed ? "scaleX(0)" : "scaleX(1)",
              transition: `transform 0.8s ${EASE}`,
              transitionDelay: "0.3s",
            }}
          ></div>
        </div>

        {/* Photo: fades + scales in last; hover effects untouched */}
        <div
          className="group relative w-92 h-92 rounded-full overflow-hidden border-6 border-primary-hover hover:border-primary-yellow transition-colors duration-500"
          style={{
            opacity: isRevealed ? 1 : 0,
            transform: isRevealed ? "scale(1)" : "scale(0.85)",
            transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
            transitionDelay: "0.6s",
          }}
        >
          <Image
            src={photo}
            alt="My-Photo"
            fill
            sizes="360px"
            className="object-cover rotate-12 pl-10 pb-17 scale-160"
          />
          {/* scan bar */}
          <div
            className="pointer-events-none absolute inset-x-0 h-5 bg-white/60 blur-sm
               -translate-y-10 transition-transform duration-700 ease-in-out
               group-hover:translate-y-95"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
