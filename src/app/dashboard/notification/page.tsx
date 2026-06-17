"use client";

import {
  NotificationService,
  Notification,
} from "@/controllers/notification/notificationService";
import React, { useState, useEffect, useCallback } from "react";
import {
  IoNotificationsOutline,
  IoTrashOutline,
  IoClose,
  IoEllipsisVertical,
} from "react-icons/io5";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<
    string | null
  >(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const size = 50;
      let pageIndex = 0;
      let all: Notification[] = [];
      let total = 0;
      while (true) {
        const res = await NotificationService.getUserNotifications(
          pageIndex,
          size,
        );
        const content: Notification[] = res?.data?.content || [];
        total = res?.data?.totalElements ?? total;
        all = all.concat(content);
        pageIndex += 1;
        if (content.length < size || all.length >= total || pageIndex > 50)
          break;
      }
      setNotifications(all);
      setTotalCount(total || all.length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleDeleteNotification = async (id: string) => {
    try {
      setDeleting(id);
      await NotificationService.deleteNotification(id);

      // Update local state
      const newNotifications = notifications.filter((n) => n.id !== id);
      setNotifications(newNotifications);
      setTotalCount((prev) => prev - 1);

      setShowDeleteModal(false);
      setNotificationToDelete(null);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeletingAll(true);
      const allIds = notifications.map((n) => n.id);
      await NotificationService.deleteAllNotifications(allIds);
      setNotifications([]);
      setTotalCount(0);
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
    } finally {
      setDeletingAll(false);
    }
  };

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const grouped: { [key: string]: Notification[] } = {};

    notifications.forEach((notification) => {
      const date = new Date(notification.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let label = "";
      if (date.toDateString() === today.toDateString()) {
        label = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else {
        label = date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        });
      }

      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(notification);
    });

    return grouped;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (date.toDateString() === today.toDateString()) {
      return `today at ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `yesterday at ${timeStr}`;
    } else {
      const dayStr = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      return `${dayStr} at ${timeStr}`;
    }
  };

  const groupedNotifications = groupNotificationsByDate(notifications);



  const DeleteAllConfirmModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Delete all notifications
          </h3>
          <button
            onClick={() => setShowDeleteAllModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete all {totalCount} notification
          {totalCount !== 1 ? "s" : ""}? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteAllModal(false)}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await handleDeleteAll();
              setShowDeleteAllModal(false);
            }}
            disabled={deletingAll}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deletingAll ? "Deleting..." : "Delete all"}
          </button>
        </div>
      </div>
    </div>
  );

  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Delete Notification
          </h3>
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setNotificationToDelete(null);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this notification? This action cannot
          be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setNotificationToDelete(null);
            }}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              notificationToDelete &&
              handleDeleteNotification(notificationToDelete)
            }
            disabled={deleting !== null}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {showDeleteModal && <DeleteConfirmModal />}
      {showDeleteAllModal && <DeleteAllConfirmModal />}
      <div>

        {/* Action Bar */}
        {notifications.length > 0 && (
          <div className="sticky top-16 z-10 -mx-4 mb-4 bg-gray-50 px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
              notification{totalCount !== 1 ? "s" : ""}
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="More options"
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <IoEllipsisVertical size={20} />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowDeleteAllModal(true);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <IoTrashOutline size={18} /> Delete all notifications
                    </button>
                  </div>
                </>
              )}
            </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0673ff] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <IoNotificationsOutline className="text-gray-400" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600 text-center max-w-sm">
                When you receive notifications, they'll appear here
              </p>
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date} className="space-y-2">
                <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {date}
                </h2>
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-50">
                  {notifs.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                        notification.isRead ? "" : "bg-[#E7F1FF]/40"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-[#0673ff]" />
                          )}
                          <h3
                            className={`truncate text-sm leading-tight text-gray-900 ${
                              notification.isRead
                                ? "font-medium"
                                : "font-semibold"
                            }`}
                          >
                            {notification.title}
                          </h3>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-gray-600">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs capitalize text-gray-400">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setNotificationToDelete(notification.id);
                          setShowDeleteModal(true);
                        }}
                        disabled={deleting === notification.id}
                        aria-label="Delete notification"
                        className="shrink-0 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {deleting === notification.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                        ) : (
                          <IoTrashOutline size={18} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;
