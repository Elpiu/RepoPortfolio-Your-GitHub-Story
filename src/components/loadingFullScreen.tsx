import React from "react";

export function LoadingFullScreen() {

  return <div className="flex justify-center items-center h-screen">
    <div className="rounded-full h-20 w-20 bg-gray-800 animate-ping"></div>
  </div>

}

export function LoadingInContent() {

  return <span className="loading loading-dots loading-lg"></span>

}