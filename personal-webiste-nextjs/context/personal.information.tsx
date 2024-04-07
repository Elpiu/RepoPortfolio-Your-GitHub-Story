"use client"

import React, {createContext, useContext, useEffect, useState} from "react";
import {RootData} from "@/lib/types";
import axios from "axios";
import {DATA_FILE_JSON_FIELD, DATA_FILE_NAME} from "@/lib/storage.accessors";


type PersonalInfoContextType = RootData;


export const PersonalInfoContext =
  createContext<PersonalInfoContextType | null>(null);


type PersonalInfoContextProviderProps = {
  children: React.ReactNode;
}
export default function PersonalInfoContextProvider({
                                                      children,
                                                    }: PersonalInfoContextProviderProps) {

  const [personalInfo, setPersonalInfo] = useState<RootData | null>(null);

  useEffect(() => {
    // Check if personalInfo already exists, if not, fetch and set it
    if (!personalInfo) {
      axios
        .get(`/data/${DATA_FILE_NAME}.json`)
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
    //TODO LOADING
    return <div>
      <span className="loading loading-ring loading-lg"></span>
    </div>;
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
