import type { User, Vehicle, ParkingSession, ParkingStats, HourlyData, DailyData } from "@/types";

// ── Mock Users ──────────────────────────────────────────────
export const mockUsers: User[] = [
  {
    id: "u1",
    email: "student@university.edu.vn",
    name: "Nguyen Van An",
    role: "student",
    studentId: "SV20210001",
    createdAt: "2024-09-01T08:00:00Z",
  },
  {
    id: "u2",
    email: "guard@parksmart.vn",
    name: "Tran Thi Binh",
    role: "staff",
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "u3",
    email: "admin@parksmart.vn",
    name: "Le Minh Chau",
    role: "admin",
    createdAt: "2023-06-01T08:00:00Z",
  },
  {
    id: "u4",
    email: "student2@university.edu.vn",
    name: "Pham Duc Huy",
    role: "student",
    studentId: "SV20210042",
    createdAt: "2024-09-01T08:00:00Z",
  },
  {
    id: "u5",
    email: "student3@university.edu.vn",
    name: "Vo Thi Mai",
    role: "student",
    studentId: "SV20220015",
    createdAt: "2024-09-01T08:00:00Z",
  },
];

// ── Mock Vehicles ───────────────────────────────────────────
export const mockVehicles: Vehicle[] = [
  {
    id: "v1",
    licensePlate: "59F1-12345",
    brand: "Honda",
    model: "Wave Alpha",
    color: "Red",
    ownerId: "u1",
    ownerName: "Nguyen Van An",
    ownerStudentId: "SV20210001",
    registeredAt: "2024-09-05T10:00:00Z",
    isActive: true,
  },
  {
    id: "v2",
    licensePlate: "59C2-67890",
    brand: "Yamaha",
    model: "Exciter 155",
    color: "Blue",
    ownerId: "u1",
    ownerName: "Nguyen Van An",
    ownerStudentId: "SV20210001",
    registeredAt: "2024-10-01T14:00:00Z",
    isActive: true,
  },
  {
    id: "v3",
    licensePlate: "51D3-11111",
    brand: "Honda",
    model: "Vision",
    color: "White",
    ownerId: "u4",
    ownerName: "Pham Duc Huy",
    ownerStudentId: "SV20210042",
    registeredAt: "2024-09-10T09:00:00Z",
    isActive: true,
  },
  {
    id: "v4",
    licensePlate: "59E1-22222",
    brand: "Honda",
    model: "Air Blade",
    color: "Black",
    ownerId: "u5",
    ownerName: "Vo Thi Mai",
    ownerStudentId: "SV20220015",
    registeredAt: "2024-09-12T11:00:00Z",
    isActive: true,
  },
  {
    id: "v5",
    licensePlate: "59G1-33333",
    brand: "Yamaha",
    model: "NVX 155",
    color: "Gray",
    ownerId: "u4",
    ownerName: "Pham Duc Huy",
    ownerStudentId: "SV20210042",
    registeredAt: "2024-11-01T08:30:00Z",
    isActive: false,
  },
];

// ── Mock Parking Sessions ───────────────────────────────────
export const mockParkingSessions: ParkingSession[] = [
  {
    id: 1,
    cardUid: "CARD-001",
    plateIn: "59F1-12345",
    imgPlateInPath: "/uploads/sessions/1/plate_in.jpg",
    imgPersonInPath: "/uploads/sessions/1/person_in.jpg",
    checkInTime: "2026-04-10T07:15:00Z",
    status: "ongoing",
  },
  {
    id: 2,
    cardUid: "CARD-003",
    plateIn: "51D3-11111",
    imgPlateInPath: "/uploads/sessions/2/plate_in.jpg",
    imgPersonInPath: "/uploads/sessions/2/person_in.jpg",
    checkInTime: "2026-04-10T07:30:00Z",
    plateOut: "51D3-11111",
    imgPlateOutPath: "/uploads/sessions/2/plate_out.jpg",
    imgPersonOutPath: "/uploads/sessions/2/person_out.jpg",
    checkOutTime: "2026-04-10T11:45:00Z",
    status: "completed",
  },
  {
    id: 3,
    cardUid: "CARD-004",
    plateIn: "59E1-22222",
    imgPlateInPath: "/uploads/sessions/3/plate_in.jpg",
    imgPersonInPath: "/uploads/sessions/3/person_in.jpg",
    checkInTime: "2026-04-10T08:00:00Z",
    status: "ongoing",
  },
  {
    id: 4,
    cardUid: "CARD-002",
    plateIn: "59C2-67890",
    imgPlateInPath: "/uploads/sessions/4/plate_in.jpg",
    imgPersonInPath: "/uploads/sessions/4/person_in.jpg",
    checkInTime: "2026-04-09T07:00:00Z",
    plateOut: "59C2-67890",
    imgPlateOutPath: "/uploads/sessions/4/plate_out.jpg",
    imgPersonOutPath: "/uploads/sessions/4/person_out.jpg",
    checkOutTime: "2026-04-09T17:30:00Z",
    status: "completed",
  },
  {
    id: 5,
    cardUid: "CARD-001",
    plateIn: "59F1-12345",
    imgPlateInPath: "/uploads/sessions/5/plate_in.jpg",
    imgPersonInPath: "/uploads/sessions/5/person_in.jpg",
    checkInTime: "2026-04-08T06:45:00Z",
    plateOut: "59F1-12345",
    imgPlateOutPath: "/uploads/sessions/5/plate_out.jpg",
    imgPersonOutPath: "/uploads/sessions/5/person_out.jpg",
    checkOutTime: "2026-04-08T12:00:00Z",
    status: "completed",
  },
  {
    id: 6,
    cardUid: "CARD-003",
    plateIn: "51D3-11111",
    imgPlateInPath: "/uploads/sessions/6/plate_in.jpg",
    imgPersonInPath: "/uploads/sessions/6/person_in.jpg",
    checkInTime: "2026-04-08T08:15:00Z",
    plateOut: "51D3-11111",
    imgPlateOutPath: "/uploads/sessions/6/plate_out.jpg",
    imgPersonOutPath: "/uploads/sessions/6/person_out.jpg",
    checkOutTime: "2026-04-08T16:00:00Z",
    status: "completed",
  },
];

// ── Mock Stats ──────────────────────────────────────────────
export const mockParkingStats: ParkingStats = {
  totalToday: 247,
  currentOccupancy: 183,
  totalCapacity: 500,
  occupancyRate: 36.6,
  peakHour: "07:00 - 08:00",
  averageDuration: "4h 32m",
};

export const mockHourlyData: HourlyData[] = [
  { hour: "06:00", checkIns: 12, checkOuts: 2 },
  { hour: "07:00", checkIns: 78, checkOuts: 5 },
  { hour: "08:00", checkIns: 45, checkOuts: 8 },
  { hour: "09:00", checkIns: 32, checkOuts: 12 },
  { hour: "10:00", checkIns: 18, checkOuts: 15 },
  { hour: "11:00", checkIns: 22, checkOuts: 45 },
  { hour: "12:00", checkIns: 15, checkOuts: 38 },
  { hour: "13:00", checkIns: 28, checkOuts: 12 },
  { hour: "14:00", checkIns: 10, checkOuts: 8 },
  { hour: "15:00", checkIns: 8, checkOuts: 22 },
  { hour: "16:00", checkIns: 5, checkOuts: 55 },
  { hour: "17:00", checkIns: 3, checkOuts: 68 },
  { hour: "18:00", checkIns: 2, checkOuts: 25 },
];

export const mockDailyData: DailyData[] = [
  { date: "Apr 4", total: 210 },
  { date: "Apr 5", total: 195 },
  { date: "Apr 6", total: 45 },
  { date: "Apr 7", total: 38 },
  { date: "Apr 8", total: 225 },
  { date: "Apr 9", total: 238 },
  { date: "Apr 10", total: 247 },
];

// ── Helper: simulate network delay ─────────────────────────
export function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
