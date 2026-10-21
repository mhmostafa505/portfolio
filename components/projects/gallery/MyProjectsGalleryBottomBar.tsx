import Image from "next/image";
import {
  GalleryImage,
  MyProjectsContentsType,
  ThemeColor,
} from "@/types/myProjectsTypes";
import { Dispatch, SetStateAction } from "react";

interface MyProjectsGalleryBottomBarType {
  images: GalleryImage[];
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  theme: MyProjectsContentsType["themes"][ThemeColor];
}

const MyProjectsGalleryBottomBar = ({
  images,
  index,
  setIndex,
  theme,
}: MyProjectsGalleryBottomBarType) => {
  return (
    <div
      data-gal-ui
      className="pointer-events-none absolute inset-x-0 bottom-0 flex h-28 flex-col items-center justify-center gap-3"
    >
      <p aria-live="polite" className="text-sm">
        {images[index].title}
      </p>
      {images.length > 1 && (
        <div className="pointer-events-auto flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.title}
              type="button"
              onClick={() => setIndex(i)}
              data-cursor="pointer"
              aria-label={`Photo ${i + 1}: ${img.title}`}
              className={`${
                i === index
                  ? `${theme.text} -translate-y-0.5 border-current opacity-100`
                  : "border-primary-white/10 opacity-50 hover:opacity-85"
              } relative aspect-16/10 w-14 overflow-hidden rounded-md border transition-[opacity,translate,border-color] duration-300 sm:w-17`}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="68px"
                loading="eager"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjectsGalleryBottomBar;
