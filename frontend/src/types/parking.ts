export type ParkingStatus = "checked_in" | "checked_out";

export interface ParkingRecord {
  id: string;
  vehicleId: string;
  licensePlate: string;
  ownerName: string;
  ownerStudentId?: string;
  checkInTime: string;
  checkOutTime?: string;
  status: ParkingStatus;
  staffName: string;
  zone?: string;
  checkInFaceImage?: string;
  checkInPlateImage?: string;
}

export interface ParkingStats {
  totalToday: number;
  currentOccupancy: number;
  totalCapacity: number;
  occupancyRate: number;
  peakHour: string;
  averageDuration: string;
}

export interface HourlyData {
  hour: string;
  checkIns: number;
  checkOuts: number;
}

export interface DailyData {
  date: string;
  total: number;
}

export interface VehicleLookupResult {
  found: boolean;
  vehicle?: {
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    color: string;
    ownerName: string;
    ownerStudentId?: string;
    isRegistered: boolean;
  };
  currentStatus?: ParkingStatus | "not_parked";
  lastRecord?: ParkingRecord;
  checkInImages?: {
    faceImage: string;
    plateImage: string;
  };
}
