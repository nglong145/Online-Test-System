import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { SideBarComponent } from '../components/side-bar/side-bar.component';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [HeaderComponent, SideBarComponent, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  navItems: any[] = [];
  isMobileMenuOpen: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Example: Set different nav items based on user role
    const role = this.authService.getUserRole();
    if (role === 'Admin') {
      this.navItems = [
        { name: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
        { name: 'Giáo viên', icon: 'school', route: 'teacher' },
        { name: 'Sinh viên', icon: 'people', route: 'student' },
        { name: 'Nhóm', icon: 'groups', route: 'group' },
        { name: 'Danh mục', icon: 'category', route: 'category' },
        { name: 'Ngân hàng câu hỏi', icon: 'quiz', route: 'bank' },
        { name: 'Đề thi', icon: 'description', route: 'quiz' },
        { name: 'Kỳ thi', icon: 'event', route: 'exam' },
      ];
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
