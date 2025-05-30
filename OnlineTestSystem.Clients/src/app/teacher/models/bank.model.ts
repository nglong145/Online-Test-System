export interface Bank {
  id: string;
  name: string;
  ownerId?: string;
  OwnerFullName: string;
  quizCategoryId: string;
  quizCategoryName: string;
  totalQuestion: number;
  isActive: boolean;
}

export interface FilterBank {
  name?: string;
  ownerId?: string;
  OwnerFullName?: string;
  quizCategoryId?: string;
  quizCategoryName?: string;
  isActive?: boolean;
}

export interface CreateBank {
  name: string;
  ownerId?: string;
  quizCategoryId?: string;
}

export interface UpdateBank {
  name: string;
  ownerId?: string;
  quizCategoryId?: string;
  isActive: boolean;
}
