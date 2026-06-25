import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import { useAuthStore } from "@/stores/auth-store";
import { cardService } from "@/services/card.service";
import type { Wallet, MonthlyPass, WalletTransaction, WalletPaymentMethod } from "@/types";
import { mockMonthlyPasses, mockWallets, delay } from "@/mock/data";

interface BackendTransaction {
  id: string;
  cardUid: string;
  amount: number;
  type: "deposit" | "parking_fee";
  paymentMethod?: string;
  sessionId?: number;
  createdAt: string;
}

let _monthlyPasses: MonthlyPass[] = [...mockMonthlyPasses];
const _wallets: Wallet[] = mockWallets.map((w) => ({
  ...w,
  transactions: [...w.transactions],
}));

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
            allTx.push({
              id: t.id,
              userId,
              type: t.type === "deposit" ? "topup" : "payment",
              amount: t.type === "deposit" ? t.amount : -t.amount,
              description: t.type === "deposit" 
                ? `Nạp tiền vào thẻ ${t.cardUid}` 
                : `Thanh toán phí gửi xe (Thẻ ${t.cardUid})`,
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

  // Get monthly passes for user
  getMonthlyPasses: async (userId: string): Promise<MonthlyPass[]> => {
    await delay(400);
    return _monthlyPasses
      .filter((p) => p.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
      );
  },

  // Register monthly pass (deducts from wallet)
  registerMonthlyPass: async (
    userId: string,
    vehicleId: string,
    vehiclePlate: string,
    vehicleBrand: string,
    month: string // "2026-06"
  ): Promise<MonthlyPass> => {
    await delay(700);
    const PRICE = 150_000;
    const walletIdx = _wallets.findIndex((w) => w.userId === userId);
    if (walletIdx === -1 || _wallets[walletIdx].balance < PRICE) {
      throw new Error("Số dư không đủ. Vui lòng nạp thêm tiền.");
    }

    // Parse month to start/end dates
    const [year, mo] = month.split("-").map(Number);
    const startDate = new Date(year, mo - 1, 1).toISOString();
    const endDate = new Date(year, mo, 0, 23, 59, 59).toISOString();

    const newPass: MonthlyPass = {
      id: `mp${Date.now()}`,
      userId,
      vehicleId,
      vehiclePlate,
      vehicleBrand,
      month,
      startDate,
      endDate,
      price: PRICE,
      status: "active",
      purchasedAt: new Date().toISOString(),
    };

    const tx: WalletTransaction = {
      id: `tx${Date.now()}`,
      userId,
      type: "payment",
      amount: -PRICE,
      description: `Đăng ký vé tháng ${mo}/${year} - ${vehiclePlate}`,
      status: "completed",
      createdAt: new Date().toISOString(),
    };

    _monthlyPasses = [newPass, ..._monthlyPasses];
    _wallets[walletIdx] = {
      ..._wallets[walletIdx],
      balance: _wallets[walletIdx].balance - PRICE,
      transactions: [tx, ..._wallets[walletIdx].transactions],
    };

    return newPass;
  },

  // Toggle auto-renew for a pass
  toggleAutoRenew: async (passId: string): Promise<MonthlyPass> => {
    await delay(300);
    const idx = _monthlyPasses.findIndex(p => p.id === passId);
    if (idx === -1) throw new Error("Vé không tồn tại");
    _monthlyPasses[idx] = {
      ..._monthlyPasses[idx],
      isAutoRenew: !_monthlyPasses[idx].isAutoRenew
    };
    return _monthlyPasses[idx];
  },
};
