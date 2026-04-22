import type { LoginCredentials, RegisterData, AuthResponse } from "@/types";
import { mockUsers, delay } from "@/mock/data";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800);

    const user = mockUsers.find((u) => u.email === credentials.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    return {
      user,
      token: `mock-jwt-token-${user.id}-${Date.now()}`,
    };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    await delay(800);

    const exists = mockUsers.find((u) => u.email === data.email);
    if (exists) {
      throw new Error("Email already registered");
    }

    const newUser = {
      id: `u${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role,
      studentId: data.studentId,
      createdAt: new Date().toISOString(),
    };

    return {
      user: newUser,
      token: `mock-jwt-token-${newUser.id}-${Date.now()}`,
    };
  },

  async logout(): Promise<void> {
    await delay(300);
  },
};
