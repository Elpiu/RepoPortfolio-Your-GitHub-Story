"use client";

import {useSectionInView} from "@/lib/hooks";
import SectionHeading from "@/components/section-heading";
import {VerticalTimeline, VerticalTimelineElement,} from "react-vertical-timeline-component";
import React from "react";
import "react-vertical-timeline-component/style.min.css";
import {useTheme} from "../../../context/theme-context";
import {usePersonalInfoContextForGettingExperienceData} from "../../../context/personal.information";
import {createIconFromText} from "@/lib/utils";
import {Experience} from "@/lib/types";


export default function ExperienceC() {
  const {ref, inView} = useSectionInView("Experience", 0.5);
  const {theme} = useTheme();

  const [isVisible, setIsVisible] = React.useState(false);

  const myExperience: Experience[] = usePersonalInfoContextForGettingExperienceData()

  React.useEffect(() => {
    if (inView) {
      setIsVisible(true);
    }
  }, [inView]);

  return (
    <section id="experience" ref={ref} className="scroll-mt-28 mb-28 sm:mb-40">
      <SectionHeading>My experience</SectionHeading>
      <VerticalTimeline lineColor="">
        {myExperience.map((item, index) => (
          <React.Fragment key={index + item.title}>
            <VerticalTimelineElement
              visible={isVisible}
              contentStyle={{
                background:
                  theme === "light" ? "#f3f4f6" : "rgba(255, 255, 255, 0.05)",
                boxShadow: "none",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                textAlign: "left",
                padding: "1.3rem 2rem",
              }}
              contentArrowStyle={{
                borderRight:
                  theme === "light"
                    ? "0.4rem solid #9ca3af"
                    : "0.4rem solid rgba(255, 255, 255, 0.5)",
              }}
              date={item.date}
              icon={createIconFromText(item.icon)}
              iconStyle={{
                background:
                  theme === "light" ? "white" : "rgba(255, 255, 255, 0.15)",
                fontSize: "1.5rem",
              }}
            >
              <h3 className="font-semibold capitalize">{item.title}</h3>
              <p className="font-normal !mt-0">{item.location}</p>
              <p className="!mt-1 !font-normal text-gray-700 dark:text-white/75">
                {item.description}
              </p>
            </VerticalTimelineElement>
          </React.Fragment>
        ))}
      </VerticalTimeline>
    </section>
  );
}
