"use client";

import React from "react";

import {motion} from "framer-motion";
import SectionHeading from "@/components/section-heading";
import {useSectionInView} from "@/lib/hooks";
import {usePersonalInfoContextForGettingAboutMeData} from "../../../context/personal.information";

export default function About() {
  const {ref} = useSectionInView("About");

  const aboutMe: string[] = usePersonalInfoContextForGettingAboutMeData()

  return (
    <motion.section
      ref={ref}
      className="mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28"
      initial={{opacity: 0, y: 100}}
      animate={{opacity: 1, y: 0}}
      transition={{delay: 0.175}}
      id="about"
    >
      <SectionHeading>About me</SectionHeading>
      <div className="mb-3">
        {aboutMe.map((text, index) => (
          <p
            className={index % 2 !== 0 ? "font-medium italic" : "font-medium"}
            key={index + text}
          >
            {text}
            <br/><br/>
          </p>
        ))}
      </div>
    </motion.section>
  );
}
