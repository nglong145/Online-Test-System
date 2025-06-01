import { Routes } from '@angular/router';
import { HomePageComponent } from '../student/home-page/home-page.component';
import { ExamPageComponent } from '../student/exam-page/exam-page.component';
import { UserQuizDetailComponent } from '../student/user-quiz-detail/user-quiz-detail.component';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomePageComponent,
  },
  {
    path: 'exam/:id/start',
    component: ExamPageComponent,
  },
  {
    path: 'user-quiz/:id',
    component: UserQuizDetailComponent,
  },
];
