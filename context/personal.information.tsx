"use client"

import React, {createContext, useContext, useEffect, useState} from "react";
import {Experience, GitHubRepoData, IntroData, RootData} from "../src/lib/types";
import axios from "axios";
import {DATA_FILE_JSON_FIELD, DATA_FILE_NAME} from "@/lib/storage.accessors";
import {LoadingFullScreen} from "@/components/loadingFullScreen";


type PersonalInfoContextType = RootData;


export const PersonalInfoContext =
  createContext<PersonalInfoContextType | null>(null);


type PersonalInfoContextProviderProps = {
  children: React.ReactNode;
}
export default function PersonalInfoContextProvider({
                                                      children,
                                                    }: Readonly<PersonalInfoContextProviderProps>) {

  const [personalInfo, setPersonalInfo] = useState<RootData | null>(null);
  useEffect(() => {
    // Check if personalInfo already exists, if not, fetch and set it
    if (!personalInfo) {
      axios
        .get(`/data/${DATA_FILE_NAME}.json`, {
          responseType: "json",
        })
        .then((response) => {
          const data = response.data[DATA_FILE_JSON_FIELD] as PersonalInfoContextType;
          setPersonalInfo(data);
        })
        .catch((error) => {
          console.error("Error fetching personal info:", error);
        });
    }
  }, []);

  // Return a loading state until data is fetched
  if (!personalInfo) {
    return <LoadingFullScreen/>;
  }

  return (
    <PersonalInfoContext.Provider value={personalInfo}>
      {children}
    </PersonalInfoContext.Provider>
  );
}

export function usePersonalInfoContext(): PersonalInfoContextType {
  const context = useContext(PersonalInfoContext);
  if (context === null) {
    throw new Error(
      "usePersonalInfoContext must be used without a PersonalInfoContextProvider",
    );
  }
  return context;
}

export function usePersonalInfoContextForGettingIntroData(): IntroData {
  return usePersonalInfoContext().introData
}

export function usePersonalInfoContextForGettingAboutMeData(): string[] {
  return usePersonalInfoContext().aboutMe
}

export function usePersonalInfoContextForGettingExperienceData(): Experience[] {
  return usePersonalInfoContext().experiences
}

export function usePersonalInfoContextForGettingGitHubRepoData(): GitHubRepoData {
  return usePersonalInfoContext().gitHubRepoData
}

export function usePersonalInfoContextForGettingSkillsData(): string[] {
  return usePersonalInfoContext().skills
}

