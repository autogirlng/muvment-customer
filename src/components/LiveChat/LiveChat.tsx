"use client";

import { useEffect, useState } from "react";

// Configuration - easy to maintain
const WHATSAPP_CONFIG = {
  phoneNumber: "2348167474165",
  businessName: "Muvment Support",
  greetingMessage:
    "Hello! 👋\n\nWelcome to Muvment. How can we help you today?",
  replyTime: "Typically replies within minutes",
  buttonText: "Start Chat",
  delayMs: 10000,
  greetingDelayMs: 2000,
};

export default function WhatsAppChat() {
  const [showWidget, setShowWidget] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const widgetTimer = setTimeout(() => {
      setShowWidget(true);
    }, WHATSAPP_CONFIG.delayMs);

    return () => clearTimeout(widgetTimer);
  }, []);

  useEffect(() => {
    if (showWidget) {
      const greetingTimer = setTimeout(() => {
        setShowGreeting(true);
      }, WHATSAPP_CONFIG.greetingDelayMs);

      return () => clearTimeout(greetingTimer);
    }
  }, [showWidget]);

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!showWidget) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Greeting Message Bubble */}
      {showGreeting && !isMinimized && (
        <div className="animate-slideIn max-w-xs rounded-lg bg-white p-4 shadow-xl">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center">
                <svg viewBox="0 0 17 17" fill="white" className="h-6 w-6">
                  <path d="M16.5333 8.7668C16.5333 13.0668 13.02 16.5535 8.67999 16.5535C7.29999 16.5535 6.01333 16.2001 4.87999 15.5868L0.533325 16.9668L1.95333 12.7868C1.21185 11.5746 0.81965 10.1811 0.819992 8.76013C0.826659 4.45346 4.34666 0.966797 8.68666 0.966797C13.0133 0.966797 16.5333 4.45346 16.5333 8.7668ZM8.67999 2.20013C5.03999 2.20013 2.07999 5.14013 2.07999 8.75346C2.07999 10.1868 2.54666 11.5135 3.33333 12.5935L2.50666 15.0335L5.03999 14.2335C6.12135 14.9422 7.38707 15.3178 8.67999 15.3135C12.32 15.3135 15.28 12.3801 15.28 8.76013C15.2712 7.01671 14.5715 5.3479 13.3343 4.11948C12.0972 2.89106 10.4234 2.20325 8.67999 2.2068V2.20013ZM12.6467 10.5535C12.5933 10.4735 12.4667 10.4268 12.2733 10.3335C12.0867 10.2401 11.14 9.77346 10.96 9.71346C10.7867 9.6468 10.6533 9.61346 10.5267 9.8068C10.3933 10.0001 10.0267 10.4268 9.91999 10.5535C9.80666 10.6868 9.69333 10.7001 9.49999 10.6068C9.30666 10.5068 8.68666 10.3068 7.95333 9.65346C7.53454 9.26854 7.17509 8.82372 6.88666 8.33346C6.76666 8.14013 6.86666 8.04013 6.96666 7.9468C7.05333 7.86013 7.15999 7.72013 7.25333 7.61346C7.35333 7.50013 7.38666 7.41346 7.44666 7.29346C7.51333 7.16013 7.47999 7.05346 7.43333 6.96013C7.37999 6.86013 6.99999 5.92013 6.83333 5.54013C6.67333 5.15346 6.51333 5.22013 6.40666 5.22013C6.29333 5.22013 6.15999 5.20013 6.03333 5.20013C5.89999 5.20013 5.69999 5.25346 5.51999 5.44013C5.34666 5.63346 4.85333 6.09346 4.85333 7.04013C4.85333 7.97346 5.53999 8.88013 5.63333 9.01346C5.72666 9.14013 6.96666 11.1268 8.91999 11.8935C10.88 12.6601 10.88 12.4068 11.2333 12.3735C11.5867 12.3401 12.3667 11.9068 12.5333 11.4668C12.6933 11.0201 12.6933 10.6335 12.6467 10.5535Z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {WHATSAPP_CONFIG.businessName}
                </div>
                <div className="text-xs text-gray-500">
                  {WHATSAPP_CONFIG.replyTime}
                </div>
              </div>
            </div>
            <button
              onClick={handleMinimize}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Minimize chat"
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
          <div className="mb-4 whitespace-pre-line rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
            {WHATSAPP_CONFIG.greetingMessage}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full rounded-lg bg-green-500 px-4 py-3 font-medium text-white transition-colors hover:bg-green-600"
          >
            {WHATSAPP_CONFIG.buttonText}
          </button>
        </div>
      )}

      <button
        onClick={isMinimized ? handleMinimize : handleWhatsAppClick}
        className="group relative h-16 w-16 rounded-full bg-green-500 shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="Open WhatsApp chat"
      >
        {isMinimized && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            1
          </span>
        )}

        <svg
          viewBox="0 0 17 17"
          fill="white"
          className="h-8 w-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <path d="M16.5333 8.7668C16.5333 13.0668 13.02 16.5535 8.67999 16.5535C7.29999 16.5535 6.01333 16.2001 4.87999 15.5868L0.533325 16.9668L1.95333 12.7868C1.21185 11.5746 0.81965 10.1811 0.819992 8.76013C0.826659 4.45346 4.34666 0.966797 8.68666 0.966797C13.0133 0.966797 16.5333 4.45346 16.5333 8.7668ZM8.67999 2.20013C5.03999 2.20013 2.07999 5.14013 2.07999 8.75346C2.07999 10.1868 2.54666 11.5135 3.33333 12.5935L2.50666 15.0335L5.03999 14.2335C6.12135 14.9422 7.38707 15.3178 8.67999 15.3135C12.32 15.3135 15.28 12.3801 15.28 8.76013C15.2712 7.01671 14.5715 5.3479 13.3343 4.11948C12.0972 2.89106 10.4234 2.20325 8.67999 2.2068V2.20013ZM12.6467 10.5535C12.5933 10.4735 12.4667 10.4268 12.2733 10.3335C12.0867 10.2401 11.14 9.77346 10.96 9.71346C10.7867 9.6468 10.6533 9.61346 10.5267 9.8068C10.3933 10.0001 10.0267 10.4268 9.91999 10.5535C9.80666 10.6868 9.69333 10.7001 9.49999 10.6068C9.30666 10.5068 8.68666 10.3068 7.95333 9.65346C7.53454 9.26854 7.17509 8.82372 6.88666 8.33346C6.76666 8.14013 6.86666 8.04013 6.96666 7.9468C7.05333 7.86013 7.15999 7.72013 7.25333 7.61346C7.35333 7.50013 7.38666 7.41346 7.44666 7.29346C7.51333 7.16013 7.47999 7.05346 7.43333 6.96013C7.37999 6.86013 6.99999 5.92013 6.83333 5.54013C6.67333 5.15346 6.51333 5.22013 6.40666 5.22013C6.29333 5.22013 6.15999 5.20013 6.03333 5.20013C5.89999 5.20013 5.69999 5.25346 5.51999 5.44013C5.34666 5.63346 4.85333 6.09346 4.85333 7.04013C4.85333 7.97346 5.53999 8.88013 5.63333 9.01346C5.72666 9.14013 6.96666 11.1268 8.91999 11.8935C10.88 12.6601 10.88 12.4068 11.2333 12.3735C11.5867 12.3401 12.3667 11.9068 12.5333 11.4668C12.6933 11.0201 12.6933 10.6335 12.6467 10.5535Z" />
        </svg>
      </button>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// app/components/LiveChat.tsx
// "use client";

// import { LiveChatWidget } from "@livechat/widget-react";
// import { useEffect, useState } from "react";

// export default function LiveChat() {
//   const [showWidget, setShowWidget] = useState(false);

//   useEffect(() => {
//     // Delay popup by 10000 seconds
//     const timer = setTimeout(() => {
//       setShowWidget(true);
//     }, 10000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <>
//       {showWidget && (
//         <LiveChatWidget
//           license="19431832"
//           visibility="minimized"
//           customerEmail="support@autogirl.ng"
//         />
//       )}
//     </>
//   );
// }
