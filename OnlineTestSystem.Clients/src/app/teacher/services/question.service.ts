import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AddAnswer,
  AddQuestion,
  Answer,
  Question,
} from '../models/question.model';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  constructor(private http: HttpClient) {}

  addAnswer(answer: AddAnswer): Observable<any> {
    return this.http.post<any>(`${API_URL}/Answer`, answer);
  }

  updateAnswer(answerId: string, answer: AddAnswer): Observable<any> {
    return this.http.put<any>(`${API_URL}/Answer/${answerId}`, answer);
  }

  getAnswerById(answerId: string): Observable<Answer> {
    return this.http.get<Answer>(`${API_URL}/Answer/${answerId}`);
  }

  deleteAnswer(answerId: string): Observable<any> {
    return this.http.delete<any>(`${API_URL}/Answer/${answerId}`);
  }

  // question
  getQuestionById(questionId: string): Observable<Question> {
    return this.http.get<Question>(`${API_URL}/Question/${questionId}`);
  }

  addQuestion(question: AddQuestion): Observable<any> {
    return this.http.post<any>(`${API_URL}/Question`, question);
  }

  updateQuestion(questionId: string, question: AddQuestion): Observable<any> {
    return this.http.put<any>(`${API_URL}/Question/${questionId}`, question);
  }

  deleteQuestion(questionId: string): Observable<any> {
    return this.http.delete<any>(`${API_URL}/Question/${questionId}`);
  }
}
