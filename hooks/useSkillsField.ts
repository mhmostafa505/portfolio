"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ParticleField } from "@/utils/skillsFunctions/ParticleField";
import { sampleSkill } from "@/utils/skillsFunctions/sampleIcon";
import {
  animateScrollTo,
  getAlignTarget,
  onScrollIdle,
} from "@/utils/skillsFunctions/skillsScroll";
import { SKILLS, SCROLL } from "@/content/skillsContents";
import type { FieldEvents } from "@/types/skillsTypes";

interface Options {
  stageRef: RefObject<HTMLDivElement | null>;
  bgRef: RefObject<HTMLCanvasElement | null>;
  fgRef: RefObject<HTMLCanvasElement | null>;
  nameRef: RefObject<HTMLCanvasElement | null>;
  events: FieldEvents;
}

export function useSkillsField({
  stageRef,
  bgRef,
  fgRef,
  nameRef,
  events,
}: Options) {
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    const stage = stageRef.current;
    const bg = bgRef.current;
    const fg = fgRef.current;
    const name = nameRef.current;
    if (!stage || !bg || !fg || !name) return;

    let introRunning = false;
    const field = new ParticleField(bg, fg, name, SKILLS, {
      onSlam: (skill, order) => eventsRef.current.onSlam(skill, order),
      onIntroEnd: () => {
        introRunning = false;
        eventsRef.current.onIntroEnd();
      },
    });

    let cancelled = false;
    let started = false;
    let ready = false; // icons decoded
    let triggered = false; // the user stopped on the section: intro is allowed to run
    let ratio = 0; // how much of the stage is on screen
    let cancelScroll = () => {};

    const sync = () => {
      if (!ready || !triggered) return;
      if (ratio > 0) {
        if (!started) {
          started = true;
          introRunning = true;
        }
        field.start();
      } else field.pause();
    };

    const align = () => {
      cancelScroll();
      cancelScroll = animateScrollTo(getAlignTarget(stage), SCROLL.duration);
    };

    // Runs a moment after the page stops scrolling
    const onIdle = () => {
      if (!ready || ratio < SCROLL.enterRatio) return;
      if (!triggered) {
        triggered = true; // first time: start the intro and bring the stage fully into view
        sync();
        align();
      } else if (introRunning) {
        align(); // intro is playing: put the stage back in place if it was nudged
      }
    };

    // The canvas is a fixed size, so measure the canvas (not the stage)
    const measure = () => {
      const rect = bg.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        field.resize(Math.round(rect.width), Math.round(rect.height));
      }
    };
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(bg);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        ratio = entry.intersectionRatio;
        sync();
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    visibilityObserver.observe(stage);

    const stopIdleWatch = onScrollIdle(onIdle);

    Promise.allSettled(SKILLS.map(sampleSkill)).then((results) => {
      if (cancelled) return;
      field.setSamples(
        results.map((r) => (r.status === "fulfilled" ? r.value : [])),
      );
      ready = true;
      onIdle();
    });

    // The mouse position is kept relative to the window, so scrolling can be handled
    let clientX: number | null = null;
    let clientY = 0;

    const syncPointer = () => {
      if (clientX === null) {
        field.setPointer(null);
        return;
      }
      // Is the stage really under the mouse? (it may have scrolled away or be behind the navbar)
      const el = document.elementFromPoint(clientX, clientY);
      if (!el || !stage.contains(el)) {
        field.setPointer(null);
        return;
      }
      const rect = bg.getBoundingClientRect();
      field.setPointer({ x: clientX - rect.left, y: clientY - rect.top });
    };

    const onMove = (e: PointerEvent) => {
      clientX = e.clientX;
      clientY = e.clientY;
      syncPointer();
    };
    const onLeave = () => {
      clientX = null;
      field.setPointer(null);
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("pointercancel", onLeave);
    // The page can scroll under a still mouse, and no pointer event fires then
    window.addEventListener("scroll", syncPointer, {
      passive: true,
      capture: true,
    });

    return () => {
      cancelled = true;
      cancelScroll();
      stopIdleWatch();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointercancel", onLeave);
      window.removeEventListener("scroll", syncPointer, true);
      field.destroy();
    };
  }, [stageRef, bgRef, fgRef, nameRef]);
}
