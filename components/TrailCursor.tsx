"use client";
import { useEffect, useRef } from "react";

const DOTS = 8; // number of dots in the trail
const FOLLOW = 0.35; // 0-1, lower = longer, floatier trail
const HEAD_SIZE = 12; // px, size of the dot nearest the cursor
const SHRINK = 1.2; // px each following dot gets smaller
const HEAD = [23, 241, 209]; // teal
const TAIL = [163, 116, 255]; // purple

const TrailCursor = () => {
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // no cursor on touch devices, and respect reduced-motion settings
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const pos = Array.from({ length: DOTS }, () => ({ x: -100, y: -100 }));
    let mouseX = -100;
    let mouseY = -100;
    let frameId = 0;
    let running = false;
    let started = false;

    const tick = () => {
      let targetX = mouseX;
      let targetY = mouseY;
      let moving = false;

      pos.forEach((p, i) => {
        p.x += (targetX - p.x) * FOLLOW;
        p.y += (targetY - p.y) * FOLLOW;

        if (Math.abs(targetX - p.x) > 0.1 || Math.abs(targetY - p.y) > 0.1) {
          moving = true;
        }

        const el = dotsRef.current[i];
        if (el) {
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
        }
        // each dot follows the one before it
        targetX = p.x;
        targetY = p.y;
      });

      // stop the loop once everything has caught up with the mouse
      if (moving) {
        frameId = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // on the first move, snap all dots to the mouse so they don't fly in from the corner
      if (!started) {
        started = true;
        pos.forEach((p) => {
          p.x = mouseX;
          p.y = mouseY;
        });
      }

      dotsRef.current.forEach((el) => el && (el.style.visibility = "visible"));

      if (!running) {
        running = true;
        frameId = requestAnimationFrame(tick);
      }
    };

    const onLeave = () => {
      dotsRef.current.forEach((el) => el && (el.style.visibility = "hidden"));
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div aria-hidden="true">
      {Array.from({ length: DOTS }, (_, i) => {
        const t = i / (DOTS - 1); // 0 = head, 1 = tail
        const [r, g, b] = HEAD.map((h, k) => Math.round(h + (TAIL[k] - h) * t));
        const size = HEAD_SIZE - i * SHRINK;

        return (
          <div
            key={i}
            ref={(el) => {
              dotsRef.current[i] = el;
            }}
            className="pointer-events-none fixed left-0 top-0 z-9999 rounded-full will-change-transform"
            style={{
              width: size,
              height: size,
              opacity: 1 - t * 0.7,
              backgroundColor: `rgb(${r}, ${g}, ${b})`,
              visibility: "hidden",
              transform: "translate3d(-100px, -100px, 0)",
            }}
          />
        );
      })}
    </div>
  );
};

export default TrailCursor;
