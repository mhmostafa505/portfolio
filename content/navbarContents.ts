interface navbarItemsContentType {
  url: string;
  activeIdName: string;
  name: string;
  animationDelay: string;
}

export const navbarItemsContent: navbarItemsContentType[] = [
  {
    url: "#",
    activeIdName: "home",
    name: "Home",
    animationDelay: "200ms",
  },
  {
    url: "#about",
    activeIdName: "about",
    name: "About Me",
    animationDelay: "300ms",
  },
  {
    url: "#experiences",
    activeIdName: "experiences",
    name: "Experiences",
    animationDelay: "400ms",
  },
  {
    url: "#projects",
    activeIdName: "projects",
    name: "My Projects",
    animationDelay: "500ms",
  },
  {
    url: "#skills",
    activeIdName: "skills",
    name: "Skills",
    animationDelay: "600ms",
  },
  {
    url: "#contact",
    activeIdName: "contact",
    name: "Contact Me",
    animationDelay: "700ms",
  },
];
