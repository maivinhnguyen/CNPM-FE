import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ParkingLot, ParkingLotStatus, ParkingLotType } from "@/types";

export const parkingLotService = {
  getAll: async (): Promise<ParkingLot[]> => {
    const res = await apiClient.get<ParkingLot[] | null>(ENDPOINTS.PARKING_LOTS.LIST);
    return res ?? [];
  },

  getById: async (id: string): Promise<ParkingLot | null> => {
    try {
      return await apiClient.get<ParkingLot>(ENDPOINTS.PARKING_LOTS.BY_ID(id));
    } catch (e) {
      console.error(`Failed to get parking lot by ID ${id}:`, e);
      return null;
    }
  },

  create: async (
    data: Omit<ParkingLot, "id" | "currentOccupancy" | "createdAt" | "updatedAt">
  ): Promise<ParkingLot> => {
    return apiClient.post<ParkingLot>(ENDPOINTS.PARKING_LOTS.CREATE, data);
  },

  update: async (id: string, data: Partial<ParkingLot>): Promise<ParkingLot> => {
    return apiClient.put<ParkingLot>(ENDPOINTS.PARKING_LOTS.UPDATE(id), data);
  },

  updateStatus: async (id: string, status: ParkingLotStatus): Promise<ParkingLot> => {
    return parkingLotService.update(id, { status });
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.PARKING_LOTS.DELETE(id));
  },

  getSummary: async () => {
    try {
      const lots = await parkingLotService.getAll();
      const total = lots.reduce((a, l) => a + l.totalCapacity, 0);
      const occupied = lots.reduce((a, l) => a + l.currentOccupancy, 0);
      return {
        totalLots: lots.length,
        activeLots: lots.filter((l) => l.status === "active").length,
        totalCapacity: total,
        currentOccupancy: occupied,
        occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      };
    } catch (e) {
      return {
        totalLots: 0,
        activeLots: 0,
        totalCapacity: 0,
        currentOccupancy: 0,
        occupancyRate: 0,
      };
    }
  },
};
