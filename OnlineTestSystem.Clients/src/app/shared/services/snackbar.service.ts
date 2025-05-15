import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private config: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    this.config.panelClass = ['snackbar-success'];
    this.snackBar.open(message, 'Đóng', this.config);
  }

  error(message: string): void {
    this.config.panelClass = ['snackbar-error'];
    this.snackBar.open(message, 'Đóng', this.config);
  }

  warning(message: string): void {
    this.config.panelClass = ['snackbar-warning'];
    this.snackBar.open(message, 'Đóng', this.config);
  }

  info(message: string): void {
    this.config.panelClass = ['snackbar-info'];
    this.snackBar.open(message, 'Đóng', this.config);
  }
}
