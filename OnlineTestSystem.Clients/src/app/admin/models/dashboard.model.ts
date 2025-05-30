export interface FilterDashboard {
  examId?: string;
  examName?: string;
  startDate?: string;
  endDate?: string;
  passingScore?: number;
}

export interface ExamAverageScore {
  examId?: string;
  examName: string;
  averageScore: number;
  submitCount: number;
  minScore: number;
  maxScore: number;
  passRate: number;
}

export interface DashboardSummary {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalExams: number;
  totalQuizzes: number;
  totalGroups: number;
  completedExamsCount: number;
  runningExamsCount: number;
  finishedExamsCount: number;
}
