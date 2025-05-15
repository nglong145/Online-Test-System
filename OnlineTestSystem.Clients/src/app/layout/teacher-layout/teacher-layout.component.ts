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
  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    const role = this.authService.getUserRole();
    // const role = 'Teacher';
    if (role === 'Teacher') {
      // This would typically come from a user service

      this.navItems = [
        { name: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
        { name: 'Category', icon: 'school', route: 'category' },
        { name: 'Question Bank', icon: 'people', route: 'bank' },
        { name: 'Quiz', icon: 'assignment', route: 'quiz' },
        { name: 'Question', icon: 'group', route: 'question' },
        // Add more admin-related items
      ];
    }
  }
}
