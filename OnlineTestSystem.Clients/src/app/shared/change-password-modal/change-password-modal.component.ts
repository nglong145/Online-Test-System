import { Component, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../admin/services/user.service';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { SnackbarService } from '../services/snackbar.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-change-password-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './change-password-modal.component.html',
  styleUrl: './change-password-modal.component.scss',
})
export class ChangePasswordModalComponent implements OnDestroy {
  changePasswordForm: FormGroup;
  passwordStrength: number = 0; // 0-3 scale
  isSubmitting: boolean = false;

  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private cookieService: CookieService,
    private notification: SnackbarService,
    private dialogRef: MatDialogRef<ChangePasswordModalComponent>
  ) {
    this.changePasswordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: [this.passwordMatchValidator],
      }
    );

    // Monitor password strength
    this.changePasswordForm
      .get('newPassword')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((password) => {
        this.passwordStrength = this.calculatePasswordStrength(password);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculatePasswordStrength(password: string): number {
    if (!password) return 0;

    let strength = 0;

    // Has uppercase
    if (/[A-Z]/.test(password)) strength++;

    // Has number and special character
    if (
      /\d/.test(password) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    )
      strength++;

    // Length >= 10
    if (password.length >= 10) strength++;

    return strength;
  }

  toggleCurrentPasswordVisibility() {
    this.hideCurrentPassword = !this.hideCurrentPassword;
  }

  toggleNewPasswordVisibility() {
    this.hideNewPassword = !this.hideNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  getOwnerIdFromToken(): string {
    let token = this.cookieService.get('Authentication');
    if (!token) return '';
    token = token.replace(/^Bearer\s*/i, '').replace(/^Bearer%20/i, '');
    try {
      const decoded: any = jwtDecode(token);

      return (
        decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ] || ''
      );
    } catch (e) {
      return '';
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;

    // Nếu confirm khác pass thì trả về lỗi, bao gồm cả trường hợp confirm rỗng
    if (pass !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.changePasswordForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const { currentPassword, newPassword } = this.changePasswordForm.value;
    const userId = this.getOwnerIdFromToken();

    this.userService
      .changePasssword({ userId, currentPassword, newPassword })
      .subscribe({
        next: (res) => {
          this.notification.success(res.message || 'Đổi mật khẩu thành công!');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.notification.error(
            err.error?.message || 'Đổi mật khẩu thất bại!'
          );
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
  }
}
