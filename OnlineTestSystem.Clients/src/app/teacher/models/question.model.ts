export interface Answer {
  id: string;
  content: string;
  order: number;
  isCorrect: boolean;
  isActive: boolean;
  questionId: string;
}

export interface AddAnswer {
  content: string;
  order: number;
  isCorrect?: boolean;
  isActive?: boolean;
  questionId: string;
}

export interface Question {
  id: string;
  content: string;
  order: number;
  questionType: string;
  audioUrl?: string;
  isActive: boolean;
  createdAt: string;
  level: string;
  bankId: string;
  bankName?: string;
}

export interface AddQuestion {
  content: string;
  order: number;
  questionType: string;
  audioUrl?: string;
  isActive?: boolean;
  level: string;
  bankId?: string;
}
