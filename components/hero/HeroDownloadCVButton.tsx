import Link from "next/link";

const HeroDownloadCVButton = () => {
  return (
    <Link
      href="#"
      download
      data-cursor="pointer"
      className="group relative inline-flex animate-[riseBounce_0.6s_cubic-bezier(.22,1,.36,1)_forwards] items-center gap-2 rounded-lg border border-primary-white px-6 py-3 text-sm text-primary-white opacity-0 transition-colors hover:border-primary-hover"
      style={{ animationDelay: "500ms" }}
    >
      Download CV
      <span className="relative h-4 w-4">
        <svg
          className="absolute inset-0 transition-all duration-300 ease-out group-hover:translate-y-2.5 group-hover:opacity-0"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M8 2v9M4 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          className="absolute inset-0 -translate-y-1.5 opacity-0 transition-all delay-100 duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3M5 7l3 3 3-3M8 1v8"
            stroke="#17F1D1"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
};

export default HeroDownloadCVButton;
