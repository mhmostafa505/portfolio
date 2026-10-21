interface projectsGalleryContentsType {
  OPEN_MS: number;
  CLOSE_MS: number;
  OPEN_EASE: string;
  CLOSE_EASE: string;
  SLIDE_GAP: number;
  LENS: boolean;
  LENS_SIZE: number;
  LENS_ZOOM: number;
  pad: (n: number) => string;
}

export const projectsGalleryContents: projectsGalleryContentsType = {
  OPEN_MS: 600, // circle wipe in
  CLOSE_MS: 520, // circle wipe out
  OPEN_EASE: "cubic-bezier(.55,0,.2,1)",
  CLOSE_EASE: "cubic-bezier(.6,0,.4,1)",
  SLIDE_GAP: 28, // px between photos in the film strip
  LENS: true, // false removes the magnifier
  LENS_SIZE: 230, // px
  LENS_ZOOM: 1.5, // how much it magnifies
  pad: (n: number) => String(n).padStart(2, "0"),
};
