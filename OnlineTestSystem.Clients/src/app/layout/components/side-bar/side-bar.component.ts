import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
export class SideBarComponent implements OnInit, OnChanges {
  @Input() navItems: any[] | undefined;

  activeItem: string = '';

  constructor() {}

  ngOnInit(): void {
    if (!this.navItems || this.navItems.length === 0) {
      this.setDefaultNavItems();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['navItems']) {
      if (!this.navItems || this.navItems.length === 0) {
        this.setDefaultNavItems();
      }
    }
  }

  setDefaultNavItems(): void {
    this.navItems = [
      { name: 'Dashboard', icon: 'dashboard', route: 'dashboard' },
      { name: 'Teachers', icon: 'school', route: 'teacher' },
      { name: 'Students', icon: 'people', route: 'student' },
    ];
  }

  setActive(item: string): void {
    this.activeItem = item;
  }

  isActive(item: string): boolean {
    return this.activeItem === item;
  }
}
