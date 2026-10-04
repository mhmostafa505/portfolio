"use client";
import { useEffect, useRef } from "react";

const PULL_RADIUS = 110; // px — how far from the icon's center the field reaches
const STRENGTH = 0.45; // 0–1 — how much of the distance it travels at full pull

interface MagneticIconProps {
  children: React.ReactNode;
  className?: string; // positioning classes go here (top-*, left-*, right-*, absolute)
}

const MagneticIcon = ({ children, className = "" }: MagneticIconProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const wrap = wrapRef.current;
      const icon = iconRef.current;
      if (!wrap || !icon) return;

      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < PULL_RADIUS) {
        const pull = (1 - dist / PULL_RADIUS) * STRENGTH;
        icon.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
      } else {
        icon.style.transform = "translate(0, 0)";
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={wrapRef} className={className}>
      <div ref={iconRef} className="transition-transform duration-150 ease-out">
        {children}
      </div>
    </div>
  );
};

export default MagneticIcon;
