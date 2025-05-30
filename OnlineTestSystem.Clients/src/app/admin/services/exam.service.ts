import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';
import { FilterUserQuiz } from '../models/userQuiz.model';
import { CreateExam, Exam, FilterExam, UpdateExam } from '../models/exam.model';
import { FilterExamQuiz } from '../../student/models/quiz.model';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  constructor(private http: HttpClient) {}

  getFilterExam(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterExam
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/Exam/filter?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  addExam(exam: CreateExam): Observable<any> {
    return this.http.post<any>(`${API_URL}/Exam/add-new-exam`, exam);
  }

  getExamById(examId: string): Observable<Exam> {
    return this.http.get<Exam>(`${API_URL}/Exam/get-exam-by-id/${examId}`);
  }

  updateExam(examId: string, exam: UpdateExam): Observable<any> {
    return this.http.put<any>(`${API_URL}/Exam/update-exam/${examId}`, exam);
  }

  getFilterExamUpcoming(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterExam
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/Exam/filter-upcoming?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  getFilterExamOncoming(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterExam
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/Exam/filter-oncoming?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }
}
