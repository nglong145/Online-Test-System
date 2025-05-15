import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginRequest } from '../models/login';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  model: LoginRequest;

  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
    private router: Router,
    private snackBar: SnackbarService
  ) {
    this.model = {
      email: '',
      password: '',
    };
  }

  emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
  passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  onSubmit(): void {
    this.authService.login(this.model).subscribe({
      next: (user) => {
        const role = this.authService.getUserRole();
        if (role === 'Admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'Teacher') {
          this.router.navigate(['/teacher']);
        } else if (role === 'Student') {
          this.router.navigate(['/student']);
        } else {
          this.router.navigate(['/login']);
        }
        this.snackBar.success('Đăng nhập thành công!');
      },
      error: (err) => {
        if (err.error?.message === 'Invalid login credentials!') {
          this.snackBar.error('Thông tin đăng nhập không hợp lệ');
        } else {
          this.snackBar.error('Lỗi từ phía máy chủ');
        }
      },
    });
  }
}
