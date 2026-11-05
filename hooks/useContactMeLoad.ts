"use client";
import { useCallback, useRef } from "react";
import { playContactLoad } from "@/utils/contactMeFunctions/contactLoadPlay";
import { CONTACT_LOAD } from "@/content/contactMeContents";

// Marks an item that already started loading (the CSS in globals.css stops hiding it)
const STARTED = "data-load-started";

// Loads every [data-load] item of the contact section when it scrolls into view
const useContactMeLoad = () => {
  const stopRef = useRef<(() => void) | null>(null);

  // Callback ref: put it on the section element (merge it with the scroll-spy ref)
  const loadRef = useCallback((section: HTMLElement | null) => {
    stopRef.current?.();
    stopRef.current = null;
    if (!section) return;

    const items = Array.from(
      section.querySelectorAll<HTMLElement>("[data-load]"),
    );

    // Reduced motion: no animation, just show everything
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((el) => el.setAttribute(STARTED, ""));
      return;
    }

    let queue: HTMLElement[] = [];
    let timer: number | null = null;
    const stops: (() => void)[] = [];

    // Items that entered the screen together are loaded together, top to bottom
    const flush = () => {
      timer = null;
      const batch = queue;
      queue = [];
      batch.sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
      );
      // The animations keep the items hidden, so this does not flash
      batch.forEach((el) => el.setAttribute(STARTED, ""));
      stops.push(playContactLoad(section, batch));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (
            !entry.isIntersecting ||
            el.hasAttribute(STARTED) ||
            queue.includes(el)
          )
            return;
          queue.push(el);
          observer.unobserve(el);
        });
        if (queue.length > 0 && timer === null) {
          timer = window.setTimeout(flush, CONTACT_LOAD.batchWaitMs);
        }
      },
      {
        threshold: CONTACT_LOAD.startThreshold,
        rootMargin: CONTACT_LOAD.startMargin,
      },
    );

    items.forEach((el) => {
      if (!el.hasAttribute(STARTED)) observer.observe(el);
    });

    stopRef.current = () => {
      observer.disconnect();
      if (timer !== null) window.clearTimeout(timer);
      stops.forEach((stop) => stop());
    };
  }, []);

  return { loadRef };
};

export default useContactMeLoad;
