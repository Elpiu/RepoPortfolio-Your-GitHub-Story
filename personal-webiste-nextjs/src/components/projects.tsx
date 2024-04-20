"use client";

import SectionHeading from "@/components/section-heading";
import React, {useEffect, useState} from "react";
import Project from "@/components/project";
import {useSectionInView} from "@/lib/hooks";
import axios from "axios";
import {GitHubRepoData, Repository} from "@/lib/types";
import {usePersonalInfoContextForGettingGitHubRepoData} from "../../context/personal.information";
import ProjectModal from "@/components/project-modal";
import EventEmitter from "events";

export default function Projects() {
  const {ref} = useSectionInView("Projects", 0.5);
  const gitHubRepoData: GitHubRepoData = usePersonalInfoContextForGettingGitHubRepoData()

  const [gitHubRepositories, setGitHubData] = useState<Repository[]>([])
  const [isLoading, setLoading] = useState(true)

  const [visibleProjects, setVisibleProjects] = useState(6);

  //Modal Project
  const ID_MODAL = "PROJECTMODAL"
  const modalEmitter = new EventEmitter();


  useEffect(() => {
    axios.get(`${gitHubRepoData.urlApiGithub}/${gitHubRepoData.nameGithub}/${gitHubRepoData.fragmentRepository}`, {
      responseType: "json"
    })
      .then((response) => {
        let data = response.data as Repository[]
        data = data.filter(repo => !gitHubRepoData.excludedRepo.includes(repo.name))
        //TODO sorting by star can exclude other project more valuable
        if (gitHubRepoData.orderByStars) {
          data.sort((repoA, repoB) =>
            // @ts-ignore
            repoB.stargazers_count - repoA.stargazers_count);
        }
        setGitHubData(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching repositories from GitHub:", error);
      });
  }, [])

  // Return a loading state until data is fetched
  if (isLoading) {
    //TODO LOADING
    return <div>
      <span className="loading loading-ring loading-lg"></span>
    </div>;
  }

  const handleLoadMore = () => {
    setVisibleProjects(prev => prev + 12);
  };

  return (
    <section ref={ref} className="scroll-mt-28 mb-28" id="projects">
      <SectionHeading>My Projects</SectionHeading>
      <ProjectModal idModal={ID_MODAL} modalEmitter={modalEmitter}/>
      <div>
        {gitHubRepositories.slice(0, visibleProjects).map((project, index) => (
          <React.Fragment key={index}>
            <Project {...project} setAsFocus={(repo: Repository) => modalEmitter.emit("openModal", repo)}/>
          </React.Fragment>
        ))}

        <div className="flex items-center justify-center ">
          {visibleProjects < gitHubRepositories.length && (
            <button
              className="group bg-gray-950 text-white px-7 py-3 flex items-center gap-2 rounded-full outline-none
          focus:scale-110 hover:scale-110 dark:bg-white/10 active:scale-105 transition"
              onClick={handleLoadMore}>
              Load more...
            </button>
          )}
        </div>
      </div>
    </section>
  );

}
