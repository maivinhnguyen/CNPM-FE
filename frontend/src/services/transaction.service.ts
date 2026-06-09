import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import { cardService } from "@/services/card.service";
import type { Transaction, Member } from "@/types";

interface BackendTransaction {
  id: string;
  cardUid: string;
  amount: number;
  type: "deposit" | "parking_fee";
  paymentMethod?: string;
  sessionId?: number;
  createdAt: string;
}

export const transactionService = {
  getAll: async (): Promise<Transaction[]> => {
    try {
      const members = await apiClient.get<Member[] | null>(ENDPOINTS.MEMBERS.LIST);
      const allTransactions: Transaction[] = [];

      await Promise.all(
        (members ?? []).map(async (m) => {
          try {
            const cards = await cardService.getCardsByMember(m.id);
            for (const card of cards) {
              try {
                const txs = await apiClient.get<BackendTransaction[] | null>(
                  ENDPOINTS.PAYMENT.TRANSACTIONS(card.cardUid)
                );
                (txs ?? []).forEach((t) => {
                  allTransactions.push({
                    id: t.id,
                    amount: t.amount,
                    type: t.type === "deposit" ? "subscription" : "parking_fee", // Map deposit to subscription/topup for UI compatibility
                    status: "success",
                    paymentMethod: (t.paymentMethod as any) || "rfid_card",
                    description: t.type === "deposit" 
                      ? `Nạp tiền vào thẻ ${t.cardUid}` 
                      : `Phí gửi xe theo lượt (Thẻ ${t.cardUid})`,
                    userName: m.fullName,
                    createdAt: t.createdAt,
                  });
                });
              } catch (e) {
                // ignore
              }
            }
          } catch (e) {
            // ignore
          }
        })
      );

      return allTransactions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (e) {
      console.error("Failed to fetch all transactions:", e);
      return [];
    }
  },

  getSummary: async () => {
    try {
      const txs = await transactionService.getAll();
      const successTxs = txs.filter((t) => t.status === "success");
      const totalRevenue = successTxs.reduce((sum, t) => sum + t.amount, 0);
      const parkingFees = successTxs
        .filter((t) => t.type === "parking_fee")
        .reduce((sum, t) => sum + t.amount, 0);
      const subscriptionFees = successTxs
        .filter((t) => t.type === "subscription")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        totalRevenue,
        parkingFees,
        subscriptionFees,
        totalTransactions: txs.length,
        successCount: successTxs.length,
      };
    } catch (e) {
      return {
        totalRevenue: 0,
        parkingFees: 0,
        subscriptionFees: 0,
        totalTransactions: 0,
        successCount: 0,
      };
    }
  },
};
