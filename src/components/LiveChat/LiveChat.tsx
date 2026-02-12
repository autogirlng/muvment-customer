"use client";

import { useEffect, useState } from "react";

// Configuration - easy to maintain
const WHATSAPP_CONFIG = {
  phoneNumber: "2348167474165",
  businessName: "Muvment Support",
  greetingMessage:
    "Hello! 👋\n\nWelcome to Muvment. How can we help you today?",
  replyTime: "Typically replies within minutes",
  delayMs: 10000,
  greetingDelayMs: 2000,
};

const INSTAGRAM_CONFIG = {
  username: "autogirlng",
};

export default function WhatsAppChat() {
  const [showWidget, setShowWidget] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const widgetTimer = setTimeout(() => {
      setShowWidget(true);
    }, WHATSAPP_CONFIG.delayMs);

    return () => clearTimeout(widgetTimer);
  }, []);

  useEffect(() => {
    if (showWidget) {
      const greetingTimer = setTimeout(() => {
        setIsOpen(true);
      }, WHATSAPP_CONFIG.greetingDelayMs);

      return () => clearTimeout(greetingTimer);
    }
  }, [showWidget]);

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleInstagramClick = () => {
    const url = `https://ig.me/m/${INSTAGRAM_CONFIG.username}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  if (!showWidget) return null;

  return (
    <div className="fixed bottom-6 right-8 z-50 flex flex-col items-end gap-3 pr-2">
      {/* Greeting Message Bubble with Chat Options */}
      {isOpen && (
        <div className="animate-slideIn max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md">
                <svg viewBox="0 0 24 24" fill="white" className="h-7 w-7">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                  <circle cx="8" cy="10" r="1.5"/>
                  <circle cx="12" cy="10" r="1.5"/>
                  <circle cx="16" cy="10" r="1.5"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-base">
                  {WHATSAPP_CONFIG.businessName}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  {WHATSAPP_CONFIG.replyTime}
                </div>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
              aria-label="Close chat"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Message */}
          <div className="mb-5 whitespace-pre-line rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-sm text-gray-700 leading-relaxed">
            {WHATSAPP_CONFIG.greetingMessage}
          </div>

          {/* Chat Options */}
          <div className="space-y-2.5">
            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsAppClick}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Chat on WhatsApp"
            >
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg viewBox="0 0 17 17" fill="white" className="h-5 w-5">
                  <path d="M16.5333 8.7668C16.5333 13.0668 13.02 16.5535 8.67999 16.5535C7.29999 16.5535 6.01333 16.2001 4.87999 15.5868L0.533325 16.9668L1.95333 12.7868C1.21185 11.5746 0.81965 10.1811 0.819992 8.76013C0.826659 4.45346 4.34666 0.966797 8.68666 0.966797C13.0133 0.966797 16.5333 4.45346 16.5333 8.7668ZM8.67999 2.20013C5.03999 2.20013 2.07999 5.14013 2.07999 8.75346C2.07999 10.1868 2.54666 11.5135 3.33333 12.5935L2.50666 15.0335L5.03999 14.2335C6.12135 14.9422 7.38707 15.3178 8.67999 15.3135C12.32 15.3135 15.28 12.3801 15.28 8.76013C15.2712 7.01671 14.5715 5.3479 13.3343 4.11948C12.0972 2.89106 10.4234 2.20325 8.67999 2.2068V2.20013ZM12.6467 10.5535C12.5933 10.4735 12.4667 10.4268 12.2733 10.3335C12.0867 10.2401 11.14 9.77346 10.96 9.71346C10.7867 9.6468 10.6533 9.61346 10.5267 9.8068C10.3933 10.0001 10.0267 10.4268 9.91999 10.5535C9.80666 10.6868 9.69333 10.7001 9.49999 10.6068C9.30666 10.5068 8.68666 10.3068 7.95333 9.65346C7.53454 9.26854 7.17509 8.82372 6.88666 8.33346C6.76666 8.14013 6.86666 8.04013 6.96666 7.9468C7.05333 7.86013 7.15999 7.72013 7.25333 7.61346C7.35333 7.50013 7.38666 7.41346 7.44666 7.29346C7.51333 7.16013 7.47999 7.05346 7.43333 6.96013C7.37999 6.86013 6.99999 5.92013 6.83333 5.54013C6.67333 5.15346 6.51333 5.22013 6.40666 5.22013C6.29333 5.22013 6.15999 5.20013 6.03333 5.20013C5.89999 5.20013 5.69999 5.25346 5.51999 5.44013C5.34666 5.63346 4.85333 6.09346 4.85333 7.04013C4.85333 7.97346 5.53999 8.88013 5.63333 9.01346C5.72666 9.14013 6.96666 11.1268 8.91999 11.8935C10.88 12.6601 10.88 12.4068 11.2333 12.3735C11.5867 12.3401 12.3667 11.9068 12.5333 11.4668C12.6933 11.0201 12.6933 10.6335 12.6467 10.5535Z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm">Continue on WhatsApp</div>
                <div className="text-xs text-white/80">Fast & Convenient</div>
              </div>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Instagram Button */}
            <button
              onClick={handleInstagramClick}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white transition-all hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Chat on Instagram"
            >
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm">Continue on Instagram</div>
                <div className="text-xs text-white/80">Direct Messages</div>
              </div>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Button with Text Label */}
      <div className="relative flex flex-col items-center gap-2">
        {/* Text Label - Only shows when closed */}
        {!isOpen && (
          <div className="absolute -top-8 whitespace-nowrap animate-fadeIn">
            <div className="bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
              Chat with an agent
            </div>
            {/* Arrow pointing to button */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1">
              <div className="w-2 h-2 bg-green-600 rotate-45"></div>
            </div>
          </div>
        )}

        <button
          onClick={toggleChat}
          className="group relative h-14 w-14 transition-all hover:scale-110 active:scale-95"
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {/* Notification Badge */}
          {!isOpen && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-[10px] font-bold text-white shadow-md">
                1
              </span>
            </span>
          )}

          {/* Center Button */}
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-lg flex items-center justify-center transition-all group-hover:shadow-xl">
            {/* Chat Icon */}
            <div className={`transition-all duration-300 ${isOpen ? 'rotate-0 scale-100' : 'rotate-0 scale-100'}`}>
              {isOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="h-7 w-7"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="white" fill="none" d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="h-7 w-7"
                >
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                  <circle cx="8" cy="10" r="1.5"/>
                  <circle cx="12" cy="10" r="1.5"/>
                  <circle cx="16" cy="10" r="1.5"/>
                </svg>
              )}
            </div>
          </div>
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out 0.5s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}