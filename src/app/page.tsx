import Intro from "@/components/sections/intro";
import SectionDivider from "@/components/section-divider";
import About from "@/components/sections/about";
import Projects from "@/components/sections/project/projects";
import Skills from "@/components/sections/skills";
import ExperienceC from "@/components/sections/experienceC";
import React from "react";
import type {Metadata} from "next";
import {getSEOTagsLayout} from "@/lib/SEO";
import Contact from "@/components/sections/contact/contact";


export const metadata: Metadata = getSEOTagsLayout()


export default function Home() {
  return (
    <main className="flex flex-col items-center px-4">
      <Intro/>
      <SectionDivider/>
      <About/>
      <Projects/>
      <Skills/>
      <ExperienceC/>
      <Contact/>
    </main>
  );
}
