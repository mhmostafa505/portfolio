"use client";

import { useMemo, useRef, useState } from "react";
import { useSkillsField } from "@/hooks/useSkillsField";
import { flash, shake } from "@/utils/skillsFunctions/effects";
import { SKILLS, STAGE } from "@/content/skillsContents";
import { FieldEvents } from "@/types/skillsTypes";

const SkillsField = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const fgRef = useRef<HTMLCanvasElement>(null);
  const nameRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);

  const [settled, setSettled] = useState(false);

  const events = useMemo<FieldEvents>(
    () => ({
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
        if (labelRef.current) labelRef.current.style.opacity = "0";
        flash(flashRef.current, 0.6, 450);
      },
    }),
    [],
  );

  useSkillsField({ stageRef, bgRef, fgRef, nameRef, events });

  const introHeight = STAGE.introHeight;

  return (
    <div
      ref={stageRef}
      className="relative left-1/2 flex w-screen -translate-x-1/2 touch-pan-y items-center overflow-hidden transition-[height] duration-1000 ease-out [overflow-anchor:none]"
      style={{ height: settled ? STAGE.settledHeight : introHeight }}
    >
      <div
        ref={worldRef}
        className="relative w-full shrink-0"
        style={{ height: introHeight }}
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
        <canvas
          ref={nameRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        />

        <p
          ref={labelRef}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[14%] text-center text-xl font-medium tracking-[0.25em] opacity-0"
        />
      </div>

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
