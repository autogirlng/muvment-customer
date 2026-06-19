"use client";

import React, { useState } from "react";
import { FiCheckCircle, FiMail } from "react-icons/fi";
import { NewsletterService } from "@/controllers/newsletter/newsletterService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface NewsletterSignupProps {
  heading?: string;
  subheading?: string;
  className?: string;
}

export default function NewsletterSignup({
  heading = "Subscribe to our newsletter",
  subheading = "New cities, offers, and travel tips, straight to your inbox.",
  className = "",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }
    setStatus("loading");
    setMessage("");
    const res = await NewsletterService.subscribe(email.trim());
    if (res.ok) {
      setStatus("success");
      setMessage(res.message || "You are subscribed. Watch your inbox.");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(res.message || "Could not subscribe. Please try again.");
    }
  };

  return (
    <div
      className={`rounded-2xl border border-[#E7F1FF] bg-[#E7F1FF] p-6 sm:p-8 ${className}`}
    >
      <div className="mx-auto max-w-xl text-center">
        <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0673FF]/10">
          <FiMail className="h-5 w-5 text-[#0673FF]" />
        </span>
        <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
          {heading}
        </h3>
        <p className="mt-2 text-sm text-gray-600">{subheading}</p>

        {status === "success" ? (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-[#0673FF]">
            <FiCheckCircle className="h-4 w-4" />
            {message}
          </div>
        ) : (
          <>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder="Enter your email"
                className="w-full flex-1 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-[#0673FF]"
              />
              <button
                type="button"
                onClick={submit}
                disabled={status === "loading"}
                className="rounded-full bg-[#0673FF] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0560d6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
            {status === "error" && (
              <p className="mt-2 text-left text-xs text-[#D42620] sm:text-center">
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
