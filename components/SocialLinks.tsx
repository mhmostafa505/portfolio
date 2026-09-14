import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { FaTelegram } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa6";

const SocialLinks = () => {
  return (
    <aside className="fixed top-25 left-13 bottom-10 flex flex-col items-center gap-6 z-50">
      <div
        className="h-full w-px bg-[#333] opacity-0 animate-[slide-in-left_0.6s_ease-out_forwards]"
        style={{ animationDelay: "200ms" }}
      ></div>
      <div className="flex flex-col justify-center gap-3">
        <Link
          href="https://github.com/mhmostafa505"
          className="hover:scale-135 hover:text-primary-purple transition-all duration-200 ease-in-out opacity-0 animate-[slide-in-left_0.5s_ease-out_forwards]"
          style={{ animationDelay: "400ms" }}
        >
          <FaGithub size={36} />
        </Link>
        <Link
          href="mailto:mhmostafa505@gmail.com"
          className="hover:scale-135 hover:text-primary-yellow transition-all duration-200 ease-in-out opacity-0 animate-[slide-in-left_0.5s_ease-out_forwards]"
          style={{ animationDelay: "550ms" }}
        >
          <MdOutlineAlternateEmail size={36} />
        </Link>
        <Link
          href="https://t.me/ZonseWhakamateBegraben"
          className="hover:scale-135 hover:text-primary-hover transition-all duration-200 ease-in-out opacity-0 animate-[slide-in-left_0.5s_ease-out_forwards]"
          style={{ animationDelay: "700ms" }}
        >
          <FaTelegram size={36} />
        </Link>
        <Link
          href="https://discord.com/users/whakamate52"
          className="hover:scale-135 hover:text-primary-purple transition-all duration-200 ease-in-out opacity-0 animate-[slide-in-left_0.5s_ease-out_forwards]"
          style={{ animationDelay: "850ms" }}
        >
          <FaDiscord size={36} />
        </Link>
      </div>
    </aside>
  );
};

export default SocialLinks;
