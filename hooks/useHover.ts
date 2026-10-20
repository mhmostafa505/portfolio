"use client";
import { useEffect } from "react";

const ATTR = "data-hover";

export const useHover = () => {
  useEffect(() => {
    // same rule Tailwind uses: only devices that can really hover
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;

    let stop: (() => void) | undefined;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const begin = () => {
      timer = setTimeout(() => {
        if (!cancelled) stop = setup();
      }, 500); // gives React time to finish hydrating first
    };

    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("load", begin);
      stop?.();
    };
  }, []);
};

const setup = () => {
  let x = -1,
    y = -1;
  let hovered: Element | null = null; // what mouse event handlers think is hovered
  let marks = new Set<Element>(); // elements currently carrying data-hover
  let markedEl: Element | null = null;
  let raf = 0;

  // ---- JS handlers: send the enter/leave events the browser forgot ----
  const fire = (
    type: string,
    el: Element,
    related: Element | null,
    bubbles: boolean,
  ) =>
    el.dispatchEvent(
      new MouseEvent(type, {
        bubbles,
        cancelable: true,
        composed: true,
        view: window,
        clientX: x,
        clientY: y,
        relatedTarget: related,
      }),
    );

  const transition = (prev: Element | null, next: Element | null) => {
    if (prev) {
      fire("mouseout", prev, next, true);
      for (
        let el: Element | null = prev;
        el && !(next && el.contains(next));
        el = el.parentElement
      ) {
        fire("mouseleave", el, next, false);
      }
    }
    if (next) {
      fire("mouseover", next, prev, true);
      const entered: Element[] = [];
      for (
        let el: Element | null = next;
        el && !(prev && el.contains(prev));
        el = el.parentElement
      ) {
        entered.push(el);
      }
      entered.reverse().forEach((el) => fire("mouseenter", el, prev, false));
    }
  };

  // ---- CSS hover: put data-hover on the element and all its ancestors ----
  const mark = (el: Element | null) => {
    if (el === markedEl) return;
    const next = new Set<Element>();
    for (let n = el; n; n = n.parentElement) next.add(n);
    // a Set (instead of walking up from the old element) also cleans up
    // ancestors when the hovered element was removed from the page
    marks.forEach((n) => {
      if (!next.has(n)) n.removeAttribute(ATTR);
    });
    next.forEach((n) => {
      if (!marks.has(n)) n.setAttribute(ATTR, "");
    });
    marks = next;
    markedEl = el;
  };

  const sync = () => {
    raf = 0;
    if (document.hidden) return;
    const next = x < 0 ? null : document.elementFromPoint(x, y);
    if (next !== hovered) {
      transition(hovered, next);
      hovered = next;
    }
    mark(next);
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(sync);
  };

  const onMove = (e: MouseEvent) => {
    x = e.clientX;
    y = e.clientY;
    schedule();
  };
  // real events: the browser already ran the handlers, so just stay in sync
  const onOver = (e: MouseEvent) => {
    hovered = e.target as Element;
  };
  const onLeaveWindow = () => {
    x = -1;
    y = -1;
    hovered = null;
    mark(null);
  };

  window.addEventListener("mousemove", onMove, { passive: true });
  document.addEventListener("mouseover", onOver, true);
  document.documentElement.addEventListener("mouseleave", onLeaveWindow);
  window.addEventListener("scroll", schedule, {
    passive: true,
    capture: true,
  }); // any scroll container
  window.addEventListener("wheel", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  document.addEventListener("visibilitychange", schedule);
  // catches everything with no event: transforms, smooth-scroll libraries,
  // animations, layout shifts, elements appearing or disappearing under the mouse
  const interval = setInterval(schedule, 100);

  return () => {
    window.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseover", onOver, true);
    document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
    window.removeEventListener("scroll", schedule, true);
    window.removeEventListener("wheel", schedule);
    window.removeEventListener("resize", schedule);
    document.removeEventListener("visibilitychange", schedule);
    clearInterval(interval);
    cancelAnimationFrame(raf);
    mark(null);
  };
};
