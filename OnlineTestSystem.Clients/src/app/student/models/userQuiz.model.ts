import { Answer } from '../../teacher/models/question.model';

export interface UserQuizDetail {
  userQuizId: string;
  userId: string;
  studentCode: string;
  fullName: string;
  examId: string;
  examName: string;
  quizId: string;
  quizName: string;
  duration: number;
  startedAt: string;
  finishedAt: string;
  score: number;
  isComplete: boolean;
  questions?: Array<UserQuizQuestionDetail>;
}

export interface UserQuizQuestionDetail {
  questionId: string;
  content: string;
  order: number;
  score: number;
  questionType: string;
  level: string;
  isActive: boolean;
  answers: Array<Answer>;
  userChosenAnswerIds: Array<string>;
}

export interface StartQuizResponse {
  success: boolean;
  errorMessage?: string;
  userQuizId?: string;
}
