import { Skill } from "@/types/skillsTypes";

interface Props {
  open: boolean;
  skill: Skill | null;
}

const base =
  "pointer-events-none absolute inset-x-0 z-10 overflow-hidden bg-black transition-[height] duration-500 ease-out";

const LetterBoxBars = ({ open, skill }: Props) => {
  const height = open ? "h-10" : "h-0";

  return (
    <>
      <div className={`${base} top-0 ${height}`} />
      <div
        className={`${base} bottom-0 flex items-center justify-center text-sm ${height}`}
      >
        {skill && (
          <span className="font-medium" style={{ color: skill.color }}>
            {skill.name}
          </span>
        )}
      </div>
    </>
  );
};

export default LetterBoxBars;
