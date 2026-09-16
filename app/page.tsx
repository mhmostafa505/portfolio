"use client";
import Navbar from "@/components/Navbar";
import SocialLinks from "@/components/SocialLinks";
import About from "@/components/About";
import dynamic from "next/dynamic";

const Hero = dynamic(() => import("@/components/Hero"), { ssr: false });

const HomePage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <SocialLinks />
    </>
  );
};

export default HomePage;
