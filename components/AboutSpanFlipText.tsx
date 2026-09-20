"use client";
import { useState } from "react";

interface AboutSpanFlipTextProps {
  text: string;
  className?: string;
}

const AboutSpanFlipText = ({
  text,
  className = "",
}: AboutSpanFlipTextProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-block cursor-default perspective-[400px] ${className}`}
    >
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="inline-block transition-transform duration-400 ease-in-out"
          style={{
            transform: hovered ? "rotateX(360deg)" : "rotateX(0deg)",
            transitionDelay: hovered ? `${i * 40}ms` : "0ms",
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
};

export default AboutSpanFlipText;
