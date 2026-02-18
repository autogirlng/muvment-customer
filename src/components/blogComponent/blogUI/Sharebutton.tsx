"use client";

import { useState } from "react";
import { FiShare2 } from "react-icons/fi";
import { BiCheck } from "react-icons/bi";

interface ShareButtonProps {
  url: string;
  title: string;
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
    >
      {copied ? (
        <>
          <BiCheck className="w-4 h-4 text-green-500" />
          Copied!
        </>
      ) : (
        <>
          <FiShare2 className="w-4 h-4" />
          Share
        </>
      )}
    </button>
  );
}