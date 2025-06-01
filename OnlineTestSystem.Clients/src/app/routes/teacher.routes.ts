import { Routes } from '@angular/router';
import { DashboardComponent } from '../admin/dashboard/dashboard.component';
import { GroupListComponent } from '../admin/group/group-list/group-list.component';
import { GroupDetailComponent } from '../admin/group/group-detail/group-detail.component';
import { BankListComponent } from '../teacher/bank/bank-list/bank-list.component';
import { BankDetailComponent } from '../teacher/bank/bank-detail/bank-detail.component';
import { QuizListComponent } from '../teacher/quiz/quiz-list/quiz-list.component';
import { QuizDetailComponent } from '../teacher/quiz/quiz-detail/quiz-detail.component';
import { ExamListComponent } from '../admin/exam/exam-list/exam-list.component';
import { ExamDetailComponent } from '../admin/exam/exam-detail/exam-detail.component';
import { AddQuizExamComponent } from '../admin/exam/add-quiz-exam/add-quiz-exam.component';
import { unsavedChangesGuard } from '../core/guard/unsaved-changes.guard';

export const TEACHER_ROUTES: Routes = [
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
    path: 'group',
    component: GroupListComponent,
  },
  {
    path: 'group/:id',
    component: GroupDetailComponent,
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
];
