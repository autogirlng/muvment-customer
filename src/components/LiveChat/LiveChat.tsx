// app/components/LiveChat.tsx
"use client";

import { LiveChatWidget } from "@livechat/widget-react";
import { useEffect, useState } from "react";

export default function LiveChat() {
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    // Delay popup by 10000 seconds
    const timer = setTimeout(() => {
      setShowWidget(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showWidget && (
        <LiveChatWidget license="19431832" visibility="minimized" />
      )}
    </>
  );
}
