import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CreateQuiz,
  FilterQuiz,
  Quiz,
  QuizWithQuestions,
  RandomQuizCreate,
  UpdateQuiz,
} from '../models/quiz.model';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  constructor(private http: HttpClient) {}

  getFilterQuiz(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterQuiz
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/Quiz/Filter?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  addQuiz(quiz: CreateQuiz): Observable<any> {
    return this.http.post<any>(`${API_URL}/Quiz/add-new-quiz`, quiz);
  }

  getQuizById(quizId: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${API_URL}/Quiz/get-quiz-by-id/${quizId}`);
  }

  updateQuiz(quizId: string, quiz: UpdateQuiz): Observable<any> {
    return this.http.put<any>(`${API_URL}/Quiz/update-quiz/${quizId}`, quiz);
  }

  createQuizRandomBank(random: RandomQuizCreate): Observable<any> {
    return this.http.post<any>(`${API_URL}/Quiz/random-generate`, random);
  }

  // get quiz with questions and answers
  getQuizWithQuestionsAnswers(quizId: string): Observable<QuizWithQuestions> {
    return this.http.get<QuizWithQuestions>(
      `${API_URL}/Quiz/${quizId}/full-detail`
    );
  }

  exportUserQuizzes(examId: string) {
    return this.http.get(`${API_URL}/UserQuiz/export-user-quiz/${examId}`, {
      responseType: 'blob',
    });
  }
}
