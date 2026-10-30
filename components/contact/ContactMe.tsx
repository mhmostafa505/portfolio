"use client";
import { useCallback, useState } from "react";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import SectionHeader from "../SectionHeader";

const pills = ["#Gmail", "#Telegram", "#Discord"];

const ContactMe = () => {
  const { registerSection } = useScrollSpy();
  const [activePillsIndex, setActivePillsIndex] = useState<number | null>(null);

  const setContactRef = useCallback(
    (el: HTMLElement | null) => registerSection("contact", el),
    [registerSection],
  );

  return (
    <section
      id="contactMe"
      ref={setContactRef}
      className="mt-10 mb-40 scroll-mt-37"
    >
      {/* Title and Pills */}
      <SectionHeader
        pills={pills}
        activePillsIndex={activePillsIndex}
        setActivePillsIndex={setActivePillsIndex}
        color="primary-yellow"
        title="Contact Me"
        number={5}
        isReverse={false}
      />
    </section>
  );
};

export default ContactMe;
