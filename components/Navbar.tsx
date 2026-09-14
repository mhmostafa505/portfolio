"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AiOutlineHome } from "react-icons/ai";
import { LuUserRound } from "react-icons/lu";
import { TbBook } from "react-icons/tb";
import { MdOutlineEventNote } from "react-icons/md";
import { LiaToolsSolid } from "react-icons/lia";

const Navbar = () => {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            history.replaceState(null, "", `#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    // Desktop
    <nav className="fixed top-0 left-1/2 -translate-x-1/2 w-fit mx-auto z-50">
      <div className="flex justify-center items-center gap-5 mt-10 text-lg">
        <Link
          href="#"
          className={`${activeId === "" || activeId === "home" ? "text-primary-hover" : ""} flex items-center gap-1.5 hover:text-primary-hover opacity-0 animate-[slide-in-top_0.5s_ease-out_forwards]`}
          style={{ animationDelay: "200ms" }}
        >
          <AiOutlineHome size={18} /> Home
        </Link>
        <Link
          href="#about"
          className={`${activeId === "about" ? "text-primary-hover" : ""} flex items-center gap-1.5 hover:text-primary-hover opacity-0 animate-[slide-in-top_0.5s_ease-out_forwards]`}
          style={{ animationDelay: "300ms" }}
        >
          <LuUserRound size={18} /> About Me
        </Link>
        <Link
          href="#experiences"
          className={`${activeId === "experiences" ? "text-primary-hover" : ""} flex items-center gap-1.5 hover:text-primary-hover opacity-0 animate-[slide-in-top_0.5s_ease-out_forwards]`}
          style={{ animationDelay: "400ms" }}
        >
          <TbBook size={20} /> Experiences
        </Link>
        <Link
          href="#projects"
          className={`${activeId === "projects" ? "text-primary-hover" : ""} flex items-center gap-1.5 hover:text-primary-hover opacity-0 animate-[slide-in-top_0.5s_ease-out_forwards]`}
          style={{ animationDelay: "500ms" }}
        >
          <MdOutlineEventNote size={17} /> My Projects
        </Link>
        <Link
          href="#skills"
          className={`${activeId === "skills" ? "text-primary-hover" : ""} flex items-center gap-1.5 hover:text-primary-hover opacity-0 animate-[slide-in-top_0.5s_ease-out_forwards]`}
          style={{ animationDelay: "600ms" }}
        >
          <LiaToolsSolid size={18} /> Skills
        </Link>
      </div>
    </nav>

    // Mobile To Do...
  );
};

export default Navbar;
