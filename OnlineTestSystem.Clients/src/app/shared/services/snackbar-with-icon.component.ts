import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

export interface SnackbarData {
  message: string;
  icon: string;
  action?: string;
}

@Component({
  selector: 'app-snackbar-with-icon',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="snackbar-with-icon">
      <mat-icon>{{ data.icon }}</mat-icon>
      <span class="message">{{ data.message }}</span>
      <button mat-button *ngIf="data.action" (click)="snackBarRef.dismiss()">
        {{ data.action }}
      </button>
    </div>
  `,
  styles: [
    `
      .snackbar-with-icon {
        display: flex;
        align-items: center;
        color: white;
        padding: 8px 12px;
      }

      mat-icon {
        margin-right: 12px;
      }

      .message {
        flex: 1;
        padding-right: 12px;
      }

      button {
        margin: -8px -8px -8px 0;
        color: white;
      }
    `,
  ],
})
export class SnackbarWithIconComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData,
    public snackBarRef: MatSnackBarRef<SnackbarWithIconComponent>
  ) {}
}
