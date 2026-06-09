import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Vehicle, VehicleCreateData } from "@/types";

export const vehicleService = {
  async getMyVehicles(ownerId: string): Promise<Vehicle[]> {
    const res = await apiClient.get<Vehicle[] | null>(ENDPOINTS.VEHICLES.MINE);
    return res ?? [];
  },

  async getAllVehicles(): Promise<Vehicle[]> {
    const res = await apiClient.get<Vehicle[] | null>(ENDPOINTS.VEHICLES.LIST);
    return res ?? [];
  },

  async addVehicle(ownerId: string, ownerName: string, data: VehicleCreateData): Promise<Vehicle> {
    return apiClient.post<Vehicle>(ENDPOINTS.VEHICLES.CREATE, {
      licensePlate: data.licensePlate,
      brand: data.brand,
      model: data.model,
      color: data.color,
    });
  },

  async removeVehicle(vehicleId: string): Promise<void> {
    return apiClient.delete(ENDPOINTS.VEHICLES.DELETE(vehicleId));
  },

  async lookupByPlate(licensePlate: string): Promise<Vehicle | null> {
    try {
      const formattedPlate = licensePlate.replace(/[-\s]/g, "");
      return await apiClient.get<Vehicle>(ENDPOINTS.VEHICLES.BY_PLATE(formattedPlate));
    } catch (e) {
      console.error(`Failed to look up vehicle by plate ${licensePlate}:`, e);
      return null;
    }
  },
};
