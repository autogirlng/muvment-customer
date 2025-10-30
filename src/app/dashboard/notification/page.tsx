"use client";

import { Navbar } from "@/components/Navbar";
import {
  NotificationService,
  Notification,
} from "@/controllers/notification/notificationService";
import React, { useState, useEffect } from "react";
import {
  IoNotificationsOutline,
  IoTrashOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoInformationCircle,
  IoWarning,
  IoClose,
} from "react-icons/io5";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getUserNotifications(page, 10);
      setNotifications(response.data.content || []);
      setTotalCount(response.data.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      setDeleting(id);
      await NotificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
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

  const getNotificationIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "success":
        return <IoCheckmarkCircle className="text-green-500" size={24} />;
      case "error":
        return <IoAlertCircle className="text-red-500" size={24} />;
      case "warning":
        return <IoWarning className="text-amber-500" size={24} />;
      default:
        return <IoInformationCircle className="text-blue-500" size={24} />;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {showDeleteModal && <DeleteConfirmModal />}
      <Navbar />
      <div className=" mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <IoNotificationsOutline className="text-blue-600" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          </div>
          <p className="text-gray-600 ml-14">
            Stay updated with your latest activities
          </p>
        </div>

        {/* Action Bar */}
        {notifications.length > 0 && (
          <div className="mb-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
              notification{totalCount !== 1 ? "s" : ""}
            </div>
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IoTrashOutline size={18} />
              {deletingAll ? "Deleting..." : "Delete All"}
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
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
              <div key={date} className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-2">
                  {date}
                </h2>
                <div className="space-y-2">
                  {notifs.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
                        notification.isRead
                          ? "border-gray-100"
                          : "border-blue-100 bg-blue-50/30"
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="p-2 bg-gray-50 rounded-lg">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 text-base leading-tight">
                                {notification.title}
                              </h3>
                              <button
                                onClick={() => {
                                  setNotificationToDelete(notification.id);
                                  setShowDeleteModal(true);
                                }}
                                disabled={deleting === notification.id}
                                className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                              >
                                {deleting === notification.id ? (
                                  <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                                ) : (
                                  <IoTrashOutline size={20} />
                                )}
                              </button>
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="capitalize">
                                {formatTime(notification.createdAt)}
                              </span>
                              {!notification.isRead && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                  <span className="text-blue-600 font-medium">
                                    New
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalCount > 10 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page + 1} of {Math.ceil(totalCount / 10)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(totalCount / 10) - 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
