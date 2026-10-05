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
      name: "E-Commerce",
      image: twitterDemoImg,
      type: "Full-stack web app",
      description:
        "A short story about what this project does, why you built it and what problem it solves.",
      stack: ["Next.js", "Tailwind", "Prisma"],
      github: "https://github.com/your-username/e-commerce",
      live: "https://e-commerce.vercel.app",
      color: "primary-hover",
    },
    {
      name: "Twitter-Demo",
      image: taskManagerImg,
      type: "Social media clone",
      description:
        "Describe the features, your role and the result. Real numbers make it more convincing.",
      stack: ["React", "Node.js", "MongoDB"],
      github: "https://github.com/your-username/twitter-demo",
      live: "https://twitter-demo.vercel.app",
      color: "primary-yellow",
    },
    {
      name: "TaskManager",
      image: ecommerceImg,
      type: "Productivity app",
      description:
        "Explain what the app does, who it is for, and what you learned while building it.",
      stack: ["TypeScript", "Next.js"],
      github: "https://github.com/your-username/task-manager",
      live: "",
      color: "primary-purple",
    },
  ],
};
