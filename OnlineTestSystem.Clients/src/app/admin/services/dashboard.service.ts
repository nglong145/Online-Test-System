import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';
import {
  DashboardSummary,
  ExamAverageScore,
  FilterDashboard,
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${API_URL}/Dashboard/summary`);
  }

  getFilterChart(filter: FilterDashboard): Observable<ExamAverageScore[]> {
    return this.http.post<ExamAverageScore[]>(
      `${API_URL}/Dashboard/exam-average-scores`,
      filter
    );
  }
}
