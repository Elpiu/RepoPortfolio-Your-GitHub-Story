import React from "react";
import {CgWorkAlt} from "react-icons/cg";
import {LuGraduationCap} from "react-icons/lu";

import placeholder_1 from '../../public/repo-placeholder/placeholder-1.webp'
import placeholder_2 from '../../public/repo-placeholder/placeholder-2.webp'
import placeholder_3 from '../../public/repo-placeholder/placeholder-3.webp'
import placeholder_4 from '../../public/repo-placeholder/placeholder-4.webp'
import placeholder_5 from '../../public/repo-placeholder/placeholder-5.webp'
import placeholder_6 from '../../public/repo-placeholder/placeholder-6.webp'
import placeholder_7 from '../../public/repo-placeholder/placeholder-7.webp'
import placeholder_8 from '../../public/repo-placeholder/placeholder-8.webp'

const supportedIconMapFromString = new Map()
  .set("work", CgWorkAlt)
  .set("education", LuGraduationCap)

export const validateString = (value: unknown, maxLenght: number) => {
  return !(!value || typeof value !== "string" || value.length > maxLenght);

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


export function repositoryRandomImagePlaceholder() {
  const randomIndex = Math.floor(Math.random() * 7) + 1;
  switch (randomIndex) {
    case 1: return placeholder_1;
    case 2: return placeholder_2;
    case 3: return placeholder_3;
    case 4: return placeholder_4;
    case 5: return placeholder_5;
    case 6: return placeholder_6;
    case 7: return placeholder_7;
    default: return placeholder_8;
  }
}