import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FilterExamQuiz } from '../models/quiz.model';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';
import { FilterUserQuiz } from '../../admin/models/userQuiz.model';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  constructor(private http: HttpClient) {}

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
}
