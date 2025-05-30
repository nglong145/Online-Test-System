import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private config: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    const config = {
      ...this.config,
      panelClass: ['mat-mdc-snack-bar-container', 'snackbar-success'],
    };
    this.snackBar.open(message, 'Đóng', config);
  }

  error(message: string): void {
    const config = {
      ...this.config,
      panelClass: ['mat-mdc-snack-bar-container', 'snackbar-error'],
    };
    this.snackBar.open(message, 'Đóng', config);
  }

  warning(message: string): void {
    const config = {
      ...this.config,
      panelClass: ['mat-mdc-snack-bar-container', 'snackbar-warning'],
    };
    this.snackBar.open(message, 'Đóng', config);
  }

  info(message: string): void {
    const config = {
      ...this.config,
      panelClass: ['mat-mdc-snack-bar-container', 'snackbar-info'],
    };
    this.snackBar.open(message, 'Đóng', config);
  }
}
