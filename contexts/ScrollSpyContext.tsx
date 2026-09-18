"use client";
import { createContext, useContext, useEffect, useState } from "react";

type ScrollSpyValue = {
  activeId: string;
  revealed: Set<string>;
};

const ScrollSpyContext = createContext<ScrollSpyValue>({
  activeId: "home",
  revealed: new Set(),
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

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;

          setActiveId(id);

          // clean URL at the top, real hash everywhere else
          if (id === HOME_ID) {
            history.replaceState(null, "", window.location.pathname);
          } else {
            history.replaceState(null, "", `#${id}`);
          }

          setRevealed((prev) => {
            if (prev.has(id)) return prev; // no change, no re-render
            const next = new Set(prev);
            next.add(id);
            return next;
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <ScrollSpyContext.Provider value={{ activeId, revealed }}>
      {children}
    </ScrollSpyContext.Provider>
  );
};

export const useScrollSpy = () => useContext(ScrollSpyContext);
