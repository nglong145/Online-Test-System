import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { LoginComponent } from './core/auth/login/login.component';
import { TeacherListComponent } from './admin/teacher/teacher-list/teacher-list.component';
import { StudentListComponent } from './admin/student/student-list/student-list.component';
import { ExamListComponent } from './admin/exam/exam-list/exam-list.component';
import { GroupListComponent } from './admin/group/group-list/group-list.component';
import { StudentLayoutComponent } from './layout/student-layout/student-layout.component';
import { TeacherLayoutComponent } from './layout/teacher-layout/teacher-layout.component';
import { authGuard } from './core/guard/auth.guard';
import { GroupDetailComponent } from './admin/group/group-detail/group-detail.component';
import { TeacherDetailComponent } from './admin/teacher/teacher-detail/teacher-detail.component';
import { StudentDetailComponent } from './admin/student/student-detail/student-detail.component';
import { ExamDetailComponent } from './admin/exam/exam-detail/exam-detail.component';
import { CategoryListComponent } from './teacher/category/category-list/category-list.component';
import { CategoryDetailComponent } from './teacher/category/category-detail/category-detail.component';
import { BankListComponent } from './teacher/bank/bank-list/bank-list.component';
import { BankDetailComponent } from './teacher/bank/bank-detail/bank-detail.component';
import { AccessDeniedComponent } from './shared/access-denied/access-denied.component';
import { unsavedChangesGuard } from './core/guard/unsaved-changes.guard';
import { QuizListComponent } from './teacher/quiz/quiz-list/quiz-list.component';
import { QuizDetailComponent } from './teacher/quiz/quiz-detail/quiz-detail.component';
import { AddQuizExamComponent } from './admin/exam/add-quiz-exam/add-quiz-exam.component';
import { HomePageComponent } from './student/home-page/home-page.component';
import { ExamPageComponent } from './student/exam-page/exam-page.component';
import { UserQuizDetailComponent } from './student/user-quiz-detail/user-quiz-detail.component';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
    // children: [
    //   {
    //     path: 'dashboard',
    //     component: DashboardComponent,
    //   },
    //   {
    //     path: 'teacher',
    //     component: TeacherListComponent,
    //   },
    //   {
    //     path: 'teacher/:id',
    //     component: TeacherDetailComponent,
    //   },
    //   {
    //     path: 'student',
    //     component: StudentListComponent,
    //   },
    //   {
    //     path: 'student/:id',
    //     component: StudentDetailComponent,
    //   },
    //   {
    //     path: 'exam',
    //     component: ExamListComponent,
    //   },
    //   {
    //     path: 'exam/:id',
    //     component: ExamDetailComponent,
    //     canDeactivate: [unsavedChangesGuard],
    //   },

    //   {
    //     path: 'exam/:id/add-quiz',
    //     component: AddQuizExamComponent,
    //   },
    //   {
    //     path: 'group',
    //     component: GroupListComponent,
    //   },
    //   {
    //     path: 'group/:id',
    //     component: GroupDetailComponent,
    //   },

    //   {
    //     path: 'category',
    //     component: CategoryListComponent,
    //   },
    //   {
    //     path: 'category/:id',
    //     component: CategoryDetailComponent,
    //     canDeactivate: [unsavedChangesGuard],
    //   },

    //   {
    //     path: 'bank',
    //     component: BankListComponent,
    //   },
    //   {
    //     path: 'bank/:id',
    //     component: BankDetailComponent,
    //     canDeactivate: [unsavedChangesGuard],
    //   },

    //   {
    //     path: 'quiz',
    //     component: QuizListComponent,
    //   },
    //   {
    //     path: 'quiz/:id',
    //     component: QuizDetailComponent,
    //     canDeactivate: [unsavedChangesGuard],
    //   },
    // ],
    loadChildren: () =>
      import('./routes/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  {
    path: 'teacher',
    component: TeacherLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['Teacher'] },
    // children: [
    //   {
    //     path: 'dashboard',
    //     component: DashboardComponent,
    //   },
    //   {
    //     path: 'group',
    //     component: GroupListComponent,
    //   },
    //   {
    //     path: 'group/:id',
    //     component: GroupDetailComponent,
    //     canDeactivate: [unsavedChangesGuard],
    //   },

    //   {
    //     path: 'bank',
    //     component: BankListComponent,
    //   },
    //   {
    //     path: 'bank/:id',
    //     component: BankDetailComponent,
    //     canDeactivate: [unsavedChangesGuard],
    //   },

    //   {
    //     path: 'quiz',
    //     component: QuizListComponent,
    //   },
    //   {
    //     path: 'quiz/:id',
    //     component: QuizDetailComponent,
    //     canDeactivate: [unsavedChangesGuard],
    //   },

    //   {
    //     path: 'exam',
    //     component: ExamListComponent,
    //   },
    //   {
    //     path: 'exam/:id',
    //     component: ExamDetailComponent,
    //     canDeactivate: [unsavedChangesGuard],
    //   },

    //   {
    //     path: 'exam/:id/add-quiz',
    //     component: AddQuizExamComponent,
    //   },
    // ],
    loadChildren: () =>
      import('./routes/teacher.routes').then((m) => m.TEACHER_ROUTES),
  },

  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['Student'] },
    // children: [
    //   {
    //     path: 'home',
    //     component: HomePageComponent,
    //   },
    //   {
    //     path: 'exam/:id/start',
    //     component: ExamPageComponent,
    //   },
    //   {
    //     path: 'user-quiz/:id',
    //     component: UserQuizDetailComponent,
    //   },
    // ],
    loadChildren: () =>
      import('./routes/student.routes').then((m) => m.STUDENT_ROUTES),
  },

  {
    path: 'access-denied',
    component: AccessDeniedComponent,
  },

  {
    path: 'not-found',
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
