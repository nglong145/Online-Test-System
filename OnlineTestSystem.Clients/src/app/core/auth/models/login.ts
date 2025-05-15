export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
}

export interface User {
  id: string;
  studentCode?: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email: string;
  phoneNumber: string;
  address: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
}
