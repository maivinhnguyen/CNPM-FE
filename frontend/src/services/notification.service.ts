import { mockNotifications, delay } from "@/mock/data";
import type { AppNotification } from "@/types";

class NotificationService {
  private notifications: AppNotification[] = [...mockNotifications];

  async getMyNotifications(userId: string): Promise<AppNotification[]> {
    await delay(300);
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markAsRead(id: string): Promise<void> {
    await delay(200);
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.notifications[index].isRead = true;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await delay(300);
    this.notifications = this.notifications.map((n) =>
      n.userId === userId ? { ...n, isRead: true } : n
    );
  }
}

export const notificationService = new NotificationService();
