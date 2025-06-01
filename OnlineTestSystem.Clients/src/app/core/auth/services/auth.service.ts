import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  Observable,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { LoginRequest, LoginResponse, User } from '../models/login';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { API_URL } from '../../../app.config';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient, private cookieService: CookieService) {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.userSubject.next(JSON.parse(userData));
    }
  }

  // login(request: LoginRequest): Observable<LoginResponse> {
  //   return this.http.post<LoginResponse>(
  //     `${API_URL}/Authentication/login`,
  //     request
  //   );
  // }
  login(request: LoginRequest): Observable<User> {
    return this.http
      .post<LoginResponse>(`${API_URL}/Authentication/login`, request)
      .pipe(
        tap((response) => {
          if (!response || !response.token) {
            throw new Error('Invalid response: Missing token');
          }
          this.cookieService.set(
            'Authentication',
            `Bearer ${response.token}`,
            undefined,
            '/',
            undefined,
            true,
            'Strict'
          );
          localStorage.setItem('token', response.token);
        }),
        switchMap(() => this.getUserInfo()),
        tap((user) => this.setUser(user)),
        catchError((err) => {
          this.logout();
          return throwError(() => err);
        })
      );
  }

  getUserInfo(): Observable<User> {
    return this.http.get<User>(`${API_URL}/Authentication/user-info`);
  }

  getUserRole(): string | null {
    try {
      // Lấy token từ cookie thay vì localStorage
      let token = this.cookieService.get('Authentication');
      if (!token) return null;

      // Xử lý đúng các dấu cách được mã hóa URL
      token = token.replace(/^Bearer\s*/i, '').replace(/^Bearer%20/i, '');

      const decodedToken: any = jwtDecode(token);

      return (
        decodedToken[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] || null
      );
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }

  setUser(user: User): void {
    this.userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Lấy thông tin người dùng hiện tại
  getUser(): User | null {
    return this.userSubject.value;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.cookieService.delete('Authentication', '/');
    this.userSubject.next(null);
  }
}
