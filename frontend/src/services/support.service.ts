import { mockSupportTickets, delay } from "@/mock/data";
import type { SupportTicket, TicketCategory } from "@/types";

class SupportService {
  private tickets: SupportTicket[] = [...mockSupportTickets];

  async getMyTickets(userId: string): Promise<SupportTicket[]> {
    await delay(300);
    return this.tickets
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTicket(userId: string, userName: string, category: TicketCategory, subject: string, description: string): Promise<SupportTicket> {
    await delay(500);
    const newTicket: SupportTicket = {
      id: "st" + Date.now(),
      userId,
      userName,
      category,
      subject,
      description,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: []
    };
    this.tickets.unshift(newTicket);
    return newTicket;
  }
}

export const supportService = new SupportService();
