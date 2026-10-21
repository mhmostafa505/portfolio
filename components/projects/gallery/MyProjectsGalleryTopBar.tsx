import {
  GalleryImage,
  MyProjectsContentsType,
  ThemeColor,
} from "@/types/myProjectsTypes";
import { FiX } from "react-icons/fi";

interface MyProjectsGalleryTopBarType {
  pad: (n: number) => string;
  index: number;
  theme: MyProjectsContentsType["themes"][ThemeColor];
  images: GalleryImage[];
  projectName: string;
  closeBtnRef: React.RefObject<HTMLButtonElement | null>;
  close: () => void;
}

const MyProjectsGalleryTopBar = ({
  pad,
  index,
  theme,
  images,
  projectName,
  closeBtnRef,
  close,
}: MyProjectsGalleryTopBarType) => {
  return (
    <div
      data-gal-ui
      className="pointer-events-none absolute inset-x-0 top-0 grid h-16 grid-cols-[1fr_auto_1fr] items-center px-5 font-mono text-xs tracking-widest text-primary-white/55"
    >
      {/* Image Counter */}
      <span>
        <b className={`${theme.text} font-medium`}>{pad(index + 1)}</b> /{" "}
        {pad(images.length)}
      </span>

      {/* Project Title */}
      <span className="hidden text-primary-white sm:block">
        <span className={`${theme.text} text-[12px] pr-2 transition-colors`}>
          ●
        </span>
        {projectName}
      </span>

      {/* Close Gallery Button */}
      <button
        ref={closeBtnRef}
        type="button"
        onClick={close}
        data-cursor="pointer"
        aria-label="Close gallery (Esc)"
        className={`${theme.hover} group pointer-events-auto grid size-10 place-items-center justify-self-end rounded-[10px] border border-primary-white/20 bg-transparent text-primary-white transition-colors`}
      >
        <FiX
          size={20}
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:rotate-90"
        />
      </button>
    </div>
  );
};

export default MyProjectsGalleryTopBar;
