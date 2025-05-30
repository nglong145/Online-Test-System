import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  ReactiveFormsModule,
  FormControl,
  FormsModule,
  NgForm,
} from '@angular/forms';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  finalize,
  takeUntil,
} from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { DialogService } from '../../../shared/services/dialog.service';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'date'
  | 'datetime'
  | 'autocomplete-api'
  | 'select-search-api';

export interface FieldConfig {
  label: string;
  name: string;
  type: FieldType;
  options?: { value: string | number; label: string }[];
  value?: any;
  apiService?: any;
  apiMethod?: string;
  apiFieldName?: string;
  apiParams?: Record<string, any>;
  apiConfig?: {
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    mapResult?: (item: any) => { value: any; label: string };
    extraParams?: Record<string, any>;
  };

  validators?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  errorMessages?: {
    required?: string;
    minLength?: string;
    maxLength?: string;
    pattern?: string;
  };
}

@Component({
  selector: 'app-modal-create',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatAutocompleteModule,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './modal-create.component.html',
  styleUrl: './modal-create.component.scss',
})
export class ModalCreateComponent implements OnInit, OnDestroy {
  formData: any = {};
  fields: FieldConfig[] = [];
  submitButtonText = 'Lưu';
  title = '';
  searchControls: Map<string, FormControl> = new Map();
  submitAction: (formData: any) => void = () => {};
  isLoading = false;
  originalFormData: any = {};

  searchSubject = new Subject<{ field: FieldConfig; query: string }>();
  private subscription = new Subscription();
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ModalCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogService: DialogService
  ) {
    this.title = data.title ?? 'Thêm mới';
    this.submitButtonText = data.submitButtonText ?? 'Lưu';
    this.fields = data.fields ?? [];
    this.submitAction = data.submitAction;
  }

  ngOnInit(): void {
    // Khởi tạo giá trị mặc định cho các trường
    this.initializeFormData();

    // Lưu lại trạng thái ban đầu để kiểm tra thay đổi
    this.originalFormData = JSON.parse(JSON.stringify(this.formData));

    // Thiết lập search controls cho từng field
    this.initializeSearchControls();

    // Thiết lập search debounce
    this.setupSearch();

    // Cài đặt giá trị mặc định cho các trường select-search-api
    this.loadInitialOptions();
  }

  initializeFormData(): void {
    this.fields.forEach((field) => {
      if (field.type === 'datetime') {
        const now = new Date();
        // Format date for display
        this.formData[field.name] = field.value || now;
        this.formData[field.name + '_time'] = `${now
          .getHours()
          .toString()
          .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      } else if (
        ['select', 'select-search-api', 'autocomplete-api'].includes(field.type)
      ) {
        this.formData[field.name] = field.value ?? null;
      } else {
        this.formData[field.name] = field.value ?? '';
      }
    });
  }

  initializeSearchControls(): void {
    this.fields.forEach((field) => {
      if (
        field.type === 'select-search-api' ||
        field.type === 'autocomplete-api'
      ) {
        this.searchControls.set(field.name, new FormControl(''));
      }
    });
  }

  getSearchControl(field: FieldConfig): FormControl {
    return this.searchControls.get(field.name) || new FormControl('');
  }

  setupSearch(): void {
    const searchSub = this.searchSubject
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged((prev, curr) => prev.query === curr.query),
        switchMap(({ field, query }) => {
          if (!field.apiService || !field.apiMethod) return [];
          this.isLoading = true;

          // lấy role tương tự
          const role = field.apiConfig?.extraParams?.['role'] ?? '';

          return field.apiService[field.apiMethod](
            role,
            1,
            field.apiConfig?.pageSize ?? 10,
            field.apiConfig?.sortBy ?? 'name',
            field.apiConfig?.sortOrder ?? 'asc',
            {
              [field.apiFieldName ?? 'name']: query,
              ...field.apiConfig?.extraParams,
            }
          ).pipe(finalize(() => (this.isLoading = false)));
        })
      )
      .subscribe((result: any) => {
        const apiField = this.fields.find(
          (f) => f.type === 'autocomplete-api' || f.type === 'select-search-api'
        );
        if (apiField && result?.items) {
          const mapFn =
            apiField.apiConfig?.mapResult ||
            ((item: any) => ({
              value: item.id,
              label: item.name,
            }));

          apiField.options = result.items.map(mapFn) ?? [];
        }
      });

    this.subscription.add(searchSub);
  }

  loadInitialOptions(): void {
    // Load initial options for all select-search-api fields
    this.fields.forEach((field) => {
      if (
        (field.type === 'select-search-api' ||
          field.type === 'autocomplete-api') &&
        field.apiService &&
        field.apiMethod
      ) {
        const {
          pageSize = 10,
          sortBy = 'name',
          sortOrder = 'asc',
          extraParams = {},
        } = field.apiConfig || {};

        const role = extraParams['role'] ?? '';

        field.apiService[field.apiMethod](
          role,
          1,
          pageSize,
          sortBy,
          sortOrder,
          extraParams
        ).subscribe({
          next: (result: any) => {
            if (result && result.items) {
              const mapFn =
                field.apiConfig?.mapResult ||
                ((item: any) => ({
                  value: item.id,
                  label: item.name,
                }));

              field.options = result.items.map(mapFn);
            }
          },
          error: (error: any) => {
            console.error(`Error loading options for ${field.name}:`, error);
          },
        });
      }
    });
  }

  closeModal(): void {
    if (this.hasUnsavedChanges()) {
      this.dialogService
        .confirm({
          title: 'Xác nhận',
          message:
            'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát không?',
          confirmText: 'Thoát',
          cancelText: 'Ở lại',
        })
        .subscribe((confirmed) => {
          if (confirmed) {
            this.dialogRef.close();
          }
        });
    } else {
      this.dialogRef.close();
    }
  }

  onSubmit(mainForm: NgForm): void {
    if (mainForm.invalid) {
      // Đánh dấu toàn bộ các trường để hiện lỗi ra UI
      Object.values(mainForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    if (this.submitAction) {
      const formDataToSubmit = { ...this.formData };

      this.fields.forEach((field) => {
        if (field.type === 'datetime') {
          const date = formDataToSubmit[field.name];
          const time = formDataToSubmit[field.name + '_time'] || '00:00';

          if (date) {
            const [hours, minutes] = time.split(':');
            const localDate = new Date(date);

            // Set hours and minutes while preserving the local timezone
            localDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            // Convert to ISO string while preserving the local timezone offset
            const offset = localDate.getTimezoneOffset();
            const localISOTime = new Date(
              localDate.getTime() - offset * 60 * 1000
            ).toISOString();

            formDataToSubmit[field.name] = localISOTime;
          }
        }
      });

      this.isLoading = true;
      try {
        this.submitAction(formDataToSubmit);
      } catch (error) {
        console.error('Error submitting form:', error);
        this.isLoading = false;
      }
    }
  }

  formatDisplayDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  }

  parseDisplayDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map((num) => parseInt(num));
    return new Date(year, month - 1, day);
  }

  onSearch(field: FieldConfig, query: string): void {
    if (!query && field.type === 'autocomplete-api') {
      this.formData[field.name] = null;
    }
    this.searchSubject.next({ field, query });
  }

  onSearchFromInput(event: Event, field: FieldConfig): void {
    const target = event.target as HTMLInputElement;
    const query = target?.value ?? '';
    this.onSearch(field, query);
  }

  onOptionSelected(field: FieldConfig, event: any): void {
    this.formData[field.name] = event.option.value;
  }

  getOptionLabel(field: FieldConfig, value: any): string {
    const option = field.options?.find((o) => o.value === value);
    return option ? option.label : '';
  }

  getFieldError(field: FieldConfig, ngModel: any): string | null {
    if (!ngModel) return null;
    if (ngModel.errors?.required)
      return field.errorMessages?.required || `${field.label} là bắt buộc`;
    if (ngModel.errors?.minlength)
      return (
        field.errorMessages?.minLength ||
        `Tối thiểu ${ngModel.errors.minlength.requiredLength} ký tự`
      );
    if (ngModel.errors?.maxlength)
      return (
        field.errorMessages?.maxLength ||
        `Tối đa ${ngModel.errors.maxlength.requiredLength} ký tự`
      );
    if (ngModel.errors?.pattern)
      return field.errorMessages?.pattern || 'Không đúng định dạng';
    return null;
  }

  getPlaceholder(field: FieldConfig): string {
    const placeholders: Record<string, string> = {
      text: `Nhập ${field.label.toLowerCase()}`,
      textarea: `Nhập ${field.label.toLowerCase()} (không bắt buộc)`,
      select: `Chọn ${field.label.toLowerCase()}`,
      'select-search-api': `Chọn ${field.label.toLowerCase()}`,
      'autocomplete-api': `Tìm kiếm ${field.label.toLowerCase()}`,
      date: 'DD/MM/YYYY',
      datetime: 'Chọn ngày và thời gian',
    };
    return placeholders[field.type] || `Nhập ${field.label.toLowerCase()}`;
  }

  getFieldIcon(field: FieldConfig): string {
    const icons: Record<string, string> = {
      name: 'group',
      description: 'description',
      userManager: 'person',
      email: 'email',
      phone: 'phone',
      address: 'location_on',
      category: 'category',
      file: 'attach_file',
      date: 'event',
      time: 'schedule',
    };
    return icons[field.name] || 'info';
  }

  getHeaderIcon(): string {
    if (this.title.includes('Thêm')) return 'add_circle';
    if (this.title.includes('Sửa') || this.title.includes('Chỉnh sửa'))
      return 'edit';
    return 'info';
  }

  getSubmitIcon(): string {
    if (this.submitButtonText.includes('Tạo')) return 'add';
    if (this.submitButtonText.includes('Cập nhật')) return 'save';
    return 'check';
  }

  hasUnsavedChanges(): boolean {
    return (
      JSON.stringify(this.formData) !== JSON.stringify(this.originalFormData)
    );
  }

  // TrackBy functions for performance
  trackByFieldName(index: number, field: FieldConfig): string {
    return field.name;
  }

  trackByOptionValue(
    index: number,
    option: { value: any; label: string }
  ): any {
    return option.value;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }
}
