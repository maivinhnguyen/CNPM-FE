import type { Vehicle, VehicleCreateData } from "@/types";
import { mockVehicles, delay } from "@/mock/data";

let vehicles = [...mockVehicles];

export const vehicleService = {
  async getMyVehicles(ownerId: string): Promise<Vehicle[]> {
    await delay(500);
    return vehicles.filter((v) => v.ownerId === ownerId && v.isActive);
  },

  async getAllVehicles(): Promise<Vehicle[]> {
    await delay(500);
    return [...vehicles];
  },

  async addVehicle(ownerId: string, ownerName: string, data: VehicleCreateData): Promise<Vehicle> {
    await delay(600);

    const exists = vehicles.find(
      (v) => v.licensePlate === data.licensePlate && v.isActive
    );
    if (exists) {
      throw new Error("Vehicle with this license plate is already registered");
    }

    const newVehicle: Vehicle = {
      id: `v${Date.now()}`,
      ...data,
      ownerId,  
      ownerName,
      registeredAt: new Date().toISOString(),
      isActive: true,
    };

    vehicles.push(newVehicle);
    return newVehicle;
  },

  async removeVehicle(vehicleId: string): Promise<void> {
    await delay(400);
    vehicles = vehicles.map((v) =>
      v.id === vehicleId ? { ...v, isActive: false } : v
    );
  },

  async lookupByPlate(licensePlate: string): Promise<Vehicle | null> {
    await delay(300);
    return (
      vehicles.find(
        (v) =>
          v.licensePlate.replace(/[-\s]/g, "").toLowerCase() ===
            licensePlate.replace(/[-\s]/g, "").toLowerCase() && v.isActive
      ) || null
    );
  },
};
