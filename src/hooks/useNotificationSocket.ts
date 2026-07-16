"use client";

import { useEffect, useRef } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { RealtimeNotification } from "@/types/notification";

interface UseNotificationSocketArgs {
  userId: string | null | undefined;
  token: string | null | undefined;
  isAdmin?: boolean;
  onNotification: (notification: RealtimeNotification) => void;
}

// The backend runs under the /api context path, so the SockJS endpoint is at
// <root>/api/ws (SockJS negotiates at /api/ws/info). NEXT_PUBLIC_API_URL is the
// bare root that the rest of the app prefixes with /api/v1, so normalise it to
// the root and append /api/ws.
const buildSocketUrl = (): string | null => {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return null;
  const root = base.replace(/\/+$/, "").replace(/\/api(\/v1)?$/, "");
  return `${root}/api/ws`;
};

const parseNotification = (
  message: IMessage,
): RealtimeNotification | null => {
  try {
    const parsed = JSON.parse(message.body);
    if (parsed && typeof parsed.title === "string") {
      return parsed as RealtimeNotification;
    }
    return null;
  } catch {
    return null;
  }
};

export const useNotificationSocket = ({
  userId,
  token,
  isAdmin = false,
  onNotification,
}: UseNotificationSocketArgs): void => {
  // Hold the latest callback in a ref so reconnecting is not triggered by a new
  // function identity on every render.
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    if (!userId || !token) return;

    const socketUrl = buildSocketUrl();
    if (!socketUrl) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        client.subscribe(
          `/user/${userId}/queue/notifications`,
          (message) => {
            const notification = parseNotification(message);
            if (notification) callbackRef.current(notification);
          },
        );

        if (isAdmin) {
          client.subscribe("/topic/admin-notifications", (message) => {
            const notification = parseNotification(message);
            if (notification) callbackRef.current(notification);
          });
        }
      },
    });

    client.activate();

    return () => {
      // deactivate returns a promise; the listener is torn down regardless.
      void client.deactivate();
    };
  }, [userId, token, isAdmin]);
};
