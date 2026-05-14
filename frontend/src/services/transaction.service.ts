import type { Transaction } from "@/types";
import { delay } from "@/mock/data";

let _transactions: Transaction[] = [
  {
    id: "tx1",
    amount: 5000,
    type: "parking_fee",
    status: "success",
    paymentMethod: "rfid_card",
    description: "Phí gửi xe theo lượt (xe máy)",
    vehiclePlate: "59F1-12345",
    userName: "Nguyễn Văn A",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: "tx2",
    amount: 150000,
    type: "subscription",
    status: "success",
    paymentMethod: "bank_transfer",
    description: "Đăng ký vé tháng (Tháng 6/2026)",
    vehiclePlate: "51D3-11111",
    userName: "Trần Thị B",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "tx3",
    amount: 5000,
    type: "parking_fee",
    status: "failed",
    paymentMethod: "e_wallet",
    description: "Phí gửi xe theo lượt (xe máy)",
    vehiclePlate: "59E1-22222",
    userName: "Lê Văn C",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: "tx4",
    amount: 50000,
    type: "penalty",
    status: "pending",
    paymentMethod: "cash",
    description: "Phí phạt làm mất thẻ giữ xe",
    userName: "Phạm Thị D",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "tx5",
    amount: 300000,
    type: "subscription",
    status: "success",
    paymentMethod: "e_wallet",
    description: "Gia hạn vé tháng (Tháng 6, 7/2026)",
    vehiclePlate: "59F1-12345",
    userName: "Nguyễn Văn A",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];

export const transactionService = {
  getAll: async (): Promise<Transaction[]> => {
    await delay(400);
    return [..._transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getSummary: async () => {
    await delay(200);
    const successTxs = _transactions.filter((t) => t.status === "success");
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
      totalTransactions: _transactions.length,
      successCount: successTxs.length,
    };
  },
};
