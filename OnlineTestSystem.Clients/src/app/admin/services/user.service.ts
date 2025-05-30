import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';
import {
  ChangePassword,
  CreateUser,
  FilterUser,
  UpdateUser,
  User,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getFilterUser(
    role: string,
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterUser
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/User/filter?role=${role}&pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${API_URL}/User/get-user/${userId}`);
  }

  addUser(user: CreateUser): Observable<any> {
    return this.http.post<any>(`${API_URL}/User/add-new-user`, user);
  }

  updateUser(userId: string, user: User): Observable<any> {
    return this.http.put<any>(`${API_URL}/User/update-user/${userId}`, user);
  }

  changePasssword(payload: ChangePassword): Observable<any> {
    return this.http.post<any>(`${API_URL}/User/change-password`, payload);
  }
}
