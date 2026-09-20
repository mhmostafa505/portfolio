"use client";
import { createContext, useCallback, useContext, useState } from "react";

interface ScrollSpyValue {
  activeId: string;
  revealed: Set<string>;
  registerSection: (id: string, el: HTMLElement | null) => void;
}

const ScrollSpyContext = createContext<ScrollSpyValue>({
  activeId: "home",
  revealed: new Set(),
  registerSection: () => {},
});

const HOME_ID = "home";

export const ScrollSpyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeId, setActiveId] = useState(HOME_ID);
  const [revealed, setRevealed] = useState<Set<string>>(
    () => new Set([HOME_ID]),
  );

  const [observer] = useState<IntersectionObserver | null>(() => {
    if (typeof window === "undefined") return null; // SSR guard

    return new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;

        const viewportCenter = window.innerHeight / 2;
        const best = intersecting.reduce((closest, entry) => {
          const entryCenter =
            entry.boundingClientRect.top + entry.boundingClientRect.height / 2;
          const closestCenter =
            closest.boundingClientRect.top +
            closest.boundingClientRect.height / 2;

          return Math.abs(entryCenter - viewportCenter) <
            Math.abs(closestCenter - viewportCenter)
            ? entry
            : closest;
        });

        const id = best.target.id;
        setActiveId(id);
        history.replaceState(
          null,
          "",
          id === HOME_ID ? window.location.pathname : `#${id}`,
        );

        setRevealed((prev) => {
          if (prev.has(id)) return prev;
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
  });

  // sections call this themselves, whenever they actually mount
  const registerSection = useCallback(
    (id: string, el: HTMLElement | null) => {
      if (!el || !observer) return;
      observer.observe(el);
    },
    [observer],
  );
  return (
    <ScrollSpyContext.Provider value={{ activeId, revealed, registerSection }}>
      {children}
    </ScrollSpyContext.Provider>
  );
};

export const useScrollSpy = () => useContext(ScrollSpyContext);
