export interface Bank {
  id: string;
  name: string;
  ownerId?: string;
  OwnerFullName: string;
  quizCategoryId: string;
  quizCategoryName: string;
  totalQuestion: number;
}

export interface FilterBank {
  name?: string;
  ownerId?: string;
  OwnerFullName?: string;
  quizCategoryId?: string;
  quizCategoryName?: string;
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
}
