import type { User, Vehicle, ParkingRecord, ParkingStats, HourlyData, DailyData } from "@/types";

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

// ── Mock Parking Records ────────────────────────────────────
export const mockParkingRecords: ParkingRecord[] = [
  {
    id: "p1",
    vehicleId: "v1",
    licensePlate: "59F1-12345",
    ownerName: "Nguyen Van An",
    ownerStudentId: "SV20210001",
    checkInTime: "2026-04-10T07:15:00Z",
    status: "checked_in",
    staffName: "Tran Thi Binh",
    zone: "A",
    // Stored check-in images for checkout verification comparison
    checkInFaceImage:
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
          <rect width="300" height="300" fill="#0f172a"/>
          <circle cx="150" cy="108" r="56" fill="#334155"/>
          <path d="M60 270 Q60 192 150 192 Q240 192 240 270 Z" fill="#334155"/>
          <rect x="0" y="0" width="300" height="300" fill="none" stroke="#22c55e" stroke-width="2" opacity="0.4"/>
          <rect x="55" y="50" width="190" height="190" fill="none" stroke="#22c55e" stroke-width="1.5" opacity="0.5" rx="4"/>
          <text x="150" y="292" text-anchor="middle" fill="#475569" font-size="9" font-family="monospace">CHECK-IN FACE · 07:15 10/04/2026</text>
        </svg>`
      ),
    checkInPlateImage:
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
          <rect width="400" height="200" fill="#0f172a"/>
          <rect x="40" y="52" width="320" height="96" rx="10" fill="#facc15" stroke="#a16207" stroke-width="4"/>
          <text x="200" y="87" text-anchor="middle" fill="#1c1917" font-size="13" font-family="monospace" font-weight="bold">VIỆT NAM</text>
          <text x="200" y="128" text-anchor="middle" fill="#1c1917" font-size="34" font-family="monospace" font-weight="bold">59F1-12345</text>
          <text x="200" y="188" text-anchor="middle" fill="#475569" font-size="9" font-family="monospace">CHECK-IN PLATE · 07:15 10/04/2026</text>
        </svg>`
      ),
  },
  {
    id: "p2",
    vehicleId: "v3",
    licensePlate: "51D3-11111",
    ownerName: "Pham Duc Huy",
    ownerStudentId: "SV20210042",
    checkInTime: "2026-04-10T07:30:00Z",
    checkOutTime: "2026-04-10T11:45:00Z",
    status: "checked_out",
    staffName: "Tran Thi Binh",
    zone: "B",
  },
  {
    id: "p3",
    vehicleId: "v4",
    licensePlate: "59E1-22222",
    ownerName: "Vo Thi Mai",
    ownerStudentId: "SV20220015",
    checkInTime: "2026-04-10T08:00:00Z",
    status: "checked_in",
    staffName: "Tran Thi Binh",
    zone: "A",
  },
  {
    id: "p4",
    vehicleId: "v2",
    licensePlate: "59C2-67890",
    ownerName: "Nguyen Van An",
    ownerStudentId: "SV20210001",
    checkInTime: "2026-04-09T07:00:00Z",
    checkOutTime: "2026-04-09T17:30:00Z",
    status: "checked_out",
    staffName: "Tran Thi Binh",
    zone: "C",
  },
  {
    id: "p5",
    vehicleId: "v1",
    licensePlate: "59F1-12345",
    ownerName: "Nguyen Van An",
    ownerStudentId: "SV20210001",
    checkInTime: "2026-04-08T06:45:00Z",
    checkOutTime: "2026-04-08T12:00:00Z",
    status: "checked_out",
    staffName: "Tran Thi Binh",
    zone: "A",
  },
  {
    id: "p6",
    vehicleId: "v3",
    licensePlate: "51D3-11111",
    ownerName: "Pham Duc Huy",
    ownerStudentId: "SV20210042",
    checkInTime: "2026-04-08T08:15:00Z",
    checkOutTime: "2026-04-08T16:00:00Z",
    status: "checked_out",
    staffName: "Tran Thi Binh",
    zone: "B",
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
