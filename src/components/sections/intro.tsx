"use client";

import React from "react";
import Image from "next/image";
import {motion} from "framer-motion";
import Link from "next/link";
import {BsArrowRight, BsGithub, BsLinkedin} from "react-icons/bs";
import {HiDownload} from "react-icons/hi";
import {useSectionInView} from "@/lib/hooks";
import {useActiveSectionContext} from "../../../context/active-section";
import {usePersonalInfoContextForGettingIntroData} from "../../../context/personal.information";
import {IntroData} from "@/lib/types";

export default function Intro() {
  const {ref} = useSectionInView("Home", 0.5);
  const {setActiveSection, setTimeOfLastClick} = useActiveSectionContext();

  const personalInfo: IntroData = usePersonalInfoContextForGettingIntroData()

  return (
    <section
      ref={ref}
      id="home"
      className="mb-28 max-w-[50rem] text-center sm:mb-0 scroll-mt-[100rem]"
    >
      <div className="flex items-center justify-center">
        <div className="relative">
          <motion.div
            initial={{opacity: 0, scale: 0}}
            animate={{opacity: 1, scale: 1}}
            transition={{
              type: "tween",
              duration: 0.2,
            }}
          >
            <Image
              src={personalInfo.profileImage}
              alt={personalInfo.fullName + " Image"}
              width="192"
              height="192"
              quality="95"
              priority={true}
              className="h-44 w-44 rounded-full object-cover border-[0.45rem] border-white shadow-xl"
            />
          </motion.div>
          <motion.span
            initial={{opacity: 0, scale: 0}}
            animate={{opacity: 1, scale: 1}}
            transition={{
              type: "spring",
              stiffness: 125,
              damping: 10,
              delay: 0.2,
              duration: 0.7,
            }}
            className="absolute bottom-0 right-0 text-6xl"
          >
            {personalInfo.emojiIconAsText}
          </motion.span>
        </div>
      </div>

      <motion.h1
        className="mb-10 mt-4 px-4 text-2xl font-medium !leading-[1.5] sm:text-4xl"
        initial={{opacity: 0, y: 100}}
        animate={{opacity: 1, y: 0}}
      >
        <span className="font-bold">Hello, I&apos;m {personalInfo.name}.</span> I&apos;m a{" "}
        <span className="font-bold">{personalInfo.profession}</span> with{" "}
        <span className="font-bold">{personalInfo.yearExperience} years</span> of experience.
        <br/>
        <br/>
        <span className="italic">{personalInfo.smallIntroPhrase}</span>
      </motion.h1>

      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-2 px-4 text-lg font-medium"
        initial={{opacity: 0, y: 100}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.3}}
      >
        <Link
          href="#contact"
          className="group bg-gray-900 text-white px-7 py-3 flex items-center gap-2 rounded-full outline-none
          focus:scale-110 hover:scale-110 hover:bg-gray-950 active:scale-105 transition"
          onClick={() => {
            setActiveSection("Contact");
            setTimeOfLastClick(Date.now);
          }}
        >
          Contact me{" "}
          <BsArrowRight className="opacity-70 group-hover:translate-x-2 transition"/>
        </Link>
        <a
          className="group bg-white  px-7 py-3 flex items-center gap-2 rounded-full outline-none
          focus:scale-110 hover:scale-110 active:scale-105 transition cursor-pointer borderBlack dark:bg-white/10 dark:text-white/60"
          href={personalInfo.linkToCv}
          target="_blank"
          download
        >
          Download CV{" "}
          <HiDownload className="opacity-60 group-hover:translate-y-1 transition"/>
        </a>

        <a
          className="bg-white p-4 text-gray-700 hover:text-gray-950 flex items-center gap-2 rounded-full
         focus:scale-[1.15] hover:scale-[1.15] active:scale-105 transition cursor-pointer borderBlack dark:bg-white/10 dark:text-white/60 focus:scale-110 hover:scale-[1.15] active:scale-[1.15] transition cursor-pointer borderBlack"
          href={personalInfo.linkLinkedin}
          target="_blank"
        >
          <BsLinkedin/>
        </a>

        <a
          className="bg-white p-4 text-gray-700 flex items-center gap-2 text-[1.35rem] rounded-full
         focus:scale-[1.15] hover:scale-[1.15] hover:text-gray-950
         active:scale-105 transition cursor-pointer borderBlack
         dark:bg-white/10 dark:text-white/60 focus:scale-[1.15]
         hover:scale-[1.15] active:scale-105 transition cursor-pointer borderBlack"
          href={personalInfo.linkGithub}
          target="_blank"
        >
          <BsGithub/>
        </a>
      </motion.div>
    </section>
  );
}
