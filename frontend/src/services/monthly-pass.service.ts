import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import { cardService } from "@/services/card.service";
import { useAuthStore } from "@/stores/auth-store";
import type { MonthlyPass } from "@/types";

export const monthlyPassService = {
  getMonthlyPasses: async (): Promise<MonthlyPass[]> => {
    const res = await apiClient.get<MonthlyPass[] | null>(ENDPOINTS.MONTHLY_PASS.LIST);
    return res ?? [];
  },

  registerMonthlyPass: async (
    vehicleId: string,
    vehiclePlate: string,
    vehicleBrand: string,
    month: string,
  ): Promise<MonthlyPass> => {
    const user = useAuthStore.getState().user;
    if (!user || !user.memberId) {
      throw new Error("Tài khoản chưa liên kết thông tin thành viên.");
    }

    const cards = await cardService.getCardsByMember(user.memberId);
    if (!cards || cards.length === 0) {
      throw new Error("Không tìm thấy thẻ RFID nào hoạt động.");
    }

    const PRICE = 150_000;
    const totalBalance = cards.reduce((sum, c) => sum + c.balance, 0);
    if (totalBalance < PRICE) {
      throw new Error("Số dư không đủ. Vui lòng nạp thêm tiền.");
    }

    const targetCard = cards.find((c) => c.balance >= PRICE) ?? cards[0];
    await apiClient.post(ENDPOINTS.PAYMENT.WITHDRAW(targetCard.cardUid), {
      amount: PRICE,
      type: "monthly_pass",
    });

    const [year, mo] = month.split("-").map(Number);
    const startDate = new Date(year, mo - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, mo, 0, 23, 59, 59).toISOString().split("T")[0];

    return apiClient.post<MonthlyPass>(ENDPOINTS.MONTHLY_PASS.CREATE, {
      vehicleId,
      vehiclePlate,
      vehicleBrand,
      month,
      startDate,
      endDate,
      price: PRICE,
    });
  },

  toggleAutoRenew: async (id: string): Promise<MonthlyPass> => {
    return apiClient.post<MonthlyPass>(ENDPOINTS.MONTHLY_PASS.TOGGLE_AUTO_RENEW(id));
  },
};
