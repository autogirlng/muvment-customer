"use client";

import { toast, type ToastOptions } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { RealtimeNotification } from "@/types/notification";
import { playNotificationSound } from "@/helpers/notificationSound";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/controllers/connnector/queryKeys";

// Maps a notification type to the matching react-toastify variant. Anything
// unrecognised falls back to a neutral info toast.
const showToast = (notification: RealtimeNotification) => {
  playNotificationSound();

  const body = notification.message
    ? `${notification.title}: ${notification.message}`
    : notification.title;

  const options: ToastOptions = {
    autoClose: notification.priority === "HIGH" ? 6000 : 3000,
    onClick: () => {
      if (notification.actionUrl) window.location.href = notification.actionUrl;
    },
  };

  switch (notification.type) {
    case "SUCCESS":
      toast.success(body, options);
      break;
    case "ERROR":
      toast.error(body, options);
      break;
    case "WARNING":
      toast.warning(body, options);
      break;
    default:
      toast.info(body, options);
  }
};

// Mounted once inside AuthProvider. Opens the notification socket for a signed-in
// user and surfaces each incoming message as a toast. Renders nothing.
export default function NotificationSocketListener() {
  const { user, accessToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin =
    typeof user?.userType === "string" &&
    user.userType.toUpperCase().includes("ADMIN");

  useNotificationSocket({
    userId: isAuthenticated ? user?.id : null,
    token: isAuthenticated ? accessToken : null,
    isAdmin,
    onNotification: (notification) => {
      showToast(notification);
      // The notification list is cached and does not refetch on its own, so a
      // message arriving here has to mark it out of date. Without this a new
      // notification would only appear after a hard refresh.
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });

  return null;
}
