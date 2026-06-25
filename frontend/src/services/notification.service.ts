import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { AppNotification } from "@/types";

export const notificationService = {
  getMyNotifications: async (): Promise<AppNotification[]> => {
    const res = await apiClient.get<AppNotification[] | null>(ENDPOINTS.NOTIFICATIONS.LIST);
    return res ?? [];
  },

  markAsRead: async (id: string): Promise<void> => {
    return apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  markAllAsRead: async (): Promise<void> => {
    return apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },
};
