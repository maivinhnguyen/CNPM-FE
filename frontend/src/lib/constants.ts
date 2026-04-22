export const APP_NAME = "ParkSmart";
export const APP_DESCRIPTION = "Smart Motorbike Parking Management System";

export const PARKING_CAPACITY = 500;

export const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  staff: "Parking Staff",
  admin: "Administrator",
};

export const PARKING_STATUS_LABELS: Record<string, string> = {
  checked_in: "Checked In",
  checked_out: "Checked Out",
  not_parked: "Not Parked",
};

export const PARKING_STATUS_COLORS: Record<string, string> = {
  checked_in: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  checked_out: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
  not_parked: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

export const ROUTES = {
  login: "/login",
  register: "/register",
  student: {
    dashboard: "/student",
    vehicles: "/student/vehicles",
    history: "/student/history",
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
  },
} as const;

export const DEFAULT_PAGE_SIZE = 10;
