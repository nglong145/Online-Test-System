import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FilterGroupByManager } from '../models/group.model';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  constructor(private http: HttpClient) {}

  getFilterGroupByManager(
    manager: string,
    index: number,
    size: number,
    name: string
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/Group/filter-by-manager/${manager}?pageIndex=${index}&pageSize=${size}`,
      name
    );
  }
}
