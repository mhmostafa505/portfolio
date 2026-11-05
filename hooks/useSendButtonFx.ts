"use client";
import { useCallback, useEffect, useRef, type PointerEvent } from "react";
import {
  createRipple,
  getButtonPoint,
  type ButtonPoint,
} from "@/utils/contactMeFunctions/sendButtonRipple";
import {
  createEyes,
  holdIcon,
  releaseIcon,
} from "@/utils/contactMeFunctions/sendButtonIcon";
import { spawnRisingIcon } from "@/utils/contactMeFunctions/sendButtonRise";
import { SEND_BUTTON_FX } from "@/content/contactMeContents";

// Finds the draw-loop paths inside the icon slot
const getPaths = (slot: HTMLElement | null) =>
  Array.from(slot?.querySelectorAll<SVGPathElement>(".send-draw") ?? []);

// All hover effects of the contact Send button (ripple, eyes, icon loop, rising icons)
export const useSendButtonFx = (disabled: boolean) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const riseRef = useRef<HTMLSpanElement>(null);
  const linesRef = useRef<SVGGElement>(null);
  const eyesRef = useRef<SVGGElement>(null);

  const ripple = useRef<ReturnType<typeof createRipple> | null>(null);
  const eyes = useRef<ReturnType<typeof createEyes> | null>(null);
  const riseTimer = useRef<number | null>(null);
  const riseCount = useRef(0);
  const isHovered = useRef(false);
  const lastPoint = useRef<ButtonPoint | null>(null);

  const stopRise = useCallback(() => {
    if (riseTimer.current !== null) {
      window.clearInterval(riseTimer.current);
      riseTimer.current = null;
    }
  }, []);

  // Shows the eyes and hides the two text lines (or puts everything back)
  const showEyes = useCallback((show: boolean) => {
    if (linesRef.current) linesRef.current.style.opacity = show ? "0" : "";
    if (eyesRef.current) eyesRef.current.style.opacity = show ? "1" : "";
  }, []);

  // One rising icon right away, then one every few hundred ms
  const startRise = () => {
    const layer = riseRef.current;
    const button = buttonRef.current;
    if (!layer || !button) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    stopRise();
    spawnRisingIcon(layer, button, riseCount.current++);
    riseTimer.current = window.setInterval(
      () => spawnRisingIcon(layer, button, riseCount.current++),
      SEND_BUTTON_FX.riseEveryMs,
    );
  };

  // Stops every effect (mouse left, or the button got disabled while hovered)
  const endHover = useCallback(
    (point: ButtonPoint) => {
      if (!isHovered.current) return;

      isHovered.current = false;
      showEyes(false);
      releaseIcon(getPaths(slotRef.current));
      eyes.current?.release();
      stopRise();
      ripple.current?.leave(point);
    },
    [showEyes, stopRise],
  );

  // Create the ripple and eyes once, clean everything up on unmount
  useEffect(() => {
    if (rippleRef.current) ripple.current = createRipple(rippleRef.current);
    if (slotRef.current) eyes.current = createEyes(slotRef.current);
    return () => {
      ripple.current?.destroy();
      eyes.current?.destroy();
      stopRise();
    };
  }, [stopRise]);

  // If the button locks while the mouse is on it, the leave event never comes, so end it here
  useEffect(() => {
    const button = buttonRef.current;
    if (!disabled || !button) return;
    const rect = button.getBoundingClientRect();
    endHover(
      lastPoint.current ?? {
        x: rect.width / 2,
        y: rect.height / 2,
        w: rect.width,
        h: rect.height,
      },
    );
  }, [disabled, endHover]);

  const onPointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button || disabled || e.pointerType === "touch") return;

    const point = getButtonPoint(button, e);
    isHovered.current = true;
    lastPoint.current = point;

    showEyes(true);
    holdIcon(getPaths(slotRef.current));
    ripple.current?.enter(point);
    eyes.current?.follow(e.clientX, e.clientY);
    startRise();
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button || !isHovered.current) return;

    lastPoint.current = getButtonPoint(button, e);
    eyes.current?.follow(e.clientX, e.clientY);
  };

  const onPointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;
    endHover(getButtonPoint(button, e));
  };

  return {
    buttonRef,
    rippleRef,
    slotRef,
    riseRef,
    linesRef,
    eyesRef,
    handlers: { onPointerEnter, onPointerMove, onPointerLeave },
  };
};
