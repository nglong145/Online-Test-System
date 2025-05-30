export interface FilterExam {
  name?: string;
  description?: string;
  startedAt?: string;
  finishedAt?: string;
  isActive?: boolean;
}

export interface Exam {
  id: string;
  name?: string;
  description: string;
  accessCode: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface CreateExam {
  name: string;
  description: string;
  accessCode: string;
  startTime: string | null;
  endTime?: string | null;
  isActive: boolean;
}

export interface UpdateExam {
  name?: string;
  description?: string;
  accessCode?: string;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}
