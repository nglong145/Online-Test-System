export interface Quiz {
  id: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description?: string;
  duration: number;
  totalQuestion: number;
  isActive: boolean;
  CreatedAt: string;
}
