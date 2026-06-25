import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { VisitorPass } from "@/types";

export const visitorService = {
  getMyPasses: async (): Promise<VisitorPass[]> => {
    const res = await apiClient.get<VisitorPass[] | null>(ENDPOINTS.VISITOR.MINE);
    return res ?? [];
  },

  createVisitorPass: async (
    userId: string,
    visitorName: string,
    visitorPhone: string,
    vehiclePlate: string,
    validDate: string
  ): Promise<VisitorPass> => {
    return apiClient.post<VisitorPass>(ENDPOINTS.VISITOR.CREATE, {
      visitorName,
      visitorPhone: visitorPhone || undefined,
      vehiclePlate,
      validDate,
    });
  },

  cancelVisitorPass: async (id: string): Promise<void> => {
    return apiClient.post(ENDPOINTS.VISITOR.CANCEL(id));
  },
};
