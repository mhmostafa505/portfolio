"use client";

interface ThreeFlipPillsProps {
  text: string;
  flipped: boolean;
  onClick: () => void;
  color: string;
}

const ThreeFlipPills = ({
  text,
  flipped,
  onClick,
  color,
}: ThreeFlipPillsProps) => {
  return (
    <div
      onClick={onClick}
      data-cursor="help"
      className="w-17 h-4.5 cursor-help perspective-[600px]"
    >
      <div
        className="relative w-full h-full transition-transform duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] transform-3d"
        style={{ transform: flipped ? "rotateX(180deg)" : "rotateX(0deg)" }}
      >
        {/* front: your original line */}
        <div
          className={`bg-${color} absolute inset-0 rounded-full backface-hidden`}
        />

        {/* back: just the text, no background */}
        <div
          className="absolute inset-0 flex items-center justify-center
                     text-sm font-semibold text-primary-white whitespace-nowrap
                     backface-hidden"
          style={{ transform: "rotateX(180deg)" }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

export default ThreeFlipPills;
