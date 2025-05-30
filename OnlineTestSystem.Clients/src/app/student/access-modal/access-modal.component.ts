import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, NgForm } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-access-modal',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
  templateUrl: './access-modal.component.html',
  styleUrl: './access-modal.component.scss',
})
export class AccessModalComponent {
  accessCode: string = '';
  error: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AccessModalComponent>
  ) {}

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.accessCode.trim() === '') {
      this.error = 'Vui lòng nhập mã truy cập';
      return;
    }
    this.dialogRef.close(this.accessCode.trim());
  }
}
