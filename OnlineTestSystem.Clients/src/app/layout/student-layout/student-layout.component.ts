import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-student-layout',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './student-layout.component.html',
  styleUrl: './student-layout.component.scss',
})
export class StudentLayoutComponent {}
