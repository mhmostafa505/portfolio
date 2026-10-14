import { MyProjectsContentsType } from "@/types/myProjectsTypes";
import twitterDemoImg from "@/assets/images/twitter-demo-img.webp";
import twitterDemoLoginImg from "@/assets/images/twitter-demo-login.webp";
import twitterDemoProfileImg from "@/assets/images/twitter-demo-profile.webp";
import twitterDemoEditProfileImg from "@/assets/images/twitter-demo-edit-profile.webp";
import twitterDemoCommentImg from "@/assets/images/twitter-demo-comment.webp";
import ecommerceImg from "@/assets/images/e-commerce-img.webp";
import ecommerceHomeImg from "@/assets/images/e-commerce-home.webp";
import ecommerceShopImg from "@/assets/images/e-commerce-shop.webp";
import ecommerceLoginImg from "@/assets/images/e-commerce-login.webp";
import ecommerceCheckoutImg from "@/assets/images/e-commerce-checkout.webp";
import ecommerceCreateProductImg from "@/assets/images/e-commerce-create-product.webp";
import ecommerceShoppingProgressImg from "@/assets/images/e-commerce-shopping-progress.webp";
import taskManagerImg from "@/assets/images/task-manager-img.webp";
import taskManagerLandingHeaderImg from "@/assets/images/task-manager-landing-header.webp";
import taskManagerLandingFeaturesImg from "@/assets/images/task-manager-landing-features.webp";
import taskManagerLandingCommentsImg from "@/assets/images/task-manager-landing-comments.webp";
import taskManagerAboutUsImg from "@/assets/images/task-manager-about-us.webp";
import taskManagerContactUsImg from "@/assets/images/task-manager-contact-us.webp";

export const myProjectsContents: MyProjectsContentsType = {
  themes: {
    "primary-hover": {
      text: "text-primary-hover",
      bg: "bg-primary-hover",
      border: "border-primary-hover/40",
      tint: "bg-primary-hover/8",
      line: "border-primary-hover/45",
      glow: "shadow-primary-hover/55",
      hover: "hover:border-primary-hover hover:text-primary-hover",
      tagHover:
        "group-hover:border-primary-hover group-hover:text-primary-hover group-hover:bg-primary-hover/10",
    },
    "primary-yellow": {
      text: "text-primary-yellow",
      bg: "bg-primary-yellow",
      border: "border-primary-yellow/40",
      tint: "bg-primary-yellow/8",
      line: "border-primary-yellow/45",
      glow: "shadow-primary-yellow/55",
      hover: "hover:border-primary-yellow hover:text-primary-yellow",
      tagHover:
        "group-hover:border-primary-yellow group-hover:text-primary-yellow group-hover:bg-primary-yellow/10",
    },
    "primary-purple": {
      text: "text-primary-purple",
      bg: "bg-primary-purple",
      border: "border-primary-purple/40",
      tint: "bg-primary-purple/8",
      line: "border-primary-purple/45",
      glow: "shadow-primary-purple/55",
      hover: "hover:border-primary-purple hover:text-primary-purple",
      tagHover:
        "group-hover:border-primary-purple group-hover:text-primary-purple group-hover:bg-primary-purple/10",
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
      gallery: [
        { src: twitterDemoImg, title: "Home" },
        { src: twitterDemoLoginImg, title: "Login" },
        { src: twitterDemoProfileImg, title: "User Profile" },
        { src: twitterDemoEditProfileImg, title: "Edit Profile" },
        { src: twitterDemoCommentImg, title: "Comment Page" },
      ],
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
      gallery: [
        { src: taskManagerImg, title: "Home" },
        { src: taskManagerLandingHeaderImg, title: "Landing Header" },
        { src: taskManagerLandingFeaturesImg, title: "Landing Features" },
        { src: taskManagerLandingCommentsImg, title: "Landing Comments" },
        { src: taskManagerAboutUsImg, title: "About Us" },
        { src: taskManagerContactUsImg, title: "Contact Us" },
      ],
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
      gallery: [
        { src: ecommerceImg, title: "Product Page" },
        { src: ecommerceHomeImg, title: "Home" },
        { src: ecommerceShopImg, title: "Shop" },
        { src: ecommerceLoginImg, title: "Login" },
        { src: ecommerceCheckoutImg, title: "Checkout" },
        { src: ecommerceCreateProductImg, title: "Create Product" },
        { src: ecommerceShoppingProgressImg, title: "Shopping Progress" },
      ],
    },
  ],
  SCROLL_LOCK: true,
  SCROLL_PER_PROJECT: 60, // vh of scrolling each project gets
  WHEEL_GAP: 64, // px between the names in the drum wheel
  BOX_MAX_HEIGHT: 620,
  BOX_GAP: 100, // px always kept free above and below the box while pinned
  GAP_ABOVE: 30, // px between the header and the box before it pins
  GAP_BELOW: 0, // px between the box and the next section after it unpins

  INTRO: true,
  INTRO_DURATION: 2400, // ms, must be longer than the last intro animation (about 2s)
  TYPE_DELAY: 700, // ms before the address bar starts typing
  TYPE_SPEED: 55, // ms per letter

  RETYPE: true, // set to false to turn the retype off
  RETYPE_SPEED: 38, // ms per letter when the project switches
  RETYPE_CURSOR: 500, // ms the cursor stays after the last letter

  MAGNET: true, // set to false to remove the magnet hover
  MAGNET_RADIUS: 110, // px: how close the mouse must be to pull a tag
  MAGNET_PULL: 4, // px: the strongest pull

  pad: (n: number) => String(n).padStart(2, "0"),
};
