import { links } from "./data";

export type SectionName = (typeof links)[number]["name"];
export type Theme = "light" | "dark";

export type RootData = {
  introData: IntroData
}

export type IntroData = {
  profileImage: string, //Supported for now Only Github
  name: string, //Name or Nickname
  fullName: string,
  emojiIconAsText: string,
  profession: string,
  yearExperience: number
  contactEmail: string,
  linkToCv: string,
  linkLinkedin: string,
  linkGithub: string
  smallIntroPhrase: string,
}



export type Location = {
  country: string;
  provincia: string;
  provincia_id: string;
  cap: string;
  citta: string;
}

export type PersonalInformation = {
  nome: string;
  cognome: string;
  fullName: string;
  telefono: string;
  whatsapp: string;
  email: string;
  yearVersion: string;
  locazione: Location;
  github_profile: string;
  github_link: string;
  curriculum_link: string;
  sono_un: string,
  "anni_esperienza": number,
  "github_profile_img": string,
  linkedin_profile: string,
  intro: string;
  descrizione: string;
  about: string;
  mission: string;
}