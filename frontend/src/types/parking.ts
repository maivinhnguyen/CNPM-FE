export type SessionStatus = "ongoing" | "completed";

// ── Card Registration ────────────────────────────────────────
export type CardRequestStatus = "pending" | "approved" | "rejected" | "blocked";

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

// ── Device Management ──────────────────────────────────────────
export type DeviceType = "camera" | "barrier" | "rfid_reader" | "sensor";
export type DeviceStatus = "online" | "offline" | "warning" | "maintenance";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  locationLabel: string;
  status: DeviceStatus;
  ipAddress?: string;
  lastSeen: string;
  installedAt: string;
  firmwareVersion?: string;
  notes?: string;
  alertCount: number;
}

export interface DeviceAlert {
  id: string;
  deviceId: string;
  deviceName: string;
  message: string;
  severity: "low" | "medium" | "high";
  createdAt: string;
  resolvedAt?: string;
}

// ── Parking Lot (Nhà Xe) ───────────────────────────────────────
export type ParkingLotStatus = "active" | "inactive" | "maintenance";
export type ParkingLotType   = "indoor" | "outdoor" | "multi_level";

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  type: ParkingLotType;
  status: ParkingLotStatus;
  totalCapacity: number;
  currentOccupancy: number;
  openTime: string;       // "06:00"
  closeTime: string;      // "22:00"
  contactPhone?: string;
  managerName?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Transaction (Giao dịch) ────────────────────────────────────
export type TransactionType = "parking_fee" | "subscription" | "penalty";
export type TransactionStatus = "success" | "pending" | "failed";
export type PaymentMethod = "cash" | "bank_transfer" | "e_wallet" | "rfid_card";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  description: string;
  vehiclePlate?: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

// ── Notifications ──────────────────────────────────────────────
export type NotificationType = "info" | "warning" | "success" | "error";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}
