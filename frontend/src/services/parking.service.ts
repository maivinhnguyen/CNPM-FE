import type {
  ParkingSession,
  ParkingStats,
  HourlyData,
  DailyData,
  VehicleLookupResult,
} from "@/types";
import {
  mockParkingSessions,
  mockParkingStats,
  mockHourlyData,
  mockDailyData,
  mockVehicles,
  delay,
} from "@/mock/data";

// In-memory sessions used by mock implementations
const sessions = [...mockParkingSessions];
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";

export const parkingService = {
  // TODO: return apiClient.get<ParkingStats>("/parking/stats");
  async getStats(): Promise<ParkingStats> {
    await delay(400);
    return { ...mockParkingStats };
  },

  // TODO: return apiClient.get<HourlyData[]>("/parking/hourly");
  async getHourlyData(): Promise<HourlyData[]> {
    await delay(400);
    return [...mockHourlyData];
  },

  // TODO: return apiClient.get<DailyData[]>("/parking/daily");
  async getDailyData(): Promise<DailyData[]> {
    await delay(400);
    return [...mockDailyData];
  },

  // TODO: replace with:
  // const params = userId ? { userId } : undefined;
  // return apiClient.get<ParkingSession[]>("/parking/sessions", { params });
  async getSessions(userId?: string): Promise<ParkingSession[]> {
    await delay(500);
    if (userId) {
      const userPlates = mockVehicles
        .filter((v) => v.ownerId === userId)
        .map((v) => v.licensePlate);
      return sessions.filter((s) => s.plateIn && userPlates.includes(s.plateIn));
    }
    return [...sessions];
  },
  // This api is not implemented so keep as mock
  async lookupVehicle(licensePlate: string): Promise<VehicleLookupResult> {
    await delay(300);
    const plate = licensePlate.replace(/[-\s]/g, "").toLowerCase();
    const vehicle = mockVehicles.find(
      (v) =>
        v.licensePlate.replace(/[-\s]/g, "").toLowerCase() === plate &&
        v.isActive
    );

    if (!vehicle) {
      return { found: false };
    }

    const activeSession = sessions.find(
      (s) =>
        s.plateIn?.replace(/[-\s]/g, "").toLowerCase() === plate &&
        s.status === "ongoing"
    );

    const checkInImages =
      activeSession?.imgPlateInPath && activeSession?.imgPersonInPath
        ? {
            plateImage: activeSession.imgPlateInPath,
            personImage: activeSession.imgPersonInPath,
          }
        : undefined;

    return {
      found: true,
      vehicle: {
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        color: vehicle.color,
        ownerName: vehicle.ownerName,
        ownerStudentId: vehicle.ownerStudentId,
        isRegistered: true,
      },
      currentStatus: activeSession ? "ongoing" : "not_parked",
      lastSession: activeSession,
      checkInImages,
    };
  },

  async checkIn(
    cardUid: string,
    imgPlateIn: Blob,
    imgPersonIn: Blob,
  ): Promise<ParkingSession> {
    const form = new FormData();
    form.append("cardUid", cardUid);
    form.append("imgPlateIn", imgPlateIn);
    form.append("imgPersonIn", imgPersonIn);

    return apiClient.post<ParkingSession>(ENDPOINTS.SESSIONS.CHECK_IN, form);
  },

  async checkOut(
    sessionId: number,
    imgPlateOut: Blob,
    imgPersonOut: Blob,
  ): Promise<void> {
    const form = new FormData();
    form.append("imgPlateOut", imgPlateOut);
    form.append("imgPersonOut", imgPersonOut);

    return apiClient.post(ENDPOINTS.SESSIONS.CHECK_OUT(sessionId), form);
  },
};
