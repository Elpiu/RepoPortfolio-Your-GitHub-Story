import {Metadata} from "next";

export const getSEOTagsLayout = (): Metadata => {
  return {
    title: "Elpidio | Personal Portfolio",
    description: "Elpidio is a full-stack developer with 4 year of experience.",
    creator: "Elpidio Mazza",
    verification: {
      google: "lDBVEl4aNsiOn2GFnlTBVO8G_skMhZE8xPEioEFmEeE" // Change with yours
    },
    applicationName: "Personal Portfolio",
    publisher: "Elpidio Mazza",
  }
}