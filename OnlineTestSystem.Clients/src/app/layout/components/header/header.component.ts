import { Component, EventEmitter, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordModalComponent } from '../../../shared/change-password-modal/change-password-modal.component';
import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Output() mobileMenuToggle = new EventEmitter<void>();

  username: string = '';
  userEmail: string = '';
  userRole: string | null = null;
  hasNotifications: boolean = false;
  notificationCount: number = 0;
  isLoading: boolean = true;

  private readonly roleTranslations: { [key: string]: string } = {
    admin: 'Quản trị viên',
    teacher: 'Giáo viên',
    student: 'Sinh viên',
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private notification: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.checkNotifications();
  }

  loadUserData(): void {
    try {
      const user = this.authService.getUser();
      if (user) {
        this.username = `${user.lastName || ''} ${user.firstName || ''}`.trim();
        this.userEmail = user.email || '';
      }

      const role = this.authService.getUserRole();
      this.userRole = this.getRoleInVietnamese(role);

      this.isLoading = false;
    } catch (error) {
      console.error('Error loading user data:', error);
      this.isLoading = false;
    }
  }

  checkNotifications(): void {
    // TODO: Implement notification checking logic
    this.hasNotifications = false;
    this.notificationCount = 0;
  }

  getRoleInVietnamese(roleEng: string | null): string {
    if (!roleEng) return 'Người dùng';

    const role = roleEng.toLowerCase();
    return this.roleTranslations[role] || roleEng;
  }

  navigateHome(): void {
    const role = this.authService.getUserRole()?.toLowerCase();
    if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'teacher') {
      this.router.navigate(['/teacher/dashboard']);
    } else if (role === 'student') {
      this.router.navigate(['/student/home']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuToggle.emit();
  }

  openChangePasswordModal(): void {
    const dialogRef = this.dialog.open(ChangePasswordModalComponent, {
      width: '420px',
      maxWidth: '90vw',
      panelClass: 'change-password-dialog',
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        // Handle successful password change
        this.notification.success('Password changed successfully');
      }
    });
  }

  logout(): void {
    try {
      this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      this.notification.error(`${error}`);
      // Still navigate to login even if logout fails
      this.router.navigate(['/login']);
    }
  }
}
