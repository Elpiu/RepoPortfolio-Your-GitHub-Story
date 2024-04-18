import React, {useEffect, useState} from "react";
import EventEmitter from "events";
import {GitHubRepoData, Repository} from "@/lib/types";
import Markdown from "react-markdown";
import axios from "axios";
import {usePersonalInfoContextForGettingGitHubRepoData} from "../../context/personal.information";
import remarkGfm from 'remark-gfm'


type ProjectModalProps = {
  idModal: string
  modalEmitter: EventEmitter
  rawGithub: string
  nameGithub: string
  projectName: string
  linkGithub: string
}

export default function ProjectModal({idModal, modalEmitter}: ProjectModalProps) {

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
          console.log(response)
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

  const openModal = () => {
    // @ts-ignore
    let modalElement = document.getElementById(idModal)
    if (modalElement) modalElement.show()
  }

  const closeModal = () => {
    // @ts-ignore
    let modalElement = document.getElementById(idModal)
    if (modalElement) {
      modalElement.close()
    }
  }

  return projectData ? (
    <>
      <dialog id={idModal} className="modal">
        <div className="modal-box w-10/12 max-w-5xl text-lg dark:bg-gray-700">
          <h2 className="font-bold text-2xl">--> Readme.md</h2>
          <div className="my-3 border-solid border-4 rounded-lg p-2">
            <p><strong>Descrizione: </strong> {projectData.description}</p>
          </div>

          <Markdown remarkPlugins={[remarkGfm]} className="prose max-w-max prose-lg dark:prose-invert"
                    urlTransform={(url, key, node) => {
                      if (node.tagName === "img") {
                        //Absolut url just add raw at end
                        if (url.includes("https://")) {
                          return url + "?raw=true";
                        } else {
                          console.log(absolutePathForImg)
                          //Relative path ex: ImageProject/img_4.png
                          return absolutePathForImg + url + "?raw=true"
                        }
                      }
                    }}
          >{readme}</Markdown>

          <hr className="pt-4 my-4"/>
          <button className="my-3 border-solid border-4 rounded-lg p-2 text-center"
          onClick={() => closeModal()}
          >
            <strong>Close</strong>
          </button>
        </div>


        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>

  ) : <></>

}