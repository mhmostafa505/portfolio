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
      <div className="max-w-[77%] mx-auto">
        <About />
      </div>
      <SocialLinks />
    </>
  );
};

export default HomePage;
