"use client";
import { useCallback, useState } from "react";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import AboutParagraph from "./AboutParagraph";
import AboutImage from "./AboutImage";
import AboutButton from "./AboutButton";
import SectionHeader from "../SectionHeader";
import { EASE } from "@/content/ease";

const pills = ["#React", "#TypeScript", "#Next.js"];

const About = () => {
  const { revealed, registerSection } = useScrollSpy();
  const [activePillsIndex, setActivePillsIndex] = useState<number | null>(null);

  const isRevealed = revealed.has("about");

  const setAboutRef = useCallback(
    (el: HTMLElement | null) => registerSection("about", el),
    [registerSection],
  );

  return (
    <section id="about" ref={setAboutRef} className="mt-10 mb-40 scroll-mt-37">
      {/* Title and Pills */}
      <SectionHeader
        pills={pills}
        isRevealed={isRevealed}
        EASE={EASE}
        activePillsIndex={activePillsIndex}
        setActivePillsIndex={setActivePillsIndex}
        color="primary-purple"
        title="About Me"
        number={1}
        isReverse={false}
      />

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
