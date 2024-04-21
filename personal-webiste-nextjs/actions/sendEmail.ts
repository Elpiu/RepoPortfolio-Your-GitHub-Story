"use server";

import React from "react";
import {Resend} from "resend";
import {getErrorMessage, validateString} from "@/lib/utils";
import ContactFormEmail from "../email/contact-form-email";

const resend = new Resend(process.env.RESEND_API_KEY);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const sendEmail = async (formData: FormData) => {
  const message = formData.get("message");
  const senderEmail = formData.get("senderEmail");

  if (!validateString(senderEmail, 500) || !validateString(message, 5000)) {
    return {
      error: "Invalid Sender Email or Message",
    };
  }

  let data;
  try {
    data = await resend.emails.send({
      from: `Contact Form <onboarding@resend.dev>`,
      to: "e.mazza@nexsoft.it",
      subject: "Message from contact form",
      reply_to: senderEmail as string,
      react: React.createElement(ContactFormEmail, {
        message: message as string,
        senderEmail: senderEmail as string,
      }),
    });
  } catch (error: unknown) {
    return {
      error: getErrorMessage(error),
    };
  }

  return {
    data,
  };
};
