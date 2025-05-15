export interface Group {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  userManager: string;
  createdDate: Date;
  managerFisrtName: string;
  managerLastName: string;
}

export interface AddGroup {
  name: string;
  description: string;
  userManager: string;
}

export interface UpdateGroup {
  name: string;
  description: string;
  isActive: boolean;
  userManager: string;
}
