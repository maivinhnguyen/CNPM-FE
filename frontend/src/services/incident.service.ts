import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import { vehicleService } from "@/services/vehicle.service";
import type { Incident } from "@/types";

export const incidentService = {
  getAll: async (staffId?: string): Promise<Incident[]> => {
    const params = staffId ? { staffId } : undefined;
    const res = await apiClient.get<Incident[] | null>(ENDPOINTS.INCIDENTS.LIST, { params });
    return res ?? [];
  },

  report: async (
    data: Omit<Incident, "id" | "status" | "createdAt">
  ): Promise<Incident> => {
    return apiClient.post<Incident>(ENDPOINTS.INCIDENTS.REPORT, {
      vehiclePlate: data.vehiclePlate,
      type: data.type,
      description: data.description,
      location: data.location,
      reporterName: data.reporterName,
    });
  },

  resolve: async (id: string, resolvedNote: string): Promise<Incident> => {
    return apiClient.post<Incident>(ENDPOINTS.INCIDENTS.RESOLVE(id), { note: resolvedNote });
  },

  escalate: async (id: string): Promise<Incident> => {
    return apiClient.post<Incident>(ENDPOINTS.INCIDENTS.ESCALATE(id));
  },

  getOpenCount: async (staffId: string): Promise<number> => {
    try {
      const incs = await incidentService.getAll(staffId);
      return incs.filter((i) => i.status === "open").length;
    } catch {
      return 0;
    }
  },

  // Vehicle lookup for staff
  lookupVehicleByPlate: async (plate: string) => {
    const vehicle = await vehicleService.lookupByPlate(plate);
    if (!vehicle) return null;
    
    try {
      const owner = await apiClient.get<{ id: string; email: string; name: string; memberId?: string; studentId?: string }>(ENDPOINTS.USERS.BY_ID(vehicle.ownerId));
      return { vehicle, owner };
    } catch {
      return { vehicle, owner: { id: vehicle.ownerId, name: vehicle.ownerName, email: "", studentId: "" } };
    }
  },
};
