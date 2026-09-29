import Link from "next/link";

const EYEBROW = "frontend developer";

const HeroTitle = () => {
  return (
    <Link
      href="https://www.w3schools.com/whatis/whatis_frontenddev.asp"
      target="_blank"
      data-cursor="help"
      className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#333] px-3.5 py-1.5 font-mono text-[13px] text-[#ddd] cursor-help hover:text-primary-white"
    >
      <span
        className="h-1.75 w-1.75 rounded-full bg-primary-hover"
        style={{ animation: "pulseDot 1.8s ease-in-out infinite" }}
      />
      <span
        className="text-primary-hover opacity-0"
        style={{ animation: "bracketPop 0.3s ease forwards" }}
      >
        &lt;
      </span>
      <span
        className="opacity-0"
        style={{
          letterSpacing: "0.5em",
          animation: "trackingCollapse 0.7s ease forwards 0.3s",
        }}
      >
        {EYEBROW}
      </span>
      <span
        className="text-primary-hover opacity-0"
        style={{ animation: "bracketPop 0.3s ease forwards 0.1s" }}
      >
        /&gt;
      </span>
    </Link>
  );
};

export default HeroTitle;
