import { useState } from "react";
import { FiShare2, FiX, FiTwitter, FiInstagram, FiLink } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Modal from "./modal";



interface SocialShareButtonProps {
    url?: string;
    title?: string;
}

const SocialShareButton: React.FC<SocialShareButtonProps> = ({
    url = typeof window !== "undefined" ? window.location.href : "",
    title = "Check this out!",
}) => {
    const [open, setOpen] = useState(false);

    const handleToggle = () => setOpen(!open);

    const encodedUrl = encodeURIComponent(url);

    const [copied, setCopied] = useState(false);

    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");


    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={handleToggle}
                className="p-2 bg-gray-200 cursor-pointer bg-gray-900 hover:bg-gray-800 text-white rounded-full hover:bg-gray-300 transition"
                aria-label="Share"
            >
                {open ? <FiX size={20} /> : <FiShare2 size={20} />}
            </button>

            <Modal isOpen={open} onClose={() => setOpen(false)}>
                <div className="flex flex-col py-3 px-5">
                    <h2 className="text-xl font-semibold ">Share this ride</h2>

                    <div className="mt-5 ">
                        <div className="flex gap-3">
                            <a
                                href={`https://api.whatsapp.com/send?text=${title}%20${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full hover:opacity-80"
                            >
                                <FaWhatsapp />
                            </a>

                            <a
                                href={`https://www.instagram.com/?url=${encodedUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-10 h-10 bg-pink-500 text-white rounded-full hover:opacity-80"
                            >
                                <FiInstagram />
                            </a>

                            <a
                                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:opacity-80"
                            >
                                <FiTwitter />
                            </a>

                            <button
                                onClick={handleCopy}
                                className="flex cursor-pointer items-center justify-center w-10 h-10 bg-gray-200 text-black rounded-full hover:bg-gray-300"
                            >
                                <FiLink />
                            </button>
                        </div>
                        {copied && <span className="text-sm text-green-600 mt-2">Link copied!</span>}
                    </div>
                </div>
            </Modal>


        </div>
    );
};

export { SocialShareButton };
