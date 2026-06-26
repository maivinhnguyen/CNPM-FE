import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuthStore } from "@/stores/auth-store";
import { cardService } from "@/services/card.service";
import type { Wallet, WalletTransaction, WalletPaymentMethod } from "@/types";

interface BackendTransaction {
  id: string;
  cardUid: string;
  amount: number;
  type: "deposit" | "parking_fee" | "monthly_pass";
  paymentMethod?: string;
  sessionId?: number;
  createdAt: string;
}

export const walletService = {
  // Get wallet for user
  getWallet: async (userId: string): Promise<Wallet> => {
    const user = useAuthStore.getState().user;
    if (!user || !user.memberId) {
      return { userId, balance: 0, transactions: [] };
    }

    try {
      const cards = await cardService.getCardsByMember(user.memberId);
      let totalBalance = 0;
      const allTx: WalletTransaction[] = [];

      for (const card of cards) {
        totalBalance += card.balance;
        try {
          const txs = await apiClient.get<BackendTransaction[]>(
            ENDPOINTS.PAYMENT.TRANSACTIONS(card.cardUid)
          );
          txs.forEach((t) => {
            const desc = t.type === "deposit"
              ? `Nạp tiền vào thẻ ${t.cardUid}`
              : t.type === "monthly_pass"
                ? `Đăng ký vé tháng (Thẻ ${t.cardUid})`
                : `Thanh toán phí gửi xe (Thẻ ${t.cardUid})`;
            allTx.push({
              id: t.id,
              userId,
              type: t.type === "deposit" ? "topup" : "payment",
              amount: t.type === "deposit" ? t.amount : -t.amount,
              description: desc,
              method: (t.paymentMethod as WalletPaymentMethod) || "bank_qr",
              status: "completed",
              createdAt: t.createdAt,
            });
          });
        } catch (e) {
          console.error(`Failed to get transactions for card ${card.cardUid}:`, e);
        }
      }

      // Sort transactions by date descending
      allTx.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        userId,
        balance: totalBalance,
        transactions: allTx,
      };
    } catch (e) {
      console.error("Failed to fetch wallet:", e);
      return { userId, balance: 0, transactions: [] };
    }
  },

  // Top up wallet
  topUp: async (
    userId: string,
    amount: number
  ): Promise<Wallet> => {
    const user = useAuthStore.getState().user;
    if (!user || !user.memberId) {
      throw new Error("Tài khoản chưa liên kết thông tin thành viên.");
    }

    const cards = await cardService.getCardsByMember(user.memberId);
    if (!cards || cards.length === 0) {
      throw new Error("Không tìm thấy thẻ RFID nào hoạt động để nạp tiền.");
    }

    const cardToDeposit = cards[0];
    await apiClient.post(ENDPOINTS.PAYMENT.DEPOSIT(cardToDeposit.cardUid), {
      amount,
    });

    return walletService.getWallet(userId);
  },

};
