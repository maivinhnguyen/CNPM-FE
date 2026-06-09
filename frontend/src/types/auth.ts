export type UserRole = "student" | "staff" | "admin";
export type BackendRole = UserRole | "faculty";

export interface Member {
  id: string;
  studentId: string;
  fullName: string;
  phone?: string | null;
  createdAt: string;
}

// Local-only: UI still uses User for auth store compatibility
export interface User {
  id: string;
  email: string;
  name: string;
  role: BackendRole;
  studentId?: string;
  memberId?: string;
  avatar?: string;
  status?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateMemberData {
  studentId: string;
  fullName: string;
  phone?: string;
}

export interface UpdateMemberData {
  fullName?: string;
  phone?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  studentId?: string;
  role: BackendRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}
