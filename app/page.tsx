"use client";
import Navbar from "@/components/Navbar";
import SocialLinks from "@/components/SocialLinks";
import dynamic from "next/dynamic";

const Hero = dynamic(() => import("@/components/Hero"), { ssr: false });

const HomePage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <SocialLinks />
    </>
  );
};

export default HomePage;
