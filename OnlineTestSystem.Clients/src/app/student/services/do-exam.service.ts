import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AddUserAnswer,
  AddUserQuiz,
  FilterExamQuiz,
} from '../models/quiz.model';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';
import { FilterUserQuiz } from '../../admin/models/userQuiz.model';
import { UserQuizDetail } from '../models/userQuiz.model';

@Injectable({
  providedIn: 'root',
})
export class DoExamService {
  constructor(private http: HttpClient) {}

  // check if user has do exam
  checkUserHasExam(
    examId: string,
    userId: string
  ): Observable<{ message: boolean }> {
    return this.http.get<{ message: boolean }>(
      `${API_URL}/Quiz/exam/${examId}/user/${userId}/check-participation`
    );
  }

  //user quiz
  getFilterUserQuiz(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterUserQuiz
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/UserQuiz/filter?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  startQuiz(quizId: string, payload: AddUserQuiz): Observable<any> {
    return this.http.post<any>(`${API_URL}/Quiz/${quizId}/start`, payload);
  }

  // Record userAnswers
  recordAnswer(userQuizId: string, payload: AddUserAnswer): Observable<any> {
    return this.http.post<any>(`${API_URL}/Quiz/${userQuizId}/record`, payload);
  }

  // submit quiz
  submitQuiz(userQuizId: string, payload: AddUserQuiz): Observable<any> {
    return this.http.put<any>(
      `${API_URL}/Quiz/UserQuiz/${userQuizId}/submit`,
      payload
    );
  }

  getUserQuizDetail(userQuizId: string): Observable<UserQuizDetail> {
    return this.http.get<UserQuizDetail>(
      `${API_URL}/Quiz/UserQuiz/${userQuizId}/detail`
    );
  }

  getDoingUserQuiz(examId: string, userId: string) {
    return this.http.get<any>(`${API_URL}/Quiz/doing/${examId}/${userId}`);
  }

  cancelExam(userQuizId: string): Observable<any> {
    return this.http.delete<any>(`${API_URL}/UserQuiz/${userQuizId}`);
  }
}
