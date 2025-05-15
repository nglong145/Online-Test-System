import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddGroup, Group, UpdateGroup } from '../models/group.model';
import { API_URL } from '../../../app.config';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  constructor(private http: HttpClient) {}

  getGroupList(): Observable<Group> {
    return this.http.get<Group>(`${API_URL}/Group`);
  }

  getFilteredGroups(
    pageIndex: number,
    pageSize: number,
    sortBy: string,
    sortOrder: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    return this.http.post<any>(`${API_URL}/Group/filter`, {}, { params });
  }

  getGroupById(groupId: string): Observable<Group> {
    return this.http.get<Group>(`${API_URL}/Group/${groupId}`);
  }

  addGroup(group: AddGroup): Observable<Group> {
    return this.http.post<Group>(`${API_URL}/Group`, group);
  }

  updateGroup(groupId: string, group: UpdateGroup): Observable<Group> {
    return this.http.put<Group>(`${API_URL}/Group/${groupId}`, group);
  }

  getUserGroup(
    groupId: string,
    pageIndex: number,
    pageSize: number
  ): Observable<Group[]> {
    return this.http.get<Group[]>(
      `${API_URL}/GroupExtend/${groupId}/users?pageIndex=${pageIndex}&pageSize=${pageSize}`
    );
  }
}
