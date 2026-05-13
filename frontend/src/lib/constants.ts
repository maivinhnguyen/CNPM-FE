export const APP_NAME = "ParkSmart";
export const APP_DESCRIPTION = "Smart Motorbike Parking Management System";

export const PARKING_CAPACITY = 500;

export const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  staff: "Parking Staff",
  admin: "Administrator",
};

export const PARKING_STATUS_LABELS: Record<string, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  not_parked: "Not Parked",
};

export const PARKING_STATUS_COLORS: Record<string, string> = {
  ongoing: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  completed: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
  not_parked: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

export const CARD_REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export const CARD_REQUEST_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export const MONTHLY_PASS_STATUS_LABELS: Record<string, string> = {
  active: "Đang hiệu lực",
  expired: "Hết hạn",
  pending: "Chờ xử lý",
};

export const MONTHLY_PASS_STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  expired: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  topup: "Nạp tiền",
  payment: "Thanh toán",
  refund: "Hoàn tiền",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_qr: "QR Ngân hàng",
  cash: "Tiền mặt",
  momo: "MoMo",
};

export const MONTHLY_PASS_PRICE = 150_000; // VND per month

export const TOPUP_PRESETS = [50_000, 100_000, 200_000, 500_000];

export const ROUTES = {
  login: "/login",
  register: "/register",
  student: {
    dashboard: "/student",
    vehicles: "/student/vehicles",
    history: "/student/history",
    card: "/student/card",
    monthlyPass: "/student/monthly-pass",
    wallet: "/student/wallet",
  },
  staff: {
    dashboard: "/staff",
    logs: "/staff/logs",
  },
  admin: {
    dashboard: "/admin",
    users: "/admin/users",
    vehicles: "/admin/vehicles",
    logs: "/admin/logs",
    cardRequests: "/admin/card-requests",
    shifts: "/admin/shifts",
  },
} as const;

export const DEFAULT_PAGE_SIZE = 10;

export const SHIFT_TYPE_LABELS: Record<string, string> = {
  morning: "Ca Sáng",
  afternoon: "Ca Chiều",
  evening: "Ca Tối",
  night: "Ca Đêm",
};

export const SHIFT_TYPE_COLORS: Record<string, string> = {
  morning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  afternoon: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  evening: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  night: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
};

export const SHIFT_STATUS_LABELS: Record<string, string> = {
  scheduled: "Đã lên lịch",
  active: "Đang hoạt động",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const SHIFT_STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  completed: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
  cancelled: "bg-red-500/15 text-red-700 dark:text-red-400",
};
