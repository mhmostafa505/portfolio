"use client";
import Navbar from "@/components/Navbar";
import SocialLinks from "@/components/SocialLinks";
import Hero from "@/components/hero/Hero";
import About from "@/components/about/About";
import Experiences from "@/components/experiences/Experiences";

const HomePage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <div className="max-w-[77%] mx-auto">
        <About />
        <Experiences />
      </div>
      <SocialLinks />
    </>
  );
};

export default HomePage;
