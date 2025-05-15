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
    // canActivate: [authGuard],
    // data: { roles: ['Admin'] },
    children: [
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
        path: 'groups/:id',
        component: GroupDetailComponent,
      },
    ],
  },

  {
    path: 'teacher',
    component: TeacherLayoutComponent,
    // canActivate: [authGuard],
    // data: { roles: ['Teacher'] },
    children: [
      {
        path: 'category',
        component: CategoryListComponent,
      },
      {
        path: 'category/:id',
        component: CategoryDetailComponent,
      },

      {
        path: 'bank',
        component: BankListComponent,
      },
      {
        path: 'bank/:id',
        component: BankDetailComponent,
      },
    ],
  },

  {
    path: 'student',
    component: StudentLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['Student'] },
    children: [],
  },

  {
    path: 'access-denied',
    component: AccessDeniedComponent,
  },

  {
    path: '**',
    redirectTo: 'not-found', // hoặc /home, /dashboard, tùy bạn
  },
];
