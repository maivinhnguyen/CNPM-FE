import type { Wallet, MonthlyPass, WalletTransaction, PaymentMethod } from "@/types";
import { mockWallets, mockMonthlyPasses, delay } from "@/mock/data";

// In-memory stores for optimistic updates
let _wallets: Wallet[] = mockWallets.map((w) => ({
  ...w,
  transactions: [...w.transactions],
}));
let _monthlyPasses: MonthlyPass[] = [...mockMonthlyPasses];

export const walletService = {
  // Get wallet for user
  getWallet: async (userId: string): Promise<Wallet> => {
    await delay(400);
    const wallet = _wallets.find((w) => w.userId === userId);
    if (!wallet) {
      // Auto-create empty wallet
      const newWallet: Wallet = { userId, balance: 0, transactions: [] };
      _wallets.push(newWallet);
      return newWallet;
    }
    return { ...wallet, transactions: [...wallet.transactions] };
  },

  // Top up wallet
  topUp: async (
    userId: string,
    amount: number,
    method: PaymentMethod
  ): Promise<Wallet> => {
    await delay(700);
    const idx = _wallets.findIndex((w) => w.userId === userId);
    const methodLabels: Record<PaymentMethod, string> = {
      bank_qr: "QR Ngân hàng",
      cash: "Tiền mặt tại quầy",
      momo: "MoMo",
    };
    const tx: WalletTransaction = {
      id: `tx${Date.now()}`,
      userId,
      type: "topup",
      amount,
      description: `Nạp tiền qua ${methodLabels[method]}`,
      method,
      status: "completed",
      createdAt: new Date().toISOString(),
    };
    if (idx === -1) {
      _wallets.push({ userId, balance: amount, transactions: [tx] });
    } else {
      _wallets[idx] = {
        ..._wallets[idx],
        balance: _wallets[idx].balance + amount,
        transactions: [tx, ..._wallets[idx].transactions],
      };
    }
    return _wallets[idx === -1 ? _wallets.length - 1 : idx];
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
};
