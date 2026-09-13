"use client";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
// import Hero from "@/components/Hero";

const Hero = dynamic(() => import("@/components/Hero"), { ssr: false });

const HomePage = () => {
  return (
    <>
      <Navbar />
      <Hero />
    </>
  );
};

export default HomePage;
