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
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Example: Set different nav items based on user role
    // const role = this.authService.getUserRole();
    const role = 'Admin';
    if (role === 'Admin') {
      this.navItems = [
        { name: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
        { name: 'Teachers', icon: 'school', route: 'teacher' },
        { name: 'Students', icon: 'people', route: 'student' },
        { name: 'Exams', icon: 'assignment', route: 'exam' },
        { name: 'Groups', icon: 'group', route: 'group' },
      ];
    }
  }
}
