import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Bank, CreateBank, FilterBank, UpdateBank } from '../models/bank.model';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';
import { BankWithQuestions, Enum } from '../models/bank-detail.model';

@Injectable({
  providedIn: 'root',
})
export class BankService {
  constructor(private http: HttpClient) {}

  getFilterBank(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterBank
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/QuestionBank/Filter?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  addBank(bank: CreateBank): Observable<any> {
    return this.http.post<any>(`${API_URL}/QuestionBank`, bank);
  }

  getBankById(bankId: string): Observable<Bank> {
    return this.http.get<Bank>(`${API_URL}/QuestionBank/${bankId}`);
  }

  updateBank(bankId: string, bank: UpdateBank): Observable<any> {
    return this.http.put<any>(`${API_URL}/QuestionBank/${bankId}`, bank);
  }

  uploadCreateBank(
    file: File,
    name: string,
    ownerId: string,
    quizCategoryId?: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('ownerId', ownerId);
    if (quizCategoryId) {
      formData.append('quizCategoryId', quizCategoryId);
    }

    return this.http.post<any>(
      `${API_URL}/QuestionBank/upload-create-bank`,
      formData
    );
  }

  // get abnk detail with questions include answers
  getBankWithQuestionsAnswers(bankId: string): Observable<BankWithQuestions> {
    return this.http.get<BankWithQuestions>(
      `${API_URL}/QuestionBank/${bankId}/full-detail`
    );
  }

  //get enuem type & level from BE
  getQuestionType(): Observable<Enum[]> {
    return this.http.get<Enum[]>(`${API_URL}/Enums/question-types`);
  }

  getQuestionLevel(): Observable<Enum[]> {
    return this.http.get<Enum[]>(`${API_URL}/Enums/question-levels`);
  }
}
