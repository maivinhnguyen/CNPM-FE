import type { Incident, IncidentStatus, IncidentType } from "@/types";
import { mockIncidents, mockVehicles, mockUsers, delay } from "@/mock/data";

let _incidents: Incident[] = [...mockIncidents];

export const incidentService = {
  getAll: async (staffId?: string): Promise<Incident[]> => {
    await delay(400);
    const result = staffId
      ? _incidents.filter((i) => i.reportedBy === staffId)
      : [..._incidents];
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  report: async (
    data: Omit<Incident, "id" | "status" | "createdAt">
  ): Promise<Incident> => {
    await delay(500);
    const newIncident: Incident = {
      ...data,
      id: `inc${Date.now()}`,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    _incidents = [newIncident, ..._incidents];
    return newIncident;
  },

  resolve: async (id: string, resolvedNote: string): Promise<Incident> => {
    await delay(400);
    const idx = _incidents.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Không tìm thấy sự cố");
    _incidents[idx] = {
      ..._incidents[idx],
      status: "resolved",
      resolvedAt: new Date().toISOString(),
      resolvedNote,
    };
    return _incidents[idx];
  },

  escalate: async (id: string): Promise<Incident> => {
    await delay(300);
    const idx = _incidents.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Không tìm thấy sự cố");
    _incidents[idx] = { ..._incidents[idx], status: "escalated" };
    return _incidents[idx];
  },

  getOpenCount: async (staffId: string): Promise<number> => {
    await delay(200);
    return _incidents.filter(
      (i) => i.reportedBy === staffId && i.status === "open"
    ).length;
  },

  // Vehicle lookup for staff
  lookupVehicleByPlate: async (plate: string) => {
    await delay(500);
    const normalized = plate.replace(/[-\s]/g, "").toLowerCase();
    const vehicle = mockVehicles.find(
      (v) => v.licensePlate.replace(/[-\s]/g, "").toLowerCase() === normalized
    );
    if (!vehicle) return null;
    const owner = mockUsers.find((u) => u.id === vehicle.ownerId);
    return { vehicle, owner };
  },
};
