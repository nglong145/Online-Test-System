import { Component } from '@angular/core';
import { HeaderComponent } from '../../layout/components/header/header.component';
import { AuthService } from '../../core/auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [HeaderComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  // constructor(private authService: AuthService) {}
  // goHome() {
  //   const role = this.authService.getUserRole();
  //   if (role === 'Admin') {
  //     window.location.href = '/admin';
  //   } else if (role === 'Teacher') {
  //     window.location.href = '/teacher';
  //   } else {
  //     window.location.href = '/student';
  //   }
  // }

  constructor(private authService: AuthService, private router: Router) {}

  goHome() {
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
  }
}
