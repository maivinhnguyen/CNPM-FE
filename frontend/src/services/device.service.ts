import type { Device, DeviceAlert, DeviceStatus } from "@/types";
import { delay } from "@/mock/data";

// ── Mock Devices ───────────────────────────────────────────────
let _devices: Device[] = [
  {
    id: "dev1", name: "Camera Cổng A - Vào", type: "camera",
    locationLabel: "Cổng A - Lối vào", status: "online",
    ipAddress: "192.168.1.10", lastSeen: new Date().toISOString(),
    installedAt: "2024-01-15", firmwareVersion: "v2.3.1", alertCount: 0,
  },
  {
    id: "dev2", name: "Camera Cổng A - Ra", type: "camera",
    locationLabel: "Cổng A - Lối ra", status: "online",
    ipAddress: "192.168.1.11", lastSeen: new Date().toISOString(),
    installedAt: "2024-01-15", firmwareVersion: "v2.3.1", alertCount: 0,
  },
  {
    id: "dev3", name: "Camera Cổng B - Vào", type: "camera",
    locationLabel: "Cổng B - Lối vào", status: "warning",
    ipAddress: "192.168.1.12",
    lastSeen: new Date(Date.now() - 300000).toISOString(),
    installedAt: "2024-01-20", firmwareVersion: "v2.2.8",
    notes: "Hình ảnh bị mờ vào ban đêm, cần kiểm tra ống kính",
    alertCount: 1,
  },
  {
    id: "dev4", name: "Camera CCTV Khu A", type: "camera",
    locationLabel: "Khu đỗ xe A", status: "offline",
    ipAddress: "192.168.1.13",
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
    installedAt: "2024-02-01", firmwareVersion: "v2.3.0",
    alertCount: 2,
  },
  {
    id: "dev5", name: "Barrier Cổng A - Vào", type: "barrier",
    locationLabel: "Cổng A - Lối vào", status: "online",
    ipAddress: "192.168.1.20", lastSeen: new Date().toISOString(),
    installedAt: "2024-01-15", alertCount: 0,
  },
  {
    id: "dev6", name: "Barrier Cổng A - Ra", type: "barrier",
    locationLabel: "Cổng A - Lối ra", status: "maintenance",
    ipAddress: "192.168.1.21",
    lastSeen: new Date(Date.now() - 1800000).toISOString(),
    installedAt: "2024-01-15",
    notes: "Đang bảo trì định kỳ, dự kiến xong lúc 14:00",
    alertCount: 0,
  },
  {
    id: "dev7", name: "Đầu đọc RFID Cổng A", type: "rfid_reader",
    locationLabel: "Cổng A - Lối vào", status: "online",
    ipAddress: "192.168.1.30", lastSeen: new Date().toISOString(),
    installedAt: "2024-01-15", firmwareVersion: "v1.5.2", alertCount: 0,
  },
  {
    id: "dev8", name: "Đầu đọc RFID Cổng B", type: "rfid_reader",
    locationLabel: "Cổng B - Lối vào", status: "online",
    ipAddress: "192.168.1.31", lastSeen: new Date().toISOString(),
    installedAt: "2024-01-20", firmwareVersion: "v1.5.2", alertCount: 0,
  },
  {
    id: "dev9", name: "Cảm biến chỗ trống Khu A", type: "sensor",
    locationLabel: "Khu đỗ xe A", status: "online",
    ipAddress: "192.168.1.40", lastSeen: new Date().toISOString(),
    installedAt: "2024-03-01", firmwareVersion: "v1.0.0", alertCount: 0,
  },
  {
    id: "dev10", name: "Cảm biến chỗ trống Khu B", type: "sensor",
    locationLabel: "Khu đỗ xe B", status: "warning",
    ipAddress: "192.168.1.41",
    lastSeen: new Date(Date.now() - 600000).toISOString(),
    installedAt: "2024-03-01", firmwareVersion: "v1.0.0",
    notes: "Báo sai số chỗ trống, sai lệch ±3",
    alertCount: 1,
  },
];

let _alerts: DeviceAlert[] = [
  {
    id: "al1", deviceId: "dev3", deviceName: "Camera Cổng B - Vào",
    message: "Chất lượng hình ảnh giảm, độ sáng thấp",
    severity: "medium", createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "al2", deviceId: "dev4", deviceName: "Camera CCTV Khu A",
    message: "Thiết bị mất kết nối — không phản hồi ping",
    severity: "high", createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "al3", deviceId: "dev4", deviceName: "Camera CCTV Khu A",
    message: "Lỗi ghi video liên tục (disk full)",
    severity: "high", createdAt: new Date(Date.now() - 7300000).toISOString(),
  },
  {
    id: "al4", deviceId: "dev10", deviceName: "Cảm biến chỗ trống Khu B",
    message: "Dữ liệu cảm biến không nhất quán",
    severity: "low", createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

export const deviceService = {
  getAll: async (): Promise<Device[]> => {
    await delay(400);
    return [..._devices];
  },

  getById: async (id: string): Promise<Device | null> => {
    await delay(200);
    return _devices.find((d) => d.id === id) ?? null;
  },

  getAlerts: async (deviceId?: string): Promise<DeviceAlert[]> => {
    await delay(300);
    const alerts = deviceId
      ? _alerts.filter((a) => a.deviceId === deviceId && !a.resolvedAt)
      : _alerts.filter((a) => !a.resolvedAt);
    return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  updateStatus: async (id: string, status: DeviceStatus, notes?: string): Promise<Device> => {
    await delay(400);
    const idx = _devices.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Không tìm thấy thiết bị");
    _devices[idx] = {
      ..._devices[idx],
      status,
      notes: notes ?? _devices[idx].notes,
      lastSeen: new Date().toISOString(),
    };
    return _devices[idx];
  },

  updateNotes: async (id: string, notes: string): Promise<Device> => {
    await delay(300);
    const idx = _devices.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Không tìm thấy thiết bị");
    _devices[idx] = { ..._devices[idx], notes };
    return _devices[idx];
  },

  resolveAlert: async (alertId: string): Promise<void> => {
    await delay(300);
    const idx = _alerts.findIndex((a) => a.id === alertId);
    if (idx !== -1) _alerts[idx] = { ..._alerts[idx], resolvedAt: new Date().toISOString() };
    // Update device alertCount
    const deviceId = _alerts[idx]?.deviceId;
    if (deviceId) {
      const dIdx = _devices.findIndex((d) => d.id === deviceId);
      if (dIdx !== -1) {
        const remaining = _alerts.filter((a) => a.deviceId === deviceId && !a.resolvedAt).length;
        _devices[dIdx] = { ..._devices[dIdx], alertCount: remaining };
      }
    }
  },

  reportFault: async (deviceId: string, message: string, severity: "low" | "medium" | "high"): Promise<DeviceAlert> => {
    await delay(400);
    const device = _devices.find((d) => d.id === deviceId);
    if (!device) throw new Error("Không tìm thấy thiết bị");
    const alert: DeviceAlert = {
      id: `al${Date.now()}`,
      deviceId,
      deviceName: device.name,
      message,
      severity,
      createdAt: new Date().toISOString(),
    };
    _alerts = [alert, ..._alerts];
    const dIdx = _devices.findIndex((d) => d.id === deviceId);
    _devices[dIdx] = { ..._devices[dIdx], alertCount: _devices[dIdx].alertCount + 1, status: "warning" };
    return alert;
  },

  getSummary: async () => {
    await delay(200);
    return {
      total: _devices.length,
      online: _devices.filter((d) => d.status === "online").length,
      offline: _devices.filter((d) => d.status === "offline").length,
      warning: _devices.filter((d) => d.status === "warning").length,
      maintenance: _devices.filter((d) => d.status === "maintenance").length,
      totalAlerts: _alerts.filter((a) => !a.resolvedAt).length,
    };
  },
};
