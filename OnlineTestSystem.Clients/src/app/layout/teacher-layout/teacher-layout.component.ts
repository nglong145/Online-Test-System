import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { SideBarComponent } from '../components/side-bar/side-bar.component';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-teacher-layout',
  imports: [HeaderComponent, SideBarComponent, RouterOutlet],
  templateUrl: './teacher-layout.component.html',
  styleUrl: './teacher-layout.component.scss',
})
export class TeacherLayoutComponent implements OnInit {
  navItems: any[] = [];
  isMobileMenuOpen: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    if (role === 'Teacher') {
      this.navItems = [
        { name: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
        { name: 'Nhóm', icon: 'groups', route: 'group' },
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
