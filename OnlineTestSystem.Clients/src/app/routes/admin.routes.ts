import { Routes } from '@angular/router';
import { DashboardComponent } from '../admin/dashboard/dashboard.component';
import { BankListComponent } from '../teacher/bank/bank-list/bank-list.component';
import { CategoryDetailComponent } from '../teacher/category/category-detail/category-detail.component';
import { unsavedChangesGuard } from '../core/guard/unsaved-changes.guard';
import { BankDetailComponent } from '../teacher/bank/bank-detail/bank-detail.component';
import { QuizListComponent } from '../teacher/quiz/quiz-list/quiz-list.component';
import { QuizDetailComponent } from '../teacher/quiz/quiz-detail/quiz-detail.component';
import { CategoryListComponent } from '../teacher/category/category-list/category-list.component';
import { GroupDetailComponent } from '../admin/group/group-detail/group-detail.component';
import { GroupListComponent } from '../admin/group/group-list/group-list.component';
import { AddQuizExamComponent } from '../admin/exam/add-quiz-exam/add-quiz-exam.component';
import { ExamDetailComponent } from '../admin/exam/exam-detail/exam-detail.component';
import { ExamListComponent } from '../admin/exam/exam-list/exam-list.component';
import { StudentDetailComponent } from '../admin/student/student-detail/student-detail.component';
import { StudentListComponent } from '../admin/student/student-list/student-list.component';
import { TeacherDetailComponent } from '../admin/teacher/teacher-detail/teacher-detail.component';
import { TeacherListComponent } from '../admin/teacher/teacher-list/teacher-list.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'teacher',
    component: TeacherListComponent,
  },
  {
    path: 'teacher/:id',
    component: TeacherDetailComponent,
  },
  {
    path: 'student',
    component: StudentListComponent,
  },
  {
    path: 'student/:id',
    component: StudentDetailComponent,
  },
  {
    path: 'exam',
    component: ExamListComponent,
  },
  {
    path: 'exam/:id',
    component: ExamDetailComponent,
    canDeactivate: [unsavedChangesGuard],
  },

  {
    path: 'exam/:id/add-quiz',
    component: AddQuizExamComponent,
  },
  {
    path: 'group',
    component: GroupListComponent,
  },
  {
    path: 'group/:id',
    component: GroupDetailComponent,
  },

  {
    path: 'category',
    component: CategoryListComponent,
  },
  {
    path: 'category/:id',
    component: CategoryDetailComponent,
    canDeactivate: [unsavedChangesGuard],
  },

  {
    path: 'bank',
    component: BankListComponent,
  },
  {
    path: 'bank/:id',
    component: BankDetailComponent,
    canDeactivate: [unsavedChangesGuard],
  },

  {
    path: 'quiz',
    component: QuizListComponent,
  },
  {
    path: 'quiz/:id',
    component: QuizDetailComponent,
    canDeactivate: [unsavedChangesGuard],
  },
];
