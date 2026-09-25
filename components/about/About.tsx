"use client";
import { useState } from "react";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import AboutTitle from "./AboutTitle";
import AboutParagraph from "./AboutParagraph";
import AboutImage from "./AboutImage";
import ThreeFlipPills from "../ThreeFlipPills";
import { aboutContents } from "@/content/aboutContents";
import AboutButton from "./AboutButton";

const About = () => {
  const { revealed, registerSection } = useScrollSpy();
  const [activePillsIndex, setActivePillsIndex] = useState<number | null>(null);

  const { pills, EASE } = aboutContents;

  const isRevealed = revealed.has("about");

  return (
    <section
      id="about"
      ref={(el) => registerSection("about", el)}
      className="mt-10 mb-20"
    >
      <div className="flex justify-between items-center my-15">
        {/* Title: wipe-reveal, fires first */}
        <AboutTitle isRevealed={isRevealed} EASE={EASE} />

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

      <div className="flex justify-center items-center gap-10 mb-5">
        <div className="flex flex-col gap-7 w-3/5">
          {/* Paragraph: wipe-reveal, driven by the same isRevealed — no separate observer */}
          <AboutParagraph isRevealed={isRevealed} EASE={EASE} />

          {/* Contact Form Button */}
          <AboutButton isRevealed={isRevealed} EASE={EASE} />
        </div>

        {/* Photo: fades + scales in last; hover effects untouched */}
        <AboutImage isRevealed={isRevealed} EASE={EASE} />
      </div>
    </section>
  );
};

export default About;
