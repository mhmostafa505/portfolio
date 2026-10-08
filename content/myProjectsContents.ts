import { myProjectsContentsType } from "@/types/myProjectsTypes";
import ecommerceImg from "@/assets/images/e-commerce-img.webp";
import twitterDemoImg from "@/assets/images/twitter-demo-img.webp";
import taskManagerImg from "@/assets/images/task-manager-img.webp";

export const myProjectsContents: myProjectsContentsType = {
  themes: {
    "primary-hover": {
      text: "text-primary-hover",
      bg: "bg-primary-hover",
      border: "border-primary-hover/40",
      tint: "bg-primary-hover/8",
      line: "border-primary-hover/45",
      glow: "shadow-primary-hover/55",
      hover: "hover:border-primary-hover hover:text-primary-hover",
    },
    "primary-yellow": {
      text: "text-primary-yellow",
      bg: "bg-primary-yellow",
      border: "border-primary-yellow/40",
      tint: "bg-primary-yellow/8",
      line: "border-primary-yellow/45",
      glow: "shadow-primary-yellow/55",
      hover: "hover:border-primary-yellow hover:text-primary-yellow",
    },
    "primary-purple": {
      text: "text-primary-purple",
      bg: "bg-primary-purple",
      border: "border-primary-purple/40",
      tint: "bg-primary-purple/8",
      line: "border-primary-purple/45",
      glow: "shadow-primary-purple/55",
      hover: "hover:border-primary-purple hover:text-primary-purple",
    },
  },
  projects: [
    {
      name: "Twitter Demo",
      image: twitterDemoImg,
      type: "Full-stack social app",
      description:
        "The frontend of a group-built, full-stack Twitter clone. We built the React and TypeScript interface with tweets, comments, follow / unfollow, and user profile, connected to the team's backend API and run with Docker.",
      stack: ["React", "TypeScript", "Tailwind CSS", "Docker"],
      github: "https://github.com/Soroush-Eghdami/Tweeter_Demo",
      live: "https://vercel-two-tau-13.vercel.app/",
      color: "primary-hover",
    },
    {
      name: "Task Manager",
      image: taskManagerImg,
      type: "Landing page + to-do app",
      description:
        "A to-do app with a responsive Persian (RTL) landing page: hero, feature cards, download section, user reviews and a newsletter footer. It supports light, dark and system themes, and is built without a framework.",
      stack: ["HTML", "CSS", "Tailwind CSS", "JavaScript"],
      github: "https://github.com/mhmostafa505/Quera-Bootcamp-Project-01",
      live: "",
      color: "primary-yellow",
    },
    {
      name: "E-Commerce",
      image: ecommerceImg,
      type: "E-commerce web app",
      description:
        "An e-commerce web app built with React, TypeScript and Tailwind CSS. Server data comes through TanStack Query and Axios, forms use React Hook Form, and the app state lives in Zustand, with routing handled by React Router.",
      stack: [
        "React",
        "TypeScript",
        "Tailwind CSS",
        "TanStack Query",
        "Zustand",
        "Vite",
      ],
      github: "https://github.com/mhmostafa505/Quera-Bootcamp-Project-02",
      live: "",
      color: "primary-purple",
    },
  ],
};
