import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { DialogService } from '../../shared/services/dialog.service';
import { firstValueFrom } from 'rxjs';

export const unsavedChangesGuard: CanDeactivateFn<any> = async (
  component,
  currentRoute,
  currentState,
  nextState
) => {
  if (
    typeof component.hasUnsavedChanges === 'function' &&
    component.hasUnsavedChanges()
  ) {
    const dialog = inject(DialogService);
    return await firstValueFrom(
      dialog.confirm({
        title: 'Cảnh báo',
        message: `Bạn có thay đổi chưa lưu. Bạn chắc chắn muốn rời trang?`,
        confirmText: 'Rời đi',
        cancelText: 'Ở lại',
      })
    );
  }
  return true;
};
