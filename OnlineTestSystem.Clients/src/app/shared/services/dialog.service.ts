import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      panelClass: 'confirm-dialog',
      data: data,
      disableClose: true,
    });

    return dialogRef.afterClosed();
  }

  // Hàm helper để nhanh chóng hiển thị dialog xóa
  confirmDelete(itemName: string): Observable<boolean> {
    return this.confirm({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa ${itemName}?`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
    });
  }
}
