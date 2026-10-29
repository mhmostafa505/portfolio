"use client";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { navigateTo } from "@/utils/navigateToFunction";

interface ScrollSpyValue {
  activeId: string;
  ready: boolean;
  revealed: Set<string>;
  registerSection: (id: string, el: HTMLElement | null) => void;
  goTo: (id: string) => void;
}

const ScrollSpyContext = createContext<ScrollSpyValue>({
  activeId: "home",
  ready: false,
  revealed: new Set(),
  registerSection: () => {},
  goTo: () => {},
});

const HOME_ID = "home";

export const ScrollSpyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeId, setActiveId] = useState(HOME_ID);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(
    () => new Set([HOME_ID]),
  );
  const [intersecting] = useState<Map<string, DOMRectReadOnly>>(
    () => new Map(),
  );

  const navId = useRef(0);
  const initialized = useRef(false);

  const [observer] = useState<IntersectionObserver | null>(() => {
    if (typeof window === "undefined") return null;

    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            intersecting.set(entry.target.id, entry.boundingClientRect);
          } else {
            intersecting.delete(entry.target.id);
          }
        });

        if (intersecting.size === 0) return;

        const viewportCenter = window.innerHeight / 2;
        const candidates = Array.from(intersecting.entries());

        const [bestId] = candidates.reduce((closest, current) => {
          const [, closestRect] = closest;
          const [, currentRect] = current;
          const closestCenter = closestRect.top + closestRect.height / 2;
          const currentCenter = currentRect.top + currentRect.height / 2;
          return Math.abs(currentCenter - viewportCenter) <
            Math.abs(closestCenter - viewportCenter)
            ? current
            : closest;
        });

        setReady(true);
        setActiveId(bestId);
        history.replaceState(
          null,
          "",
          bestId === HOME_ID ? window.location.pathname : `#${bestId}`,
        );

        setRevealed((prev) => {
          if (prev.has(bestId)) return prev;
          const next = new Set(prev);
          next.add(bestId);
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

      // first section to mount: start from the URL hash, so a reload shows the right highlight immediately
      if (!initialized.current) {
        initialized.current = true;
        const fromHash = window.location.hash.slice(1);
        if (fromHash && document.getElementById(fromHash)) {
          setActiveId(fromHash);
        }
        setReady(true);
      }
    },
    [observer],
  );

  // nav links call this to explicitly declare "the user picked this section"
  const goTo = useCallback(
    (id: string) => {
      const target =
        id === HOME_ID ? document.body : document.getElementById(id);
      if (!target) return;

      observer?.disconnect();
      intersecting.clear();

      setActiveId(id);
      history.replaceState(
        null,
        "",
        id === HOME_ID ? window.location.pathname : `#${id}`,
      );
      setRevealed((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

      // home = top of the page. Pass 0, because document.body contains the whole page,
      // and then the projects section could never be detected as "in between".
      const mine = ++navId.current;
      navigateTo(id === HOME_ID ? 0 : target).then(() => {
        // resume observing only after the LAST click has finished
        if (mine !== navId.current) return;
        document
          .querySelectorAll("section[id]")
          .forEach((s) => observer?.observe(s));
      });
    },
    [observer, intersecting],
  );

  return (
    <ScrollSpyContext.Provider
      value={{ activeId, ready, revealed, registerSection, goTo }}
    >
      {children}
    </ScrollSpyContext.Provider>
  );
};

export const useScrollSpy = () => useContext(ScrollSpyContext);
