"use client";

import SectionHeading from "@/components/section-heading";
import {useSectionInView} from "@/lib/hooks";
import {motion} from "framer-motion";
import {usePersonalInfoContextForGettingSkillsData} from "../../../context/personal.information";

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 100,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
    },
  }),
};

export default function Skills() {
  const {ref} = useSectionInView("Skills");

  const skillsData: string[] = usePersonalInfoContextForGettingSkillsData()


  return (
    <section
      ref={ref}
      className="mb-28 max-w-[53rem] scroll-mt-28 text-center sm:mb-40"
      id="skills"
    >
      <SectionHeading>My Skills</SectionHeading>
      {skillsData && skillsData.length > 0 ? (
        <ul className="flex flex-wrap justify-center gap-2 text-lg text-gray-800">
          {skillsData.map((skill, index) => (
            <motion.li
              className="bg-white borderBlack rounded-xl px-5 py-3 dark:bg-white/10 dark:text-white/80"
              key={index + skill}
              variants={fadeInAnimationVariants}
              initial="initial"
              whileInView="animate"
              viewport={{
                once: true,
              }}
              custom={index}
            >
              {skill}
            </motion.li>
          ))}
        </ul>
      ) : (
        <p>No skills data available</p>
      )}

    </section>
  );
}
