import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { User } from "@/types";

export interface CreateUserData {
  email: string;
  passwordHash?: string; // standard fields expected by backend
  password?: string;
  role: string;
  memberId?: string | null;
  status?: string;
}

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<User[] | null>(ENDPOINTS.USERS.LIST);
    return res ?? [];
  },

  createUser: async (data: CreateUserData): Promise<User> => {
    return apiClient.post<User>(ENDPOINTS.USERS.CREATE, data);
  },

  deleteUser: async (id: string): Promise<void> => {
    return apiClient.delete(ENDPOINTS.USERS.DELETE(id));
  },

  updateUserStatus: async (id: string, status: string): Promise<void> => {
    return apiClient.put(ENDPOINTS.USERS.UPDATE_STATUS(id), { status });
  },
};
