import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import ActiveSectionContextProvider from "../../context/active-section";
import ThemeContextProvider from "../../context/theme-context";
import {Toaster} from "react-hot-toast";
import React from "react";
import ThemeSwitch from "@/components/theme-switch";
import Footer from "@/components/sections/footer";
import PersonalInfoContextProvider from "../../context/personal.information";
import {getSEOTagsLayout} from "@/lib/SEO";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = getSEOTagsLayout()

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth">
    <body
      className={`${inter.className} bg-gray-50 text-gray-950 pt-28 sm:pt-36
        dark:bg-gray-900 dark:text-gray-50 dark:text-opacity-90
        `}
    >
    <ThemeContextProvider>
      <PersonalInfoContextProvider>
        <ActiveSectionContextProvider>
          <Header/>
          {children}
          <ThemeSwitch/>
          <Toaster position="top-right" reverseOrder={false}/>
          <Footer/>
        </ActiveSectionContextProvider>
      </PersonalInfoContextProvider>
    </ThemeContextProvider>
    </body>
    </html>
  );
}
