import { Dispatch, SetStateAction } from "react";
import { heroContents } from "@/content/heroContents";

const {
  SCRAMBLE_CHARS,
  TYPE_SPEED,
  DELETE_SPEED,
  HOLD_TIME,
  PAUSE_BEFORE_NEXT,
  DOTS_DURATION,
} = heroContents;

// Making Random Characters
export const randomChar = () => {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
};

// Name: Scramble-Decode on Mount
export const nameScrambleDecode = (
  NAME: string,
  setDisplayName: Dispatch<SetStateAction<string>>,
  setNameDecoded: Dispatch<SetStateAction<boolean>>,
) => {
  let frame = 0;
  const totalFrames = 30;
  const revealAt = NAME.split("").map(
    (_, i) => Math.floor((i / NAME.length) * totalFrames * 0.7) + 8,
  );

  const timer = setInterval(() => {
    let out = "";
    for (let i = 0; i < NAME.length; i++) {
      const ch = NAME[i];
      if (ch === " ") {
        out += " ";
        continue;
      }
      out += frame >= revealAt[i] ? ch : randomChar();
    }
    setDisplayName(out);
    frame++;

    if (frame > totalFrames + 8) {
      clearInterval(timer);
      setDisplayName(NAME);
      setNameDecoded(true);
    }
  }, 35);

  return () => clearInterval(timer);
};

// Floating Tags: Scatter Burst From Center Animation
export const floatingTagsScatterBurst = (
  heroEl: HTMLElement | null,
  tagRefs: React.RefObject<(HTMLAnchorElement | null)[]>,
  reduceMotion: boolean,
) => {
  if (!heroEl) return;

  const START_DELAY = 1100;

  const timer = setTimeout(() => {
    const heroRect = heroEl.getBoundingClientRect();
    const centerX = heroRect.width / 2;
    const centerY = heroRect.height / 2 + 40;

    tagRefs.current.forEach((el, i) => {
      if (!el) return;

      if (reduceMotion) {
        el.style.opacity = "1";
        return;
      }

      const r = el.getBoundingClientRect();
      const tagX = r.left - heroRect.left + r.width / 2;
      const tagY = r.top - heroRect.top + r.height / 2;
      const fromX = centerX - tagX;
      const fromY = centerY - tagY;

      el.style.setProperty("--fromx", `${fromX}px`);
      el.style.setProperty("--fromy", `${fromY}px`);
      el.style.animation = "burstOut 0.7s cubic-bezier(.22,1,.36,1) forwards";
      el.style.animationDelay = `${i * 90}ms`;
    });
  }, START_DELAY);

  return () => clearTimeout(timer);
};

// Role line: typewriter
export const roleTypewriterFunction = (
  ROLES: string[],
  setRoleText: Dispatch<SetStateAction<string>>,
  setShowDots: Dispatch<SetStateAction<boolean>>,
) => {
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  const tick = () => {
    const current = ROLES[roleIndex];

    if (!deleting) {
      charIndex++;
      setRoleText(current.slice(0, charIndex));

      if (charIndex === current.length) {
        deleting = true;
        timeoutId = setTimeout(tick, HOLD_TIME);
        return;
      }
      timeoutId = setTimeout(tick, TYPE_SPEED);
    } else {
      charIndex--;
      setRoleText(current.slice(0, charIndex));

      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % ROLES.length;
        timeoutId = setTimeout(tick, PAUSE_BEFORE_NEXT);
        return;
      }
      timeoutId = setTimeout(tick, DELETE_SPEED);
    }
  };

  const dotsTimer = setTimeout(() => {
    setShowDots(false);
    timeoutId = setTimeout(tick, TYPE_SPEED);
  }, DOTS_DURATION);

  return () => {
    clearTimeout(dotsTimer);
    clearTimeout(timeoutId);
  };
};

// Magnetic letters
export const magneticLetters = (
  heroEl: HTMLElement | null,
  nameEl: HTMLElement | null,
) => {
  const handleMove = (e: MouseEvent) => {
    const spans = nameEl!.querySelectorAll<HTMLSpanElement>("span");
    const radius = 90;
    const colors = ["#A374FF", "#FFD074", "#17F1D1"];

    spans.forEach((span, i) => {
      const r = span.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const s = 1 - dist / radius;
        span.style.transform = `translateY(${-12 * s}px) scale(${1 + 0.3 * s})`;
        span.style.color = colors[i % colors.length];
      } else {
        span.style.transform = "translateY(0) scale(1)";
        span.style.color = "";
      }
    });
  };

  if (!heroEl) return;

  heroEl.addEventListener("mousemove", handleMove);
  return () => heroEl.removeEventListener("mousemove", handleMove);
};
