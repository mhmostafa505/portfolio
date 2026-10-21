"use client";
import { useCallback, useState } from "react";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import SectionHeader from "../SectionHeader";

const pills = ["#Noob", "#Professional", "#Master"];

const Skills = () => {
  const { registerSection } = useScrollSpy();
  const [activePillsIndex, setActivePillsIndex] = useState<number | null>(null);

  const setSkillsRef = useCallback(
    (el: HTMLElement | null) => registerSection("skills", el),
    [registerSection],
  );

  return (
    <section
      id="skills"
      ref={setSkillsRef}
      className="mt-10 mb-40 scroll-mt-37"
    >
      {/* Title and Pills */}
      <SectionHeader
        pills={pills}
        activePillsIndex={activePillsIndex}
        setActivePillsIndex={setActivePillsIndex}
        color="primary-purple"
        title="Skills"
        number={4}
        isReverse={true}
      />
    </section>
  );
};

export default Skills;
