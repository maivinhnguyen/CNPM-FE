import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { SupportTicket, TicketCategory, TicketStatus } from "@/types";

export const supportService = {
  getMyTickets: async (userId: string): Promise<SupportTicket[]> => {
    const res = await apiClient.get<SupportTicket[] | null>(ENDPOINTS.SUPPORT.MINE);
    return res ?? [];
  },

  createTicket: async (
    userId: string,
    userName: string,
    category: TicketCategory,
    subject: string,
    description: string
  ): Promise<SupportTicket> => {
    return apiClient.post<SupportTicket>(ENDPOINTS.SUPPORT.CREATE, {
      category,
      subject,
      description,
    });
  },

  getTicketById: async (id: string): Promise<SupportTicket> => {
    return apiClient.get<SupportTicket>(ENDPOINTS.SUPPORT.BY_ID(id));
  },

  addResponse: async (id: string, message: string): Promise<SupportTicket> => {
    return apiClient.post<SupportTicket>(ENDPOINTS.SUPPORT.RESPONSES(id), { message });
  },

  getAllTickets: async (): Promise<SupportTicket[]> => {
    const res = await apiClient.get<SupportTicket[] | null>(ENDPOINTS.SUPPORT.LIST);
    return res ?? [];
  },

  updateStatus: async (id: string, status: TicketStatus): Promise<SupportTicket> => {
    return apiClient.put<SupportTicket>(ENDPOINTS.SUPPORT.UPDATE_STATUS(id), { status });
  },
};
