import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Category,
  CreateCategory,
  FilterCategory,
} from '../models/category.model';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  getFilterCategory(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterCategory
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/QuizCategory/filter?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  addCategory(category: CreateCategory): Observable<any> {
    return this.http.post<any>(`${API_URL}/QuizCategory`, category);
  }

  getCategoryById(categoryId: string): Observable<Category> {
    return this.http.get<Category>(`${API_URL}/QuizCategory/${categoryId}`);
  }

  updateCategory(categoryId: string, category: Category): Observable<any> {
    return this.http.put<any>(
      `${API_URL}/QuizCategory/${categoryId}`,
      category
    );
  }

  deleteCategory(categoryId: string): Observable<any> {
    return this.http.delete<any>(`${API_URL}/QuizCategory/${categoryId}`);
  }
}
