// Payload delivered on the STOMP notification channels. Mirrors the backend
// NotificationDto. Fields are optional where the backend omits them under
// JsonInclude.NON_NULL so the client never assumes a field is present.
export type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ERROR";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH";

export interface RealtimeNotification {
  id?: string;
  title: string;
  message?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  entityId?: string;
  entityName?: string;
  actionUrl?: string | null;
  isRead?: boolean;
  createdAt?: string;
}
