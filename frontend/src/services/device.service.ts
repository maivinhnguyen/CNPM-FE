import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Device, DeviceAlert, DeviceStatus } from "@/types";

export const deviceService = {
  getAll: async (): Promise<Device[]> => {
    const res = await apiClient.get<Device[] | null>(ENDPOINTS.DEVICES.LIST);
    return res ?? [];
  },

  getById: async (id: string): Promise<Device | null> => {
    try {
      return await apiClient.get<Device>(ENDPOINTS.DEVICES.BY_ID(id));
    } catch {
      return null;
    }
  },

  getAlerts: async (deviceId?: string): Promise<DeviceAlert[]> => {
    const params = deviceId ? { deviceId } : undefined;
    const res = await apiClient.get<DeviceAlert[] | null>(ENDPOINTS.DEVICES.ALERTS, { params });
    return res ?? [];
  },

  updateStatus: async (id: string, status: DeviceStatus, notes?: string): Promise<Device> => {
    return apiClient.put<Device>(ENDPOINTS.DEVICES.UPDATE_STATUS(id), { status, notes });
  },

  updateNotes: async (id: string, notes: string): Promise<Device> => {
    return apiClient.put<Device>(ENDPOINTS.DEVICES.UPDATE_NOTES(id), { notes });
  },

  resolveAlert: async (alertId: string): Promise<void> => {
    return apiClient.post(ENDPOINTS.DEVICES.RESOLVE_ALERT(alertId));
  },

  reportFault: async (deviceId: string, message: string, severity: "low" | "medium" | "high"): Promise<DeviceAlert> => {
    return apiClient.post<DeviceAlert>(ENDPOINTS.DEVICES.FAULT(deviceId), { message, severity });
  },

  getSummary: async () => {
    try {
      const [devices, alerts] = await Promise.all([
        deviceService.getAll(),
        deviceService.getAlerts(),
      ]);

      return {
        total: devices.length,
        online: devices.filter((d) => d.status === "online").length,
        offline: devices.filter((d) => d.status === "offline").length,
        warning: devices.filter((d) => d.status === "warning").length,
        maintenance: devices.filter((d) => d.status === "maintenance").length,
        totalAlerts: alerts.length,
      };
    } catch {
      return {
        total: 0,
        online: 0,
        offline: 0,
        warning: 0,
        maintenance: 0,
        totalAlerts: 0,
      };
    }
  },
};
