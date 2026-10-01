import { experienceContentsType } from "@/types/experienceTypes";

export const experienceContents: experienceContentsType = {
  experienceItems: [
    {
      date: "2024",
      title: "Started Learning HTML & CSS",
      role: "Udemy — Brad Traversy",
      description:
        'Began my web development journey with Brad Traversy\'s "Modern HTML & CSS From The Beginning" on Udemy. This course shaped how I structure and write code to this day, and gave me a solid foundation in semantic HTML and CSS fundamentals.',
    },
    {
      date: "2025",
      title: "Learned JavaScript Fundamentals",
      role: "freeCodeCamp & Codecademy",
      description:
        "Moved on to JavaScript, learning the fundamentals through freeCodeCamp and Codecademy. Didn't get to go too deep before joining a bootcamp, but the core concepts I picked up here made a real difference once the bootcamp's JavaScript modules started.",
    },
    {
      date: "2025",
      title: "Front-End Bootcamp",
      role: "Quera Bootcamp",
      description:
        "A 3–4 month intensive front-end bootcamp covering HTML/CSS, JavaScript fundamentals, professional JavaScript, TypeScript, and Tailwind CSS. Built two team projects — a landing page (HTML/Tailwind) and a task manager app with full CRUD (HTML/Tailwind/JS) — as squad leader for both. Then learned React in depth and led a team building a full e-commerce site with React and TypeScript. Graduated with a perfect score as the top student in the bootcamp.",
    },
    {
      date: "2026",
      title: "Twitter-Style Social App",
      role: "Team Project — Front-End",
      description:
        "Built a Twitter-like social platform (posts, reposts, follow/unfollow, comments, and more) as one of three front-end developers, working alongside two back-end developers using Python/Django. Used React, TypeScript, Tailwind CSS, and several supporting libraries, with the UI designed from scratch in Adobe XD.",
    },
    {
      date: "2026",
      title: "Learned Next.js",
      role: "Udemy — Brad Traversy",
      description:
        "Took Brad Traversy's project-based \"Next.js From Scratch\" course, building a full application while picking up Next.js fundamentals along with some MongoDB. A course packed with new concepts I'm looking forward to applying in a real project.",
    },
    {
      date: "2026",
      title: "Learned SEO Fundamentals",
      role: "Quera",
      description:
        "Completed a course on SEO fundamentals through Quera, picking up practical techniques for improving visibility and discoverability — knowledge I'm looking forward to applying in upcoming projects.",
    },
    {
      date: "Up Next",
      title: "Animations & Backend",
      role: "Currently Exploring",
      description:
        "Looking to dive into web animation — likely GSAP, possibly Three.js — and considering starting Node.js to grow into a full-stack role.",
    },
  ],
  CUE_TO_TRAVELER_THRESHOLD: 0.02,
  TRIGGER: 0.4,
  DOT_LERP_FACTOR: 0.06,
};
