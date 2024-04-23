import React, {useEffect, useState} from "react";
import EventEmitter from "events";
import {GitHubRepoData, Repository} from "@/lib/types";
import Markdown from "react-markdown";
import axios from "axios";
import {usePersonalInfoContextForGettingGitHubRepoData} from "../../../../context/personal.information";
import remarkGfm from 'remark-gfm'
import {AnimationControls, motion, useAnimation} from "framer-motion";
import {LoadingInContent} from "@/components/loadingFullScreen";


type ProjectModalProps = {
  idModal: string
  modalEmitter: EventEmitter
}

export default function ProjectModal({idModal, modalEmitter}: Readonly<ProjectModalProps>) {

  const githubData: GitHubRepoData = usePersonalInfoContextForGettingGitHubRepoData()


  const [projectData, setProjectData] = useState<Repository | null>(null);
  const [readme, setReadme] = useState("")

  const absolutePathForImg = `${githubData.gitHubLink}/${githubData.nameGithub}/${projectData?.name}/blob/main/`

  useEffect(() => {
    const openModalHandler = (urlProject: Repository) => {
      setProjectData(urlProject)
      axios.get(`${githubData.rawGithub}/${githubData.nameGithub}/${urlProject.name}/main/README.md`, {
        responseType: "text"
      })
        .then((response) => {
          setReadme(response.data)
        })
        .catch((error) => {
          console.error("Error fetching repositories from GitHub:", error);
        });

      openModal()
    };

    modalEmitter.on('openModal', openModalHandler);

    // Pulisci il listener quando il componente viene smontato
    return () => {
      modalEmitter.removeListener('openModal', openModalHandler);
    };
  }, [modalEmitter, readme]);

  let controls: AnimationControls = useAnimation()

  function openModal() {
    let modalElement = document.getElementById(idModal)
    if (modalElement) {
      // @ts-ignore
      modalElement.show()
      modalElement.scrollTo(0, 0)
      controls.start({
        scale: 1,
        transition: {
          delay: 0.75
        }
      })
    }
  }

  function closeModal() {
    let modalElement = document.getElementById(idModal)
    if (modalElement) {
      // @ts-ignore
      modalElement.close()
      setReadme("")
    }
  }


  return <dialog id={idModal} className="modal">
    <div className="modal-box sm:w-10/12 w-8/12 max-w-5xl text-lg dark:bg-gray-700 ">
      <motion.div
        initial={{scale: 0}} animate={controls}
      >
        <a href={projectData?.html_url} target="_blank"
        >
          <h2 className="font-mono text-2xl transition-all hover:scale-105">--&gt; Readme.md</h2>
        </a>
      </motion.div>
      <div className="my-3 border-solid border-4 rounded-lg p-2">
        <p><strong>Descrizione: </strong> {projectData ? projectData.description : ""}</p>
      </div>
      {
        projectData && readme != "" ? (
          <Markdown remarkPlugins={[remarkGfm]} className="[&_img]:w-full prose max-w-max prose-lg dark:prose-invert"
                    urlTransform={(url, key, node) => {
                      if (node.tagName === "img") {
                        //Absolut url just add raw at end
                        if (url.includes("https://")) {
                          return url + "?raw=true";
                        } else {
                          //Relative path ex: ImageProject/img_4.png
                          return absolutePathForImg + url + "?raw=true"
                        }
                      }
                    }}
          >{readme}</Markdown>
        ) : (
          <LoadingInContent/>
        )
      }


      <hr className="pt-4 my-4"/>
      <button className="my-3 border-solid border-4 rounded-lg p-2 text-center transition-all hover:scale-110"
              onClick={() => closeModal()}
      >
        <strong>Close</strong>
      </button>
    </div>


    <form method="dialog" className="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
}