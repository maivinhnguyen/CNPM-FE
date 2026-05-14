import type { WorkShift, ShiftStatus } from "@/types";
import { mockWorkShifts, mockUsers, delay } from "@/mock/data";

let _shifts: WorkShift[] = [...mockWorkShifts];

export const shiftService = {
  // Get all shifts, optionally filtered by date range
  getShifts: async (fromDate?: string, toDate?: string): Promise<WorkShift[]> => {
    await delay(400);
    let result = [..._shifts];
    if (fromDate) result = result.filter((s) => s.date >= fromDate);
    if (toDate)   result = result.filter((s) => s.date <= toDate);
    return result.sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  },

  // Get shifts for a specific date
  getShiftsByDate: async (date: string): Promise<WorkShift[]> => {
    await delay(300);
    return _shifts.filter((s) => s.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  // Get all staff users
  getStaffList: async () => {
    await delay(200);
    return mockUsers.filter((u) => u.role === "staff");
  },

  // Create a new shift
  createShift: async (data: Omit<WorkShift, "id" | "status" | "staffIds" | "staffNames">): Promise<WorkShift> => {
    await delay(500);
    const newShift: WorkShift = {
      ...data,
      id: `sh${Date.now()}`,
      staffIds: [],
      staffNames: [],
      status: "scheduled",
    };
    _shifts = [newShift, ..._shifts];
    return newShift;
  },

  // Assign staff to a shift
  assignStaff: async (shiftId: string, staffId: string, assignedBy: string): Promise<WorkShift> => {
    await delay(400);
    const staffUser = mockUsers.find((u) => u.id === staffId);
    if (!staffUser) throw new Error("Không tìm thấy nhân viên");

    const idx = _shifts.findIndex((s) => s.id === shiftId);
    if (idx === -1) throw new Error("Không tìm thấy ca làm");

    const shift = _shifts[idx];
    if (shift.staffIds.includes(staffId)) throw new Error("Nhân viên đã được phân vào ca này");

    _shifts[idx] = {
      ...shift,
      staffIds: [...shift.staffIds, staffId],
      staffNames: [...shift.staffNames, staffUser.name],
    };
    return _shifts[idx];
  },

  // Remove staff from a shift
  removeStaff: async (shiftId: string, staffId: string): Promise<WorkShift> => {
    await delay(400);
    const idx = _shifts.findIndex((s) => s.id === shiftId);
    if (idx === -1) throw new Error("Không tìm thấy ca làm");

    const shift = _shifts[idx];
    const staffIdx = shift.staffIds.indexOf(staffId);
    const newStaffIds = shift.staffIds.filter((_, i) => i !== staffIdx);
    const newStaffNames = shift.staffNames.filter((_, i) => i !== staffIdx);

    _shifts[idx] = { ...shift, staffIds: newStaffIds, staffNames: newStaffNames };
    return _shifts[idx];
  },

  // Update shift status
  updateStatus: async (shiftId: string, status: ShiftStatus): Promise<WorkShift> => {
    await delay(300);
    const idx = _shifts.findIndex((s) => s.id === shiftId);
    if (idx === -1) throw new Error("Không tìm thấy ca làm");
    _shifts[idx] = { ..._shifts[idx], status };
    return _shifts[idx];
  },

  // Update shift notes
  updateNotes: async (shiftId: string, notes: string): Promise<WorkShift> => {
    await delay(300);
    const idx = _shifts.findIndex((s) => s.id === shiftId);
    if (idx === -1) throw new Error("Không tìm thấy ca làm");
    _shifts[idx] = { ..._shifts[idx], notes };
    return _shifts[idx];
  },

  // Delete a shift
  deleteShift: async (shiftId: string): Promise<void> => {
    await delay(400);
    _shifts = _shifts.filter((s) => s.id !== shiftId);
  },

  // Staff confirms shift start
  confirmStart: async (shiftId: string): Promise<WorkShift> => {
    await delay(500);
    const idx = _shifts.findIndex((s) => s.id === shiftId);
    if (idx === -1) throw new Error("Không tìm thấy ca làm");
    if (_shifts[idx].status !== "scheduled") throw new Error("Ca không ở trạng thái có thể bắt đầu");
    _shifts[idx] = { ..._shifts[idx], status: "active" };
    return _shifts[idx];
  },

  // Staff confirms shift end with handover note
  confirmEnd: async (shiftId: string, handoverNote?: string): Promise<WorkShift> => {
    await delay(500);
    const idx = _shifts.findIndex((s) => s.id === shiftId);
    if (idx === -1) throw new Error("Không tìm thấy ca làm");
    if (_shifts[idx].status !== "active") throw new Error("Ca chưa được bắt đầu");
    _shifts[idx] = {
      ..._shifts[idx],
      status: "completed",
      notes: handoverNote ? `[Bàn giao] ${handoverNote}` : _shifts[idx].notes,
    };
    return _shifts[idx];
  },

  // Get shift history for a specific staff
  getStaffShiftHistory: async (staffId: string): Promise<WorkShift[]> => {
    await delay(300);
    return _shifts
      .filter((s) => s.staffIds.includes(staffId))
      .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));
  },
};

