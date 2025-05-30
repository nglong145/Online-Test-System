export interface FilterUserQuiz {
  userId?: string;
  studentCode?: string;
  fullName?: string;
  examId?: string;
  examName?: string;
  quizId?: string;
  quizName?: string;
  startDate?: string;
  endDate?: string;
  score?: number;
  isCompleted?: boolean;
}

export interface UserQuiz {
  id: string;
  userId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  examId: string;
  examName: string;
  quizId: string;
  quizName: string;
  StartedAt: string;
  FinishedAt: string;
  score: number;
}
