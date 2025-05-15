import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Bank, CreateBank, FilterBank, UpdateBank } from '../models/bank.model';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';

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
}
