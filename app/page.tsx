"use client";
import Navbar from "@/components/Navbar";
import SocialLinks from "@/components/SocialLinks";
import Hero from "@/components/hero/Hero";
import About from "@/components/about/About";
import Experiences from "@/components/experiences/Experiences";
import MyProjects from "@/components/projects/MyProjects";
import Skills from "@/components/skills/Skills";

const HomePage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <div className="max-w-[77%] mx-auto">
        <About />
        <Experiences />
        <MyProjects />
        <Skills />
      </div>
      <SocialLinks />
    </>
  );
};

export default HomePage;
