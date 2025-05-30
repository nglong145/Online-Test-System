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
  isActive: boolean;
  roleName: string;
}

export interface FilterUser {
  studentCode?: string;
  name?: string;
  email?: string;
  address?: string;
  startDate?: Date;
  endDate?: Date;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface CreateUser {
  studentCode?: string | null;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  role: string;
}

export interface UpdateUser {
  studentCode?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  isActive?: boolean;
  dateOfBirth?: string;
}

export interface ChangePassword {
  userId: string;
  currentPassword: string;
  newPassword: string;
}
