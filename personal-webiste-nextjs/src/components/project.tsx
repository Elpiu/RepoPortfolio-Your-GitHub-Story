"use client";

import React, {useRef} from "react";
import {motion, useScroll, useTransform} from "framer-motion";
import Image from "next/image";
import {Repository} from "@/lib/types";
import {repositoryRandomImagePlaceholder} from "@/lib/utils";
import exp from "node:constants";

type ProjectProps = Repository;

export default function Project({
                                  ...props
                                }: ProjectProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const {scrollYProgress} = useScroll({
    target: ref,
    offset: ["0 1", "1.33 1"],
  });
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

  return (
    <motion.div
      ref={ref}
      className="group mb-3 sm:mb-8 last:mb-0"
      style={{scale: scaleProgress, opacity: opacityProgress}}
    >
      <section
        className="bg-gray-100 max-w-[42rem] border border-black/5 rounded-lg overflow-hidden sm:pr-8 relative sm:h-[20rem] hover:bg-gray-200 transition sm:group-even:pl-8 dark:text-white dark:bg-white/10 dark:hover:bg-white/20">
        <div
          className="pt-4 pb-7 px-5 sm:pl-10 sm:pr-2 sm:pt-10 sm:max-w-[50%] flex flex-col h-full sm:group-even:ml-[18rem]">
          <h3 className="text-2xl font-semibold">{props.name}</h3>
          <Description description={props.description}></Description>
          <ul className="flex flex-wrap mt-4 gap-2 sm:mt-auto">
            <Topic topics={props.topics}></Topic>
          </ul>
        </div>

        <Image
          src={repositoryRandomImagePlaceholder()}
          width={800} // Larghezza effettiva dell'immagine
          height={600} // Altezza effettiva dell'immagine
          alt="Project I worked on"
          quality={30}
          className="absolute hidden sm:block top-8 -right-40 w-[28.25rem] rounded-t-lg shadow-2xl
        transition
        group-hover:scale-[1.04]
        group-hover:-translate-x-4
        group-hover:translate-y-4
        group-hover:-rotate-3

        group-even:group-hover:translate-x-4
        group-even:group-hover:translate-y-4
        group-even:group-hover:rotate-3

        group-even:right-[initial] group-even:-left-40"
        />
      </section>
    </motion.div>
  );
}


type DescriptionProps = {
  description: string
}
type TopicProps = {
  topics: string[]
}

export function Description(descriptionProps: DescriptionProps) {

  let words = descriptionProps.description.split(" ")

  if (words.length > 20) {
    let description = descriptionProps.description.split(" ").slice(0, 20)
    let concat = ""
    description.forEach(x => concat = concat.concat(x + " "))

    return (
      <>
        <p className="mt-2 leading-relaxed text-gray-700 dark:text-white/70">
          {concat}.......
        </p>
      </>
    )

  } else {
    return <p className="mt-2 leading-relaxed text-gray-700 dark:text-white/70">
      {descriptionProps.description}
    </p>
  }


}

export function Topic(topicsProps: TopicProps){

  return (
    <>
      {topicsProps.topics.slice(0, 5).map((tag, index) => (
        <li
          className="bg-black/[0.7] px-3 py-1 text-[0.6rem] uppercase
                 tracking-wider text-white rounded-full dark:text-white/70"
          key={index}
        >
          {tag}
        </li>
      ))}
      {topicsProps.topics.length > 5 && <li className="bg-black/[0.7] px-3 py-1 text-[0.6rem] uppercase
                 tracking-wider text-white rounded-full dark:text-white/70">...</li>}
    </>
  )
}