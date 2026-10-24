"use client";

import { useMemo, useRef, useState } from "react";
import LetterBoxBars from "./SkillsLetterBoxBars";
import { useSkillsField } from "@/hooks/useSkillsField";
import { flash, shake } from "@/utils/skillsFunctions/effects";
import { SKILLS } from "@/content/skillsContents";
import { FieldEvents } from "@/types/skillsTypes";

const SkillsField = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);

  const [introActive, setIntroActive] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const events = useMemo<FieldEvents>(
    () => ({
      onStart: () => setIntroActive(true),
      onSlam: (skill) => {
        const hero = Boolean(skill.hero);
        if (labelRef.current) {
          labelRef.current.textContent = skill.name;
          labelRef.current.style.opacity = "1";
        }
        flash(flashRef.current, hero ? 0.45 : 0.22, hero ? 320 : 160);
        shake(worldRef.current, hero ? 10 : 6, hero ? 260 : 160);
      },
      onIntroEnd: () => {
        setIntroActive(false);
        if (labelRef.current) labelRef.current.style.opacity = "0";
        flash(flashRef.current, 0.6, 450);
      },
      onHover: setHoveredIndex,
    }),
    [],
  );

  useSkillsField({ stageRef, bgRef, fgRef, events });

  const hoveredSkill = hoveredIndex === null ? null : SKILLS[hoveredIndex];

  return (
    <div
      ref={stageRef}
      className="relative left-1/2 h-svh min-h-130 w-screen -translate-x-1/2 touch-pan-y overflow-hidden"
    >
      <div ref={worldRef} className="absolute inset-0">
        <canvas
          ref={bgRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        />
        <canvas
          ref={fgRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        />
        <p
          ref={labelRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[14%] text-center text-xl font-medium tracking-[0.25em] opacity-0"
        />
      </div>

      <LetterBoxBars
        open={introActive || hoveredIndex !== null}
        skill={hoveredSkill}
      />

      <div
        ref={flashRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 bg-primary-white opacity-0"
      />

      <ul className="sr-only">
        {SKILLS.map((skill) => (
          <li key={skill.id}>{skill.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SkillsField;
