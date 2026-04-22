export type SessionStatus = "ongoing" | "completed";

export interface ParkingSession {
  id: number;
  cardUid: string;
  plateIn?: string;
  imgPlateInPath?: string;
  imgPersonInPath?: string;
  checkInTime: string;
  plateOut?: string;
  imgPlateOutPath?: string;
  imgPersonOutPath?: string;
  checkOutTime?: string;
  status: SessionStatus;
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
  currentStatus?: SessionStatus | "not_parked";
  lastSession?: ParkingSession;
  checkInImages?: {
    plateImage: string;
    personImage: string;
  };
}
