"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import { AiOutlineHome } from "react-icons/ai";
import { LuUserRound } from "react-icons/lu";
import { TbBook } from "react-icons/tb";
import { MdOutlineEventNote } from "react-icons/md";
import { LiaToolsSolid } from "react-icons/lia";
import { BiMessage } from "react-icons/bi";
import { navbarItemsContent } from "@/content/navbarContents";

const Navbar = () => {
  const { activeId } = useScrollSpy();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // Desktop
    <nav className="fixed top-0 left-1/2 -translate-x-1/2 w-fit mx-auto z-50">
      <div
        className={`${
          scrolled
            ? "bg-black/1 backdrop-blur-lg border-white/20 shadow-lg"
            : "bg-transparent border-transparent"
        } flex justify-center items-center gap-5 px-6 py-3 mt-10 text-lg rounded-full border transition-all duration-300 ease-in-out`}
      >
        {navbarItemsContent.map((item) => (
          <div
            key={item.activeIdName}
            className="flex flex-col justify-center opacity-0 animate-[slide-in-top_0.5s_ease-out_forwards]"
            style={{ animationDelay: item.animationDelay }}
          >
            <Link
              href={item.url}
              className={`${activeId === item.activeIdName ? "text-primary-hover" : ""} flex items-center gap-1.5 hover:text-primary-hover`}
            >
              {item.activeIdName === "home" ? (
                <AiOutlineHome size={18} />
              ) : item.activeIdName === "about" ? (
                <LuUserRound size={18} />
              ) : item.activeIdName === "experiences" ? (
                <TbBook size={20} />
              ) : item.activeIdName === "projects" ? (
                <MdOutlineEventNote size={17} />
              ) : item.activeIdName === "skills" ? (
                <LiaToolsSolid size={18} />
              ) : item.activeIdName === "contact" ? (
                <BiMessage size={17} />
              ) : (
                ""
              )}{" "}
              {item.name}
            </Link>
            <div
              className={`${activeId === item.activeIdName ? "scale-x-100" : "scale-x-0"} w-full h-0.5 rounded-full bg-primary-hover transition-all duration-500 ease-in-out`}
            ></div>
          </div>
        ))}
      </div>
    </nav>

    // Mobile To Do...
  );
};

export default Navbar;
