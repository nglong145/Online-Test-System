import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UserQuiz } from '../models/userQuiz.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-quiz-delete-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon class="warning-icon">warning</mat-icon>
        Xác nhận hủy bài thi
      </h2>

      <mat-dialog-content>
        <p>
          Bạn đang yêu cầu hủy bài thi của
          <strong>{{ data.quiz.lastName }} {{ data.quiz.firstName }}</strong>
          cho đề thi <strong>{{ data.quiz.quizName }}</strong
          >.
        </p>

        <p class="warning-text">
          Việc hủy bài thi là không thể khôi phục. Sinh viên sẽ phải làm lại từ
          đầu.
        </p>

        <p>Để xác nhận, vui lòng nhập chính xác họ tên và mã sinh viên:</p>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Họ và tên sinh viên</mat-label>
          <input
            matInput
            [(ngModel)]="confirmFullName"
            placeholder="Nhập đúng họ và tên sinh viên"
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Mã sinh viên</mat-label>
          <input
            matInput
            [(ngModel)]="confirmStudentCode"
            placeholder="Nhập đúng mã sinh viên"
          />
        </mat-form-field>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Hủy</button>
        <button
          mat-raised-button
          color="warn"
          (click)="confirmDelete()"
          [disabled]="!confirmFullName || !confirmStudentCode"
        >
          Xác nhận hủy
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        padding: 16px;
      }

      .warning-icon {
        color: #f44336;
        vertical-align: middle;
        margin-right: 8px;
      }

      .warning-text {
        color: #f44336;
        font-weight: 500;
        margin: 16px 0;
        padding: 8px;
        background-color: rgba(244, 67, 54, 0.1);
        border-radius: 4px;
        border-left: 4px solid #f44336;
      }

      .full-width {
        width: 100%;
        margin-bottom: 8px;
      }

      .error-message {
        color: #f44336;
        font-size: 0.85rem;
        margin-top: 12px;
        padding: 8px;
        background-color: rgba(244, 67, 54, 0.08);
        border-radius: 4px;
      }
    `,
  ],
})
export class UserQuizDeleteConfirmDialogComponent {
  confirmFullName: string = '';
  confirmStudentCode: string = '';
  errorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<UserQuizDeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { quiz: UserQuiz }
  ) {}

  confirmDelete(): void {
    const expectedFullName = `${this.data.quiz.lastName} ${this.data.quiz.firstName}`;
    const expectedStudentCode = this.data.quiz.studentCode;

    if (this.confirmFullName.trim() !== expectedFullName.trim()) {
      this.errorMessage = 'Họ tên sinh viên không chính xác';
      return;
    }

    if (this.confirmStudentCode.trim() !== expectedStudentCode.trim()) {
      this.errorMessage = 'Mã sinh viên không chính xác';
      return;
    }

    this.dialogRef.close(true);
  }
}
