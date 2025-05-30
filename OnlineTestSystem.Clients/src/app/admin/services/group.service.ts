import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AddGroup,
  FilterGroup,
  FilterUserGroup,
  Group,
  UpdateGroup,
  UserGroup,
} from '../models/group.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { API_URL } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private groupUpdateSubject = new BehaviorSubject<boolean>(false);
  groupUpdate$ = this.groupUpdateSubject.asObservable();
  constructor(private http: HttpClient) {}

  getFilterGroupByManager(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterGroup
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/Group/filter-by-manager?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  getFilteredGroups(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterGroup
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/Group/filter?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  getGroupById(groupId: string): Observable<Group> {
    return this.http.get<Group>(`${API_URL}/Group/${groupId}`);
  }

  addGroup(group: AddGroup): Observable<any> {
    return new Observable((observer) => {
      this.http.post<any>(`${API_URL}/Group`, group).subscribe({
        next: (response) => {
          this.groupUpdateSubject.next(true); // Emit update signal
          observer.next(response);
          observer.complete();
        },
        error: (error) => observer.error(error),
      });
    });
  }

  updateGroup(groupId: string, group: UpdateGroup): Observable<any> {
    return this.http.put<any>(`${API_URL}/Group/${groupId}`, group);
  }

  // Optional: Method to notify about updates
  notifyGroupUpdate() {
    this.groupUpdateSubject.next(true);
  }

  // UserGRoup

  getFilteredUserGroups(
    index: number,
    size: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterUserGroup
  ): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/GroupExtend/filter-user-group?pageIndex=${index}&pageSize=${size}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      filter
    );
  }

  addUserGroup(groupId: string, userId: string): Observable<any> {
    return this.http.post<any>(
      `${API_URL}/GroupExtend/${groupId}/User/${userId}`,
      {}
    );
  }

  deleteUserGroup(groupId: string, userId: string): Observable<any> {
    return this.http.delete<any>(
      `${API_URL}/GroupExtend/${groupId}/User/${userId}`,
      {}
    );
  }
}
