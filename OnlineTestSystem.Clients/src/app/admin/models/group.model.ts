export interface FilterGroup {
  name?: string;
  description?: string;
  isActive?: boolean;
  userManager?: string;
  managerName?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  userManager: string;
  createdDate: string;
  managerFisrtName: string;
  managerLastName: string;
  memberCount: number;
}

export interface AddGroup {
  name: string;
  description: string;
  userManager: string;
  isActive: boolean;
}

export interface UpdateGroup {
  name: string;
  description: string;
  isActive: boolean;
  userManager: string;
}

export interface UserGroup {
  groupId: string;
  groupName: string;
  description: string;
  createdAt: string;
  userManager: string;
  memberCount: number;
  managerFisrtName: string;
  managerLastName: string;
  userId: string;
  fullName: string;
  studentCode: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  address: string;
  isActive: boolean;
  roleId: string;
  roleName: string;
}

export interface FilterUserGroup {
  groupId?: string;
  groupName?: string;
  groupActive?: string;
  userManager?: string;
  managerName?: string;
  userId?: string;
  fullName?: string;
  studentCode?: string;
  userActive?: string;
  roleId?: string;
}
