export interface FilterExamQuiz {
  examId?: string;
  examName?: string;
  startTime?: string;
  endTime?: string;
  quizId?: string;
  title?: string;
  duration?: number;
}

export interface AddUserQuiz {
  userId: string;
  examId?: string;
  finishedAt?: string;
  score?: number;
  isComplete?: boolean;
}

export interface AddUserAnswer {
  questionId: string;
  answerId: string;
  userVoiceUrl?: string | null;
  answerText?: string | null;
  isCorrect?: boolean | null;
}
