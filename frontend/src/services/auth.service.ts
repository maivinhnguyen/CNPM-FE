import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/endpoints";
import type { LoginCredentials, RegisterData, AuthResponse, User, Member } from "@/types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<{
      token: string;
      user: {
        id: string;
        email: string;
        role: User["role"];
        memberId?: string;
      };
    }>(ENDPOINTS.AUTH.LOGIN, credentials);

    const backendUser = res.user;
    let name = backendUser.email.split("@")[0];
    let studentId: string | undefined = undefined;

    if (backendUser.memberId) {
      try {
        const member = await apiClient.get<Member>(ENDPOINTS.MEMBERS.BY_ID(backendUser.memberId));
        name = member.fullName;
        studentId = member.studentId;
      } catch (e) {
        console.error("Failed to fetch member details:", e);
      }
    }

    const user: User = {
      id: backendUser.id,
      email: backendUser.email,
      name,
      role: backendUser.role,
      memberId: backendUser.memberId,
      studentId,
      createdAt: new Date().toISOString(),
    };

    return {
      user,
      token: res.token,
    };
  },

  async register(data: RegisterData): Promise<void> {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
  },

  async logout(): Promise<void> {
    // Just clear local state, no backend call needed
  },
};
