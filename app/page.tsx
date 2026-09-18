"use client";
import Navbar from "@/components/Navbar";
import SocialLinks from "@/components/SocialLinks";
import Hero from "@/components/Hero";
import About from "@/components/About";

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
