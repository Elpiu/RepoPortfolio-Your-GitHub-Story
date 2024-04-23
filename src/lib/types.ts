import {links} from "./data";

export type SectionName = (typeof links)[number]["name"];
export type Theme = "light" | "dark";

export type RootData = {
  introData: IntroData,
  aboutMe: string[],
  skills: string[],
  experiences: Experience[],
  gitHubRepoData: GitHubRepoData
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

export type GitHubRepoData = {
  excludedRepo: string[] //Repository to hide
  nameGithub: string
  urlApiGithub: string
  gitHubLink: string
  rawGithub: string
  fragmentRepository: string
  orderByStars: boolean
}

export type Repository = {
  id: string
  name: string
  description: string
  created_at: Date
  stargazers_count: string
  watchers_count: string
  forks_count: string
  forks: string
  url: string
  html_url: string
  topics: string[]
  languages_url: string
  contributors_url: string
}
