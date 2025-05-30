import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';
import {
  FilterExamGroup,
  FilterExamQuiz,
  FilterExamUser,
} from '../models/examExtend.model';
import { QuizWithQuestions } from '../../teacher/models/quiz.model';

@Injectable({
  providedIn: 'root',
})
export class ExamExtendService {
  constructor(private http: HttpClient) {}

  // ExamQuiz
  getRandomQuizFromExam(examId: string): Observable<QuizWithQuestions> {
    return this.http.get<QuizWithQuestions>(
      `${API_URL}/ExamExtend/${examId}/random-quiz`
    );
  }

  getFilterExamQuiz(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterExamQuiz
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/ExamExtend/filter-exam-quiz?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  addExamQuiz(examId: string, quizId: string): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/ExamExtend/${examId}/Quiz/${quizId}`,
      {}
    );
  }

  deleteExamQuiz(examId: string, quizId: string): Observable<any> {
    return this.http.delete<any>(
      `${API_URL}/ExamExtend/${examId}/Quiz/${quizId}`,
      {}
    );
  }

  // ExamGroup
  getFilterExamGroup(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterExamGroup
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/ExamExtend/filter-exam-group?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  addExamGroup(examId: string, groupId: string): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/ExamExtend/${examId}/Group/${groupId}`,
      {}
    );
  }

  deleteExamGroup(examId: string, groupId: string): Observable<any> {
    return this.http.delete<any>(
      `${API_URL}/ExamExtend/${examId}/Group/${groupId}`,
      {}
    );
  }

  // ExamUser
  getFilterExamUser(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterExamUser
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/ExamExtend/filter-exam-user?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  getFilterUpcomingExam(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterExamUser
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/ExamExtend/filter-upcoming-exam?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  getFilterOncomingExam(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterExamUser
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/ExamExtend/filter-oncoming-exam?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  addExamUser(examId: string, userId: string): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/ExamExtend/${examId}/User/${userId}`,
      { status: 'được phép thi', note: 'không' }
    );
  }

  deleteExamUser(examId: string, userId: string): Observable<any> {
    return this.http.delete<any>(
      `${API_URL}/ExamExtend/${examId}/User/${userId}`,
      {}
    );
  }

  exportExamParticipants(examId: string) {
    return this.http.get(
      `${API_URL}/ExamExtend/export-exam-participants/${examId}`,
      {
        responseType: 'blob',
      }
    );
  }
}
