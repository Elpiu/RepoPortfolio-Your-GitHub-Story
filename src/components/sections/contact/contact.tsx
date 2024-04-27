"use client";

import React from "react";
import SectionHeading from "@/components/section-heading";
import {useSectionInView} from "@/lib/hooks";
import {motion} from "framer-motion";
import SubmitBtn from "@/components/sections/contact/submit-btn";
import toast from "react-hot-toast";
import {IntroData} from "@/lib/types";
import {usePersonalInfoContextForGettingIntroData} from "../../../../context/personal.information";

export default function Contact() {
  const {ref} = useSectionInView("Contact");
  const personalInfo: IntroData = usePersonalInfoContextForGettingIntroData()



  const notifyInfo = () => toast(
    <div className="">
      <span className="text-lg">✉️</span>
      <a href={`mailto:${personalInfo.contactEmail}`}
         className="btn cursor-pointer"
      >{personalInfo.contactEmail}</a>
    </div>
  )

  return (
    <motion.section
      ref={ref}
      id="contact"
      className="mb-20 sm:mb-28 w-[min(100%,38rem)] text-center"
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      transition={{
        duration: 1,
      }}
      viewport={{
        once: true,
      }}
    >
      <SectionHeading>Contact me</SectionHeading>
      <div className="flex items-center justify-center">
        <button className="bg-gray-900 p-4 text-white rounded-full outline-none transition-all
        focus:scale-110 hover:scale-110 hover:bg-gray-950 active:scale-105
         dark:bg-white dark:bg-opacity-10 disabled:scale-100 disabled:bg-opacity-65"
                onClick={notifyInfo}>Click to show contact info.
        </button>
      </div>


    </motion.section>
  );
}

/*
function Form() {
  return
  <form
    className="mt-10 flex flex-col"
            action={async (formData) => {
              const {error} = await sendEmail(formData);

              if (error) {
                toast.error(error);
                return;

              toast.success("Email sent successfully!");
            }}
  >
    <input
      className="h-14 px-4 rounded-lg borderBlack dark:bg-white dark:text-black/80 dark:bg-opacity-80 dark:focus:bg-opacity-100 transition-all dark:outline-none"
      name="senderEmail"
      type={"email"}
      placeholder="Your email"
      required
      maxLength={500}
    />
    <textarea
      className="h-52 my-3 rounded-lg borderBlack p-4 dark:bg-white dark:text-black/80 dark:bg-opacity-80 dark:focus:bg-opacity-100 transition-all dark:outline-none"
      name="message"
      placeholder="Your message"
      required
      maxLength={5000}
    ></textarea>
    <SubmitBtn/>
  </form>
}
*/