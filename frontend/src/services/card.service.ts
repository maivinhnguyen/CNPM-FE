import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { CardRequest, CardRequestStatus, Card } from "@/types";

export const cardService = {
  // Student: get my current card request
  getMyCardRequest: async (): Promise<CardRequest | null> => {
    try {
      const requests = await apiClient.get<CardRequest[]>(ENDPOINTS.CARD_REQUESTS.MINE);
      if (!requests || requests.length === 0) return null;
      
      const sorted = requests.sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      return sorted[0] ?? null;
    } catch (e) {
      console.error("Failed to get my card request:", e);
      return null;
    }
  },

  // Student: submit a new card registration request
  submitCardRequest: async (
    data: Omit<CardRequest, "id" | "status" | "submittedAt">
  ): Promise<CardRequest> => {
    return apiClient.post<CardRequest>(ENDPOINTS.CARD_REQUESTS.CREATE, {
      vehiclePlate: data.vehiclePlate,
      vehicleBrand: data.vehicleBrand,
      vehicleModel: data.vehicleModel,
      vehicleColor: data.vehicleColor,
      idCardNumber: data.idCardNumber,
      note: data.note,
    });
  },

  // Admin: get all card requests with optional status filter
  getAllCardRequests: async (
    status?: CardRequestStatus | "all"
  ): Promise<CardRequest[]> => {
    const params = status && status !== "all" ? { status } : undefined;
    const res = await apiClient.get<CardRequest[] | null>(ENDPOINTS.CARD_REQUESTS.LIST, { params });
    return res ?? [];
  },

  // Admin: get pending count
  getPendingCount: async (): Promise<number> => {
    try {
      const pending = await cardService.getAllCardRequests("pending");
      return pending.length;
    } catch {
      return 0;
    }
  },

  // Admin: approve a card request
  approveCardRequest: async (
    id: string
  ): Promise<CardRequest> => {
    const cardUid = `CARD-${String(Date.now()).slice(-4)}`;
    return apiClient.post<CardRequest>(ENDPOINTS.CARD_REQUESTS.APPROVE(id), { cardUid });
  },

  // Admin: reject a card request
  rejectCardRequest: async (
    id: string,
    reason: string
  ): Promise<CardRequest> => {
    return apiClient.post<CardRequest>(ENDPOINTS.CARD_REQUESTS.REJECT(id), { reason });
  },

  reportLostCard: async (id: string): Promise<CardRequest> => {
    return apiClient.post<CardRequest>(ENDPOINTS.CARD_REQUESTS.BLOCK(id));
  },

  // Real Card Management CRUD
  getCard: async (cardUid: string): Promise<Card> => {
    return apiClient.get<Card>(ENDPOINTS.CARDS.BY_UID(cardUid));
  },

  createCard: async (data: Omit<Card, "isInside" | "status" | "balance">): Promise<Card> => {
    return apiClient.post<Card>(ENDPOINTS.CARDS.CREATE, data);
  },

  toggleCard: async (cardUid: string): Promise<Card> => {
    return apiClient.post<Card>(ENDPOINTS.CARDS.TOGGLE(cardUid));
  },

  getCardsByMember: async (memberId: string): Promise<Card[]> => {
    const res = await apiClient.get<Card[] | null>(ENDPOINTS.CARDS.BY_MEMBER(memberId));
    return res ?? [];
  },

  updateCard: async (cardUid: string, data: Partial<Card>): Promise<Card> => {
    return apiClient.put<Card>(ENDPOINTS.CARDS.UPDATE(cardUid), data);
  },

  deleteCard: async (cardUid: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.CARDS.DELETE(cardUid));
  },
};
