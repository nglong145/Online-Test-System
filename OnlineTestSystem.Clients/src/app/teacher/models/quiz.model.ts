import { QuestionWithAnswers } from './bank-detail.model';

export interface Quiz {
  id: string;
  category: string;
  categoryName: string;
  title: string;
  description?: string;
  duration: number;
  totalQuestion: number;
  isActive: boolean;
  createdAt: string;
}

export interface FilterQuiz {
  category?: string;
  categoryName?: string;
  title?: string;
  description?: string;
  duration?: number;
  isActive?: boolean;
}

export interface CreateQuiz {
  category: string;
  title: string;
  description?: string;
  duration: number;
  isActive: boolean;
}

export interface UpdateQuiz {
  category: string;
  title: string;
  description?: string;
  duration: number;
  isActive: boolean;
}

export interface RandomQuizCreate {
  questionBankId: string;
  numberOfQuestionsPerQuiz: number;
  numberOfQuizzes: number;
  score: number;
  duration: number;
}

export interface QuizWithQuestions {
  id: string;
  category: string;
  categoryName?: string;
  title: string;
  description: string;
  duration: number;
  isActive: boolean;
  createdAt: string;
  totalScore?: number;
  questions?: Array<QuestionWithAnswers>;
}
