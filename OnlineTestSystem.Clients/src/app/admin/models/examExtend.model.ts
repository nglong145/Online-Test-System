// ExamQuiz
export interface ExamQuiz {
  examId: string;
  examName: string;
  startTime: string;
  endTime: String;
  quizId: string;
  title: string;
  duration: number;
  totalQuestion: number;
}

export interface FilterExamQuiz {
  examId?: string;
  examName?: string;
  startTime?: string;
  endTime?: String;
  quizId?: string;
  title?: string;
  duration?: number;
}

export interface AddGroupToExamVm {
  examId: string;
  groupId: string;
}

// ExamUser
export interface ExamUser {
  examId: string;
  examName: string;
  examDescription: string;
  accessCode: string;
  startTime: string;
  endTime: string;
  examStatus: boolean;
  userId: string;
  fullName: string;
  studentCode?: string;
  dateOfBirth?: string;
  email: string;
  phoneNumber: string;
  address: string;
  roleId: string;
  roleName: string;
  userStatus: boolean;
  participantStatus: boolean;
  note: string;
}

export interface FilterExamUser {
  examId?: string;
  examName?: string;
  startTime?: string;
  endTime?: string;
  examStatus?: boolean;
  userId?: string;
  fullName?: string;
  email?: string;
  roleId?: string;
  roleName?: string;
  userStatus?: boolean;
  participantStatus?: boolean;
}

// ExamGroup
export interface ExamGroup {
  examId: string;
  examName: string;
  examDescription: string;
  accessCode: string;
  startTime: string;
  endTime: string;
  examStatus: boolean;
  groupId: string;
  groupName: string;
  userManager: string;
  userManagerName: string;
  groupStatus: boolean;
}

export interface FilterExamGroup {
  examId?: string;
  examName?: string;
  startTime?: string;
  endTime?: string;
  examStatus?: boolean;
  groupId?: string;
  groupName?: string;
  userManager?: string;
  userManagerName?: string;
  groupStatus?: boolean;
}
