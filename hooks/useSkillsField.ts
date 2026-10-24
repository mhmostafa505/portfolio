"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ParticleField } from "@/utils/skillsFunctions/ParticleField";
import { sampleSkill } from "@/utils/skillsFunctions/sampleIcon";
import { SKILLS } from "@/content/skillsContents";
import type { FieldEvents } from "@/types/skillsTypes";

interface Options {
  stageRef: RefObject<HTMLDivElement | null>;
  bgRef: RefObject<HTMLCanvasElement | null>;
  fgRef: RefObject<HTMLCanvasElement | null>;
  events: FieldEvents;
}

export function useSkillsField({ stageRef, bgRef, fgRef, events }: Options) {
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    const stage = stageRef.current;
    const bg = bgRef.current;
    const fg = fgRef.current;
    if (!stage || !bg || !fg) return;

    const field = new ParticleField(bg, fg, SKILLS, {
      onStart: () => eventsRef.current.onStart(),
      onSlam: (skill, order) => eventsRef.current.onSlam(skill, order),
      onIntroEnd: () => eventsRef.current.onIntroEnd(),
      onHover: (index) => eventsRef.current.onHover(index),
    });

    let cancelled = false;
    let ready = false;
    let visible = false;

    // The intro only starts when icons are decoded AND the section is on screen.
    const sync = () => {
      if (!ready) return;
      if (visible) field.start();
      else field.pause();
    };

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        field.resize(Math.round(rect.width), Math.round(rect.height));
      }
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(stage);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.6 },
    );
    visibilityObserver.observe(stage);

    Promise.allSettled(SKILLS.map(sampleSkill)).then((results) => {
      if (cancelled) return;
      field.setSamples(
        results.map((r) => (r.status === "fulfilled" ? r.value : [])),
      );
      ready = true;
      sync();
    });

    const onMove = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      field.setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const onLeave = () => field.setPointer(null);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("pointercancel", onLeave);

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointercancel", onLeave);
      field.destroy();
    };
  }, [stageRef, bgRef, fgRef]);
}
