import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { HeaderComponent } from '../../layout/components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  imports: [HeaderComponent, MatIconModule],
  templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.scss',
})
export class AccessDeniedComponent {
  // constructor(private location: Location) {}
  // goBack() {
  //   this.location.back();
  // }

  constructor(
    private location: Location,
    private authService: AuthService,
    private router: Router
  ) {}

  goBack() {
    const lastUrl = this.location.path();
    if (lastUrl === '/access-denied') {
      // Nếu người dùng vào trang access-denied trực tiếp, điều hướng theo role
      const role = this.authService.getUserRole();

      if (role === 'Admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (role === 'Teacher') {
        this.router.navigate(['/teacher/dashboard']);
      } else if (role === 'Student') {
        this.router.navigate(['/student/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    } else {
      this.location.back();
    }
  }
}
