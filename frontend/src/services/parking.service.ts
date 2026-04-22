import type {
  ParkingRecord,
  ParkingStats,
  HourlyData,
  DailyData,
  VehicleLookupResult,
} from "@/types";
import {
  mockParkingRecords,
  mockParkingStats,
  mockHourlyData,
  mockDailyData,
  mockVehicles,
  delay,
} from "@/mock/data";

let records = [...mockParkingRecords];

export const parkingService = {
  async getStats(): Promise<ParkingStats> {
    await delay(400);
    return { ...mockParkingStats };
  },

  async getHourlyData(): Promise<HourlyData[]> {
    await delay(400);
    return [...mockHourlyData];
  },

  async getDailyData(): Promise<DailyData[]> {
    await delay(400);
    return [...mockDailyData];
  },

  async getRecords(userId?: string): Promise<ParkingRecord[]> {
    await delay(500);
    if (userId) {
      const userVehicleIds = mockVehicles
        .filter((v) => v.ownerId === userId)
        .map((v) => v.id);
      return records.filter((r) => userVehicleIds.includes(r.vehicleId));
    }
    return [...records];
  },

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

    const activeRecord = records.find(
      (r) => r.vehicleId === vehicle.id && r.status === "checked_in"
    );

    // If vehicle is checked in, include stored images for checkout comparison
    const checkInImages =
      activeRecord?.checkInFaceImage && activeRecord?.checkInPlateImage
        ? {
            faceImage: activeRecord.checkInFaceImage,
            plateImage: activeRecord.checkInPlateImage,
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
      currentStatus: activeRecord ? "checked_in" : "not_parked",
      lastRecord: activeRecord,
      checkInImages,
    };
  },

  async checkIn(
    vehicleId: string,
    licensePlate: string,
    ownerName: string,
    staffName: string,
    ownerStudentId?: string,
    faceImage?: string,
    plateImage?: string
  ): Promise<ParkingRecord> {
    await delay(500);
    const zones = ["A", "B", "C", "D"];
    const record: ParkingRecord = {
      id: `p${Date.now()}`,
      vehicleId,
      licensePlate,
      ownerName,
      ownerStudentId,
      checkInTime: new Date().toISOString(),
      status: "checked_in",
      staffName,
      zone: zones[Math.floor(Math.random() * zones.length)],
      checkInFaceImage: faceImage,
      checkInPlateImage: plateImage,
    };
    records.unshift(record);
    return record;
  },

  async checkOut(recordId: string): Promise<ParkingRecord> {
    await delay(500);
    const idx = records.findIndex((r) => r.id === recordId);
    if (idx === -1) throw new Error("Record not found");

    records[idx] = {
      ...records[idx],
      checkOutTime: new Date().toISOString(),
      status: "checked_out",
    };

    return records[idx];
  },

  async getCheckInImages(
    recordId: string
  ): Promise<{ faceImage: string; plateImage: string } | null> {
    await delay(200);
    const record = records.find((r) => r.id === recordId);
    if (!record?.checkInFaceImage || !record?.checkInPlateImage) return null;
    return {
      faceImage: record.checkInFaceImage,
      plateImage: record.checkInPlateImage,
    };
  },
};
