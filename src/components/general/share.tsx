"use client";
import { useState } from "react";
import { FiShare2, FiX, FiLink, FiCheck, FiTwitter } from "react-icons/fi";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa";
import Modal from "./modal";

interface SocialShareButtonProps {
  url?: string;
  title?: string;
  triggerClassName?: string;
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  url,
  title = "Check out this ride on Muvment",
  triggerClassName,
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: title, url: shareUrl });
        return;
      } catch {
        return;
      }
    }
    setOpen(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const channels = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: <FaWhatsapp size={20} />,
      bg: "bg-green-500",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <FiTwitter size={20} />,
      bg: "bg-black",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FaFacebookF size={18} />,
      bg: "bg-[#1877F2]",
    },
  ];

  return (
    <div className="relative inline-block">
      <button
        onClick={handleShare}
        className={
          triggerClassName ||
          "p-2 cursor-pointer bg-gray-900 hover:bg-gray-800 text-white rounded-full transition"
        }
        aria-label="Share this vehicle"
      >
        <FiShare2 size={18} />
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col py-5 px-6 w-[330px] max-w-full">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Share this ride
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Send it to someone who needs a ride.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group"
              >
                <span
                  className={`w-12 h-12 rounded-full ${c.bg} text-white flex items-center justify-center transition group-hover:opacity-90`}
                >
                  {c.icon}
                </span>
                <span className="text-xs text-gray-600">{c.label}</span>
              </a>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="mt-5 flex items-center justify-between w-full border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50 transition cursor-pointer text-left"
          >
            <span className="text-sm text-gray-600 truncate mr-3">
              {shareUrl}
            </span>
            <span
              className={`flex items-center gap-1 text-sm font-medium shrink-0 ${
                copied ? "text-green-600" : "text-[#0673ff]"
              }`}
            >
              {copied ? (
                <>
                  <FiCheck size={16} /> Copied
                </>
              ) : (
                <>
                  <FiLink size={16} /> Copy
                </>
              )}
            </span>
          </button>
        </div>
      </Modal>
    </div>
  );
};

export { SocialShareButton };
