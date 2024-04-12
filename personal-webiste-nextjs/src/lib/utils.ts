import React from "react";
import {CgWorkAlt} from "react-icons/cg";
import {LuGraduationCap} from "react-icons/lu";


const supportedIconMapFromString = new Map()
  .set("work", CgWorkAlt)
  .set("education", LuGraduationCap)

export const validateString = (value: unknown, maxLenght: number) => {
  if (!value || typeof value !== "string" || value.length > maxLenght) {
    return false;
  }
  return true;
};

export const getErrorMessage = (error: unknown): string => {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = "Something went wrong";
  }

  return message;
};

export const createIconFromText = (iconName: string) => {
  return React.createElement(supportedIconMapFromString.get(iconName))
}

export function repositoryRandomImagePlaceholder(){
  const randomIndex = Math.floor(Math.random() * 7)+1;
  return `/repo-placeholder/placeholder-${randomIndex}.webp`
}