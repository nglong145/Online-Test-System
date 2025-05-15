export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  isActive: boolean;
}

export interface FilterCategory {
  id?: string;
  name?: string;
  description?: string;
  ParentId?: string;
  ParentName?: string;
  isActive?: boolean;
}

export interface CreateCategory {
  name: string;
  description?: string;
  ParentId?: string;
  isActive: boolean;
}

export interface UpdateCategory {
  name: string;
  description: string;
  ParentId?: string | null;
  isActive: boolean;
}
