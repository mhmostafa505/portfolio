"use client";

import { useMemo, useRef, useState } from "react";
import LetterBoxBars from "./SkillsLetterBoxBars";
import { useSkillsField } from "@/hooks/useSkillsField";
import { flash, shake } from "@/utils/skillsFunctions/effects";
import { SKILLS, STAGE, STAGE_INTRO_HEIGHT } from "@/content/skillsContents";
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
  const [settled, setSettled] = useState(false);

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
        setSettled(true);
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
      className="relative left-1/2 flex w-screen -translate-x-1/2 touch-pan-y items-center overflow-hidden transition-[height] duration-1000 ease-out [overflow-anchor:none]"
      style={{ height: settled ? STAGE.settledHeight : STAGE_INTRO_HEIGHT }}
    >
      <div
        ref={worldRef}
        className="relative w-full shrink-0"
        style={{ height: STAGE_INTRO_HEIGHT }}
      >
        <canvas
          ref={bgRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        />
        <canvas
          ref={fgRef}
          aria-hidden
          className="absolute inset-0 h-full w-full"
        />
        <p
          ref={labelRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[14%] text-center text-xl font-medium tracking-[0.25em] opacity-0"
        />
      </div>

      {/* <LetterBoxBars
        open={introActive || hoveredIndex !== null}
        skill={hoveredSkill}
      /> */}

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
