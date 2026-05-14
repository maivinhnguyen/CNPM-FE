export type SessionStatus = "ongoing" | "completed";

// ── Card Registration ────────────────────────────────────────
export type CardRequestStatus = "pending" | "approved" | "rejected";

export interface CardRequest {
  id: string;
  userId: string;
  userName: string;
  studentId: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleColor: string;
  idCardNumber: string;
  note?: string;
  status: CardRequestStatus;
  cardUid?: string;         // filled when approved
  rejectedReason?: string;  // filled when rejected
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// ── Monthly Pass ─────────────────────────────────────────────
export type MonthlyPassStatus = "active" | "expired" | "pending";

export interface MonthlyPass {
  id: string;
  userId: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleBrand: string;
  month: string;            // "2026-05"
  startDate: string;
  endDate: string;
  price: number;
  status: MonthlyPassStatus;
  purchasedAt: string;
}

// ── Wallet ───────────────────────────────────────────────────
export type TransactionType = "topup" | "payment" | "refund";
export type PaymentMethod = "bank_qr" | "cash" | "momo";

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;           // positive = credit, negative = debit
  description: string;
  method?: PaymentMethod;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  transactions: WalletTransaction[];
}

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

// ── Shift Management ─────────────────────────────────────────
export type ShiftType = "morning" | "afternoon" | "evening" | "night";
export type ShiftStatus = "scheduled" | "active" | "completed" | "cancelled";

export interface WorkShift {
  id: string;
  name: string;
  type: ShiftType;
  startTime: string;    // "06:00"
  endTime: string;      // "14:00"
  date: string;         // "2026-05-14"
  staffIds: string[];
  staffNames: string[];
  status: ShiftStatus;
  notes?: string;
  totalCheckIns?: number;
  totalCheckOuts?: number;
  incidentCount?: number;
}

export interface ShiftAssignment {
  shiftId: string;
  staffId: string;
  staffName: string;
  assignedAt: string;
  assignedBy: string;
}

// ── Incident Report ───────────────────────────────────────
export type IncidentType =
  | "wrong_parking"
  | "damaged_vehicle"
  | "suspicious"
  | "unregistered"
  | "other";

export type IncidentStatus = "open" | "resolved" | "escalated";

export interface Incident {
  id: string;
  reportedBy: string;       // staff userId
  reporterName: string;
  vehiclePlate?: string;
  type: IncidentType;
  description: string;
  location?: string;
  status: IncidentStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedNote?: string;
}

