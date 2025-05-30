import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

interface NavItem {
  name: string;
  icon: string;
  route: string;
  exact?: boolean;
  badge?: string | number;
  section?: string;
  roles?: string[]; // Thêm roles để kiểm tra quyền
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-side-bar',
  imports: [
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    CommonModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
})
export class SideBarComponent implements OnInit {
  @Input() navItems: any[] = [];
  @Input() isMobileMenuOpen: boolean = false;

  @Output() mobileMenuToggle = new EventEmitter<boolean>();
  @Output() navItemClicked = new EventEmitter<any>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  onNavItemClick(item: any): void {
    this.navItemClicked.emit(item);
    if (window.innerWidth <= 768) {
      this.closeMobileMenu();
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.mobileMenuToggle.emit(false);
  }
}
