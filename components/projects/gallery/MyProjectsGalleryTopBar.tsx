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
        aria-label="Close gallery"
        className={`${theme.hover} pointer-events-auto inline-flex items-center gap-2.5 justify-self-end rounded-full border border-primary-white/10 bg-primary-white/5 py-1.5 pr-2 pl-3.5 text-primary-white transition-colors`}
      >
        <FiX aria-hidden="true" />
        <kbd className="rounded-full bg-primary-white/10 px-2 py-0.5 text-[10px] text-primary-white/55">
          esc
        </kbd>
      </button>
    </div>
  );
};

export default MyProjectsGalleryTopBar;
