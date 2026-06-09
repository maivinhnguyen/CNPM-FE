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

import { useAuthStore } from "@/stores/auth-store";
import { cardService } from "@/services/card.service";
import { vehicleService } from "@/services/vehicle.service";
import type { Member, Card, Vehicle } from "@/types";

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

  async getSessions(userId?: string): Promise<ParkingSession[]> {
    if (userId) {
      const user = useAuthStore.getState().user;
      if (!user || !user.memberId) return [];
      
      try {
        const cards = await cardService.getCardsByMember(user.memberId);
        const allSessions: ParkingSession[] = [];
        for (const card of cards) {
          try {
            const cardSessions = await apiClient.get<ParkingSession[]>(
              ENDPOINTS.SESSIONS.BY_CARD(card.cardUid)
            );
            allSessions.push(...cardSessions);
          } catch (e) {
            console.error(`Failed to get sessions for card ${card.cardUid}:`, e);
          }
        }
        return allSessions.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
      } catch (e) {
        console.error("Failed to fetch sessions for student:", e);
        return [];
      }
    } else {
      try {
        const members = await apiClient.get<Member[]>(ENDPOINTS.MEMBERS.LIST);
        const allSessions: ParkingSession[] = [];
        
        await Promise.all(
          members.map(async (m) => {
            try {
              const cards = await cardService.getCardsByMember(m.id);
              for (const card of cards) {
                try {
                  const cardSessions = await apiClient.get<ParkingSession[]>(
                    ENDPOINTS.SESSIONS.BY_CARD(card.cardUid)
                  );
                  allSessions.push(...cardSessions);
                } catch (e) {
                  // ignore
                }
              }
            } catch (e) {
              // ignore
            }
          })
        );
        return allSessions.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
      } catch (e) {
        console.error("Failed to fetch all sessions for admin:", e);
        return [];
      }
    }
  },
  async lookupVehicle(licensePlate: string): Promise<VehicleLookupResult> {
    const formattedPlate = licensePlate.replace(/[-\s]/g, "").toLowerCase();
    
    // 1. Fetch vehicle from backend
    const vehicle = await vehicleService.lookupByPlate(licensePlate);
    if (!vehicle) {
      // Check if there is an ongoing session for this plate under CARD-MOCK (guest)
      try {
        const mockSessions = await apiClient.get<ParkingSession[]>(ENDPOINTS.SESSIONS.BY_CARD("CARD-MOCK"));
        const activeSession = (mockSessions ?? []).find(
          (s) =>
            s.status === "ongoing" &&
            s.plateIn?.replace(/[-\s]/g, "").toLowerCase() === formattedPlate
        );
        if (activeSession) {
          const checkInImages =
            activeSession.imgPlateInPath && activeSession.imgPersonInPath
              ? {
                  plateImage: activeSession.imgPlateInPath,
                  personImage: activeSession.imgPersonInPath,
                }
              : undefined;
          return {
            found: true,
            cardUid: "CARD-MOCK",
            vehicle: {
              id: "guest-" + Date.now(),
              licensePlate: licensePlate.toUpperCase(),
              brand: "Khách vãng lai",
              model: "Khách vãng lai",
              color: "Không xác định",
              ownerName: "Khách Vãng Lai",
              isRegistered: false,
            },
            currentStatus: "ongoing",
            lastSession: activeSession,
            checkInImages,
          };
        }
      } catch (e) {
        console.error("Failed to check guest sessions:", e);
      }
      return { found: false };
    }

    // 2. Fetch owner details
    let ownerName = "Không xác định";
    let ownerStudentId = undefined;
    let cards: Card[] = [];

    try {
      const owner = await apiClient.get<any>(ENDPOINTS.USERS.BY_ID(vehicle.ownerId));
      if (owner && owner.memberId) {
        const member = await apiClient.get<any>(ENDPOINTS.MEMBERS.BY_ID(owner.memberId));
        if (member) {
          ownerName = member.fullName;
          ownerStudentId = member.studentId;
        }
        cards = await cardService.getCardsByMember(owner.memberId);
      } else if (owner) {
        ownerName = owner.email;
      }
    } catch (e) {
      console.error("Failed to fetch owner details:", e);
    }

    // 3. Find active session
    let activeSession: ParkingSession | undefined = undefined;

    // Check member's cards
    for (const card of cards) {
      try {
        const cardSessions = await apiClient.get<ParkingSession[]>(
          ENDPOINTS.SESSIONS.BY_CARD(card.cardUid)
        );
        const ongoing = (cardSessions ?? []).find((s) => s.status === "ongoing");
        if (ongoing) {
          activeSession = ongoing;
          break;
        }
      } catch (e) {
        // ignore
      }
    }

    // Fallback: Check CARD-MOCK for this plate
    if (!activeSession) {
      try {
        const mockSessions = await apiClient.get<ParkingSession[]>(
          ENDPOINTS.SESSIONS.BY_CARD("CARD-MOCK")
        );
        const ongoing = (mockSessions ?? []).find(
          (s) =>
            s.status === "ongoing" &&
            s.plateIn?.replace(/[-\s]/g, "").toLowerCase() === formattedPlate
        );
        if (ongoing) {
          activeSession = ongoing;
        }
      } catch (e) {
        // ignore
      }
    }

    const checkInImages =
      activeSession?.imgPlateInPath && activeSession?.imgPersonInPath
        ? {
            plateImage: activeSession.imgPlateInPath,
            personImage: activeSession.imgPersonInPath,
          }
        : undefined;

    const activeCard = cards.find((c) => c.status === "active") || cards[0];

    return {
      found: true,
      cardUid: activeCard?.cardUid || "CARD-MOCK",
      vehicle: {
        id: vehicle.id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        color: vehicle.color,
        ownerName,
        ownerStudentId,
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
