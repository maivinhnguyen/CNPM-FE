import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { WorkShift, ShiftStatus } from "@/types";

export const shiftService = {
  getShifts: async (fromDate?: string, toDate?: string, staffId?: string): Promise<WorkShift[]> => {
    const params = {
      ...(fromDate && { from: fromDate }),
      ...(toDate && { to: toDate }),
      ...(staffId && { staffId }),
    };
    const res = await apiClient.get<WorkShift[] | null>(ENDPOINTS.SHIFTS.LIST, { params });
    return res ?? [];
  },

  getShiftsByDate: async (date: string): Promise<WorkShift[]> => {
    return shiftService.getShifts(date, date);
  },

  getStaffList: async () => {
    const users = await apiClient.get<{ id: string; email: string; role: string; createdAt: string }[] | null>(ENDPOINTS.USERS.LIST);
    return (users ?? [])
      .filter((u) => u.role === "staff")
      .map((u) => ({
        id: u.id,
        email: u.email,
        name: u.email.split("@")[0],
        role: u.role,
        createdAt: u.createdAt,
      }));
  },

  createShift: async (data: Omit<WorkShift, "id" | "status" | "staffIds" | "staffNames">): Promise<WorkShift> => {
    return apiClient.post<WorkShift>(ENDPOINTS.SHIFTS.CREATE, {
      name: data.name,
      type: data.type,
      startTime: data.startTime,
      endTime: data.endTime,
      date: data.date,
      notes: data.notes || null,
    });
  },

  assignStaff: async (shiftId: string, staffId: string): Promise<WorkShift> => {
    return apiClient.post<WorkShift>(ENDPOINTS.SHIFTS.ASSIGN(shiftId), { staffId });
  },

  removeStaff: async (shiftId: string, staffId: string): Promise<WorkShift> => {
    return apiClient.post<WorkShift>(ENDPOINTS.SHIFTS.UNASSIGN(shiftId), { staffId });
  },

  updateStatus: async (shiftId: string, status: ShiftStatus): Promise<WorkShift> => {
    return apiClient.put<WorkShift>(ENDPOINTS.SHIFTS.UPDATE_STATUS(shiftId), { status });
  },

  // Update shift notes
  updateNotes: async (shiftId: string, notes: string): Promise<WorkShift> => {
    return apiClient.put<WorkShift>(ENDPOINTS.SHIFTS.UPDATE_NOTES(shiftId), { notes });
  },

  // Delete a shift
  deleteShift: async (shiftId: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.SHIFTS.DELETE(shiftId));
  },

  // Staff confirms shift start
  confirmStart: async (shiftId: string): Promise<WorkShift> => {
    return shiftService.updateStatus(shiftId, "active");
  },

  // Staff confirms shift end with handover note
  confirmEnd: async (shiftId: string, handoverNote?: string): Promise<WorkShift> => {
    if (handoverNote) {
      await shiftService.updateNotes(shiftId, `[Bàn giao] ${handoverNote}`);
    }
    return shiftService.updateStatus(shiftId, "completed");
  },

  // Get shift history for a specific staff (server-side filtered)
  getStaffShiftHistory: async (staffId: string): Promise<WorkShift[]> => {
    const shifts = await shiftService.getShifts(undefined, undefined, staffId);
    return shifts.sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));
  },
};

