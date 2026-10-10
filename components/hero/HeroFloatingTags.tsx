import { heroContents } from "@/content/heroContents";
import Link from "next/link";

interface TagRefType {
  tagRefs: React.RefObject<(HTMLAnchorElement | null)[]>;
}

const HeroFloatingTags = ({ tagRefs }: TagRefType) => {
  const { FLOAT_TAGS } = heroContents;

  return (
    <>
      {FLOAT_TAGS.map((tag, index) => (
        <Link
          key={tag.text}
          ref={(el) => {
            tagRefs.current[index] = el;
          }}
          href={tag.url}
          target="_blank"
          onAnimationEnd={(e) => {
            if (e.animationName === "burstOut") {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.animation = `floaty ${tag.duration} ease-in-out infinite`;
              e.currentTarget.style.animationDelay = tag.delay;
            }
          }}
          data-cursor="pointer"
          className={`group absolute z-2 whitespace-nowrap opacity-0 cursor-pointer`}
          style={{
            top: tag.top,
            left: tag.left,
            right: tag.right,
            bottom: tag.bottom,
          }}
        >
          <span
            className={`${
              index % 2 === 0
                ? "group-hover:rotate-15"
                : "group-hover:-rotate-15"
            } block rounded-full border px-4 py-1.5 backdrop-blur-[2px] transition-transform duration-150 group-hover:scale-105`}
            style={{
              color: tag.color,
              borderColor: tag.border,
              backgroundColor: "rgba(14,16,15,0.75)",
            }}
          >
            {tag.text}
          </span>
        </Link>
      ))}
    </>
  );
};

export default HeroFloatingTags;
