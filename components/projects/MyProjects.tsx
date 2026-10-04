"use client";

import { useCallback, useState } from "react";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import SectionHeader from "../SectionHeader";

const pills = ["#E-Commerce", "#Twitter-Demo", "#TaskManager"];

const MyProjects = () => {
  const { registerSection } = useScrollSpy();
  const [activePillsIndex, setActivePillsIndex] = useState<number | null>(null);

  const setProjectsRef = useCallback(
    (el: HTMLElement | null) => registerSection("projects", el),
    [registerSection],
  );

  return (
    <section
      id="projects"
      ref={setProjectsRef}
      className="mt-40 mb-40 scroll-mt-35"
    >
      {/* Title and Pills */}
      <SectionHeader
        pills={pills}
        activePillsIndex={activePillsIndex}
        setActivePillsIndex={setActivePillsIndex}
        color="primary-hover"
        title="My Projects"
        number={3}
        isReverse={false}
      />

      {/* Main Project Box */}
    </section>
  );
};

export default MyProjects;
