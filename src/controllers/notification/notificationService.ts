import {
  deleteWithParams,
  getSingleData,
  getTableData,
} from "../connnector/app.callers";

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type?: string;
}

export interface NotificationResponse {
  status: string;
  message: string;
  errorCode?: string;
  data: Notification[];
  timestamp: string;
}

export class NotificationService {
  private static readonly NOTIFICATION_BASE_URL =
    "/api/v1/notification/notification-by-user";
  private static readonly DELETE_NOTIFICATION_URL = "/api/v1/notification";

  static async getUserNotifications(
    page: number = 0,
    size: number = 10
  ): Promise<any> {
    try {
      const params = { page, size };
      const response = await getTableData(this.NOTIFICATION_BASE_URL, params);

      if (!response || !response.data) {
        return { data: [], totalCount: 0 };
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: string): Promise<any> {
    try {
      const response = await deleteWithParams(
        `${this.DELETE_NOTIFICATION_URL}/${notificationId}`
      );

      if (!response) {
        throw new Error("Failed to delete notification");
      }

      return response;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  static async deleteAllNotifications(notificationIds: string[]): Promise<any> {
    try {
      const deletePromises = notificationIds.map((id) =>
        this.deleteNotification(id)
      );

      const results = await Promise.allSettled(deletePromises);

      return {
        success: results.filter((r) => r.status === "fulfilled").length,
        failed: results.filter((r) => r.status === "rejected").length,
      };
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      throw error;
    }
  }
}
