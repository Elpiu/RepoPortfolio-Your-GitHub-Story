import {Metadata} from "next";

export const getSEOTagsLayout = (): Metadata => {
  return {
    title: "Elpidio | Personal Portfolio",
    description: "I am a full stack developer with 4 year of experience, based in Salerno, Italia, with expertise in Angular, Java, Spring, Typescript. I specialize in building dynamic and responsive web applications. I'm a problem solver, a developer with a strong curriculum, I'm looking for a job or freelancer opportunities. I'm graduated from Università degli Studi di Salerno, Fisciano.",
    keywords: [
      "Full stack developer", "web development", "front-end", "back-end",
      "Angular", "React", "Node.js", "Spring", "Salerno", "Italia",
      "curriculum", "CV", "lavoro", "freelancer", "problem solver", "developer", "università fisciano",
      "unisa", "Uni", "IT", "information computer technology", "GitHub"
    ],
    creator: "Elpidio Mazza",
    authors: [{name: "Elpidio Mazza"}],
    verification: {
      google: "lDBVEl4aNsiOn2GFnlTBVO8G_skMhZE8xPEioEFmEeE" // Change with yours
    },
    applicationName: "Personal Portfolio",
    publisher: "Elpidio Mazza",
  }
}

