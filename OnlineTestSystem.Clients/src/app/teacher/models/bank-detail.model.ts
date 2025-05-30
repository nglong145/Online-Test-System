export interface Enum {
  name: string;
  value: string;
}

export interface Answer {
  id: string;
  content: string;
  order: number;
  isCorrect: boolean;
  isActive: boolean;
  questionId: string;
}

export interface QuestionWithAnswers {
  id: string;
  content: string;
  order: number;
  score?: number;
  questionType: string;
  level: string;
  isActive: boolean;
  answers: Array<Answer>;
}

export interface BankWithQuestions {
  id: string;
  name?: string;
  quizCategoryId: string;
  categoryName: string;
  ownerId: string;
  ownerFullName: string;
  isActive: boolean;
  questions?: Array<QuestionWithAnswers>;
}
