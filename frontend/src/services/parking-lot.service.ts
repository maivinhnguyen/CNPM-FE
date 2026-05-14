import type { ParkingLot, ParkingLotStatus, ParkingLotType } from "@/types";
import { delay } from "@/mock/data";

let _lots: ParkingLot[] = [
  {
    id: "lot1",
    name: "Bãi xe A - Tòa Nhà Chính",
    address: "Cơ sở 1, 268 Lý Thường Kiệt, Phường 14, Quận 10",
    type: "multi_level",
    status: "active",
    totalCapacity: 200,
    currentOccupancy: 143,
    openTime: "06:00",
    closeTime: "22:00",
    contactPhone: "028 3864 7256",
    managerName: "Nguyễn Văn Quản",
    description: "Bãi xe đa tầng dành cho sinh viên và cán bộ. Có hệ thống camera an ninh và barrier tự động.",
    createdAt: "2023-08-01",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "lot2",
    name: "Bãi xe B - Khu Ký Túc Xá",
    address: "Ký túc xá Khu B, 97 Võ Văn Tần, Phường 6, Quận 3",
    type: "outdoor",
    status: "active",
    totalCapacity: 350,
    currentOccupancy: 289,
    openTime: "00:00",
    closeTime: "23:59",
    contactPhone: "028 3930 4067",
    managerName: "Trần Thị Hoa",
    description: "Bãi xe ngoài trời 24/7 dành riêng cho sinh viên nội trú. Có mái che một phần.",
    createdAt: "2023-08-01",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "lot3",
    name: "Bãi xe C - Cơ Sở 2",
    address: "Cơ sở 2, 175 Tây Sơn, Đống Đa, Hà Nội",
    type: "indoor",
    status: "active",
    totalCapacity: 150,
    currentOccupancy: 67,
    openTime: "06:30",
    closeTime: "21:30",
    contactPhone: "024 3869 4897",
    managerName: "Lê Minh Đức",
    description: "Bãi xe trong nhà có mái che hoàn toàn, hệ thống thông gió, camera HD.",
    createdAt: "2024-01-15",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "lot4",
    name: "Bãi xe D - Khu Thể Thao",
    address: "Sân thể thao, 268 Lý Thường Kiệt, Q.10",
    type: "outdoor",
    status: "maintenance",
    totalCapacity: 100,
    currentOccupancy: 0,
    openTime: "07:00",
    closeTime: "20:00",
    contactPhone: "028 3864 7256",
    managerName: "Phạm Văn An",
    description: "Đang nâng cấp hệ thống barrier và lắp đặt mái che. Dự kiến hoạt động trở lại tháng 6/2026.",
    createdAt: "2024-03-01",
    updatedAt: new Date().toISOString(),
  },
];

export const parkingLotService = {
  getAll: async (): Promise<ParkingLot[]> => {
    await delay(400);
    return [..._lots];
  },

  getById: async (id: string): Promise<ParkingLot | null> => {
    await delay(200);
    return _lots.find((l) => l.id === id) ?? null;
  },

  create: async (
    data: Omit<ParkingLot, "id" | "currentOccupancy" | "createdAt" | "updatedAt">
  ): Promise<ParkingLot> => {
    await delay(600);
    // Check duplicate name
    if (_lots.some((l) => l.name.toLowerCase() === data.name.toLowerCase())) {
      throw new Error("Tên nhà xe đã tồn tại trong hệ thống");
    }
    const now = new Date().toISOString();
    const lot: ParkingLot = {
      ...data,
      id: `lot${Date.now()}`,
      currentOccupancy: 0,
      createdAt: now,
      updatedAt: now,
    };
    _lots = [lot, ..._lots];
    return lot;
  },

  update: async (id: string, data: Partial<ParkingLot>): Promise<ParkingLot> => {
    await delay(500);
    const idx = _lots.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Không tìm thấy nhà xe");
    _lots[idx] = { ..._lots[idx], ...data, updatedAt: new Date().toISOString() };
    return _lots[idx];
  },

  updateStatus: async (id: string, status: ParkingLotStatus): Promise<ParkingLot> => {
    await delay(400);
    const idx = _lots.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Không tìm thấy nhà xe");
    _lots[idx] = { ..._lots[idx], status, updatedAt: new Date().toISOString() };
    return _lots[idx];
  },

  delete: async (id: string): Promise<void> => {
    await delay(400);
    _lots = _lots.filter((l) => l.id !== id);
  },

  getSummary: async () => {
    await delay(200);
    const total = _lots.reduce((a, l) => a + l.totalCapacity, 0);
    const occupied = _lots.reduce((a, l) => a + l.currentOccupancy, 0);
    return {
      totalLots: _lots.length,
      activeLots: _lots.filter((l) => l.status === "active").length,
      totalCapacity: total,
      currentOccupancy: occupied,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  },
};
