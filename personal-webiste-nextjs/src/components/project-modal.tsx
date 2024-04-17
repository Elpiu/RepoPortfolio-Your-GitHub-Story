import React, {useEffect, useState} from "react";
import EventEmitter from "events";
import {Repository} from "@/lib/types";

type ProjectModalProps = {
  idModal: string
  modalEmitter: EventEmitter
}

export default function ProjectModal({idModal, modalEmitter}: ProjectModalProps) {

  const [projectData, setProjectData] = useState<Repository>(null);
  const openModal = () => {
    document.getElementById(idModal).showModal()
  }

  useEffect(() => {
    const openModalHandler = (urlProject: Repository) => {
      setProjectData(urlProject)
      console.log(urlProject)
      openModal()

      //axios.get(`${urlProject}`, {
      //  responseType: "json"
      //}).then((response) => {
      //  setProjectData(response)
      //  document.getElementById(idModal).showModal()
      //})
      //.catch((error) => {
      //  console.error("Error fetching repositories from GitHub:", error);
      //});
    };

    modalEmitter.on('openModal', openModalHandler);

    // Pulisci il listener quando il componente viene smontato
    return () => {
      modalEmitter.removeListener('openModal', openModalHandler);
    };
  }, [modalEmitter]);


  return projectData ? (
    <>
      <dialog id={idModal} className="modal">
        <div className="modal-box w-11/12 max-w-5xl text-lg">
          <h2 className="font-bold text-2xl">{projectData.name}</h2>
          <hr className="my-4"/>
          <div className="">
            <p>{projectData.description}</p>
          </div>
          <div className="my-3 border-solid border-4 rounded-lg p-2">
          </div>

          <p className="py-4">Press ESC key or click outside to close</p>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>

  ) : <></>

}