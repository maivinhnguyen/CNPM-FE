import type { CardRequest, CardRequestStatus } from "@/types";
import {
  mockCardRequests,
  delay,
} from "@/mock/data";

// In-memory store for optimistic updates in mock
let _cardRequests: CardRequest[] = [...mockCardRequests];

export const cardService = {
  // Student: get my current card request
  getMyCardRequest: async (userId: string): Promise<CardRequest | null> => {
    await delay(400);
    // Return the most recent request for this user
    const userRequests = _cardRequests
      .filter((r) => r.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    return userRequests[0] ?? null;
  },

  // Student: submit a new card registration request
  submitCardRequest: async (
    data: Omit<CardRequest, "id" | "status" | "submittedAt">
  ): Promise<CardRequest> => {
    await delay(600);
    const newRequest: CardRequest = {
      ...data,
      id: `cr${Date.now()}`,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    _cardRequests = [newRequest, ..._cardRequests];
    return newRequest;
  },

  // Admin: get all card requests with optional status filter
  getAllCardRequests: async (
    status?: CardRequestStatus | "all"
  ): Promise<CardRequest[]> => {
    await delay(500);
    if (!status || status === "all") return [..._cardRequests];
    return _cardRequests.filter((r) => r.status === status);
  },

  // Admin: get pending count
  getPendingCount: async (): Promise<number> => {
    await delay(200);
    return _cardRequests.filter((r) => r.status === "pending").length;
  },

  // Admin: approve a card request
  approveCardRequest: async (
    id: string,
    reviewedBy: string
  ): Promise<CardRequest> => {
    await delay(600);
    const idx = _cardRequests.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Request not found");
    const cardUid = `CARD-${String(Date.now()).slice(-4)}`;
    _cardRequests[idx] = {
      ..._cardRequests[idx],
      status: "approved",
      cardUid,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
    };
    return _cardRequests[idx];
  },

  // Admin: reject a card request
  rejectCardRequest: async (
    id: string,
    reason: string,
    reviewedBy: string
  ): Promise<CardRequest> => {
    await delay(600);
    const idx = _cardRequests.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Request not found");
    _cardRequests[idx] = {
      ..._cardRequests[idx],
      status: "rejected",
      rejectedReason: reason,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
    };
    return _cardRequests[idx];
  },

  reportLostCard: async (id: string) => {
    await delay();
    const idx = _cardRequests.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Request not found");
    _cardRequests[idx] = {
      ..._cardRequests[idx],
      status: "blocked",
      note: "Thẻ đã báo mất khẩn cấp",
    };
    return _cardRequests[idx];
  },
};
