"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCheckCircle, FiMail, FiAlertCircle } from "react-icons/fi";
import { Navbar } from "@/components/Navbar";
import { NewsletterService } from "@/controllers/newsletter/newsletterService";

const ManageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contactId") || "";

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // The link is triggered explicitly, never on load, so a mail client
  // prefetching the URL cannot unsubscribe the person without their action.
  const handleUnsubscribe = async () => {
    if (!contactId) {
      setError("This link is missing its unsubscribe reference.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await NewsletterService.unsubscribeByContactId(contactId);
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError(
        res.message ||
          "We could not process your request. Please try again shortly.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl">
          {done ? (
            <>
              <div className="mx-auto mb-5 inline-block rounded-full bg-green-50 p-5">
                <FiCheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="mb-2 text-2xl font-extrabold text-gray-900">
                You have been unsubscribed
              </h1>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                You will no longer receive newsletter emails from Muvment. You
                can resubscribe at any time from our website.
              </p>
              <button
                onClick={() => router.push("/")}
                className="w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: "#0673ff" }}
              >
                Back to Muvment
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto mb-5 inline-block rounded-full bg-[#EAF2FF] p-5">
                <FiMail className="h-12 w-12 text-[#0673ff]" />
              </div>
              <h1 className="mb-2 text-2xl font-extrabold text-gray-900">
                Manage your email preferences
              </h1>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                If you no longer wish to receive newsletter emails from Muvment,
                you can unsubscribe below.
              </p>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border-l-4 border-red-500 bg-red-50 p-3 text-left">
                  <FiAlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-xs font-medium text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleUnsubscribe}
                disabled={submitting || !contactId}
                className="w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "#0673ff" }}
              >
                {submitting ? "Unsubscribing..." : "Unsubscribe"}
              </button>

              <button
                onClick={() => router.push("/")}
                className="mt-3 w-full rounded-xl px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Keep me subscribed
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const NewsletterManagePage = () => (
  <Suspense fallback={null}>
    <ManageContent />
  </Suspense>
);

export default NewsletterManagePage;
