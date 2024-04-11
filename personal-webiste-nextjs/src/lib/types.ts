import { links } from "./data";

export type SectionName = (typeof links)[number]["name"];
export type Theme = "light" | "dark";

export type RootData = {
  introData: IntroData,
  aboutMe: string[],
  experiences: Experience[]
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

export type Experience = {
  title: string,
  location: string,
  description: string,
  icon: string, //React Icon
  date: string
}
// stargazers_count
// watchers_count
//
// forks_count
// forks
// url
// description
// html_url<
// topics: string[]
// languages_url
// contributors_url