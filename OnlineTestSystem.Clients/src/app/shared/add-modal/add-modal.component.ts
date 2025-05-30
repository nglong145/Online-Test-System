import {
  Component,
  HostListener,
  Inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
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
  DateAdapter,
  MAT_DATE_FORMATS,
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
  catchError,
} from 'rxjs/operators';
import { of, ReplaySubject, Subject, Subscription } from 'rxjs';
import { CustomDateAdapter } from '../custom-date-picker/custom-date-adapter';
import { MY_DATE_FORMATS } from '../custom-date-picker/custom-date.model';
import { DialogService } from '../services/dialog.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

export type FieldType =
  | 'text'
  | 'password'
  | 'textarea'
  | 'select'
  | 'date'
  | 'datetime'
  | 'autocomplete-api'
  | 'select-search-api'
  | 'file';

export interface FieldConfig {
  label: string;
  name: string;
  type: FieldType;
  hide?: boolean;
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
  selector: 'app-add-modal',
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
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './add-modal.component.html',
  styleUrl: './add-modal.component.scss',
})
export class AddModalComponent implements OnInit, OnDestroy {
  formData: any = {};
  fields: FieldConfig[] = [];
  submitButtonText = 'Lưu';
  title = '';
  timeHint: string = '';
  searchCtrl = new FormControl('');
  submitAction: (formData: any) => void = () => {};
  isLoading = false;
  originalFormData: any = {};
  loadedFields: Set<string> = new Set<string>();
  apiCache: { [key: string]: { timestamp: number; data: any[] } } = {};
  cacheExpiration = 60000; // 1 phút

  // File upload properties
  fileToUpload: File | null = null;
  fileError: string = '';
  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedFileTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];
  allowedExtensions = ['.doc', '.docx', '.xls', '.xlsx'];

  searchSubject = new Subject<{ field: FieldConfig; query: string }>();
  private subscription = new Subscription();
  private destroy$ = new Subject<void>();

  selectSearchFilterControls: { [key: string]: FormControl } = {};
  selectSearchFilteredOptions: { [key: string]: ReplaySubject<any[]> } = {};

  constructor(
    public dialogRef: MatDialogRef<AddModalComponent>,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) public data: any
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

    // Thiết lập search debounce
    this.setupSearch();

    // Cài đặt time hint
    this.setupTimeHint();

    // Load initial options for API fields
    this.loadInitialOptions();

    this.initSelectSearchControls();
  }

  initSelectSearchControls(): void {
    this.fields.forEach((field) => {
      if (field.type === 'select-search-api') {
        // Create a filter control for this field
        this.selectSearchFilterControls[field.name] = new FormControl('');
        // Create a filtered options subject
        this.selectSearchFilteredOptions[field.name] = new ReplaySubject<any[]>(
          1
        );

        // Subscribe to filter changes
        this.selectSearchFilterControls[field.name].valueChanges
          .pipe(
            takeUntil(this.destroy$),
            debounceTime(300),
            distinctUntilChanged()
          )
          .subscribe((filterValue) => {
            // Trigger API search when filter value changes
            this.onSearch(field, filterValue || '');
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

  initializeFormData(): void {
    this.fields.forEach((field) => {
      if (field.type === 'datetime') {
        const now = new Date();
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

  loadingFields: Set<string> = new Set<string>();

  setupSearch(): void {
    const searchSub = this.searchSubject
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) =>
            prev.field.name === curr.field.name && prev.query === curr.query
        ),
        switchMap(({ field, query }) => {
          if (!field.apiService || !field.apiMethod) return of([]);

          // Đánh dấu field này đã tải dữ liệu
          this.loadedFields.add(field.name);

          // Tạo cache key
          const cacheKey = `${field.name}_${query}`;

          // Kiểm tra cache
          const now = Date.now();
          if (
            this.apiCache[cacheKey] &&
            now - this.apiCache[cacheKey].timestamp < this.cacheExpiration
          ) {
            return of({ items: this.apiCache[cacheKey].data });
          }

          this.loadingFields.add(field.name);
          this.isLoading = true;

          const {
            pageSize = 10,
            sortBy = 'name',
            sortOrder = 'asc',
            extraParams = {},
          } = field.apiConfig || {};

          const hasRoleParam =
            field.apiConfig?.extraParams?.hasOwnProperty('role');

          let apiCall;
          if (hasRoleParam) {
            const role = field.apiConfig?.extraParams?.['role'] ?? '';
            apiCall = field.apiService[field.apiMethod](
              role,
              1,
              pageSize,
              sortBy,
              sortOrder,
              {
                [field.apiFieldName ?? 'name']: query,
                ...extraParams,
              }
            );
          } else {
            // Không truyền tham số role khi API không yêu cầu
            apiCall = field.apiService[field.apiMethod](
              1,
              pageSize,
              sortBy,
              sortOrder,
              {
                [field.apiFieldName ?? 'name']: query,
                ...extraParams,
              }
            );
          }

          return apiCall.pipe(
            finalize(() => {
              this.loadingFields.delete(field.name);

              if (this.loadingFields.size === 0) {
                this.isLoading = false;
              }
            }),
            catchError((error) => {
              return of({ items: [] });
            })
          );
        })
      )
      .subscribe((result: any) => {
        if (!result) return;

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

          const mappedItems = result.items.map(mapFn) ?? [];
          apiField.options = mappedItems;

          // Lưu vào cache
          const cacheKey = `${apiField.name}_${
            this.selectSearchFilterControls[apiField.name]?.value || ''
          }`;
          this.apiCache[cacheKey] = {
            timestamp: Date.now(),
            data: result.items,
          };

          // Lưu lại options gốc để lọc cục bộ
          this.originalOptions[apiField.name] = [...mappedItems];
        }
      });

    this.subscription.add(searchSub);
  }

  originalOptions: { [key: string]: any[] } = {};

  setupTimeHint(): void {
    const lang = navigator.language || 'en';
    if (lang.startsWith('vi')) {
      this.timeHint = 'HH:mm (12 giờ)';
    } else if (lang.startsWith('en')) {
      this.timeHint = 'HH:mm (12 giờ)';
    } else {
      this.timeHint = 'HH:mm (12 giờ)';
    }
  }

  loadInitialOptions(): void {
    this.fields.forEach((field) => {
      if (
        (field.type === 'select-search-api' ||
          field.type === 'autocomplete-api') &&
        field.apiService &&
        field.apiMethod &&
        this.formData[field.name]
      ) {
        const {
          pageSize = 10,
          sortBy = 'name',
          sortOrder = 'asc',
          extraParams = {},
        } = field.apiConfig || {};

        const hasRoleParam =
          field.apiConfig?.extraParams?.hasOwnProperty('role');

        let apiCall;
        if (hasRoleParam) {
          const role = extraParams['role'] ?? '';
          apiCall = field.apiService[field.apiMethod](
            role,
            1,
            pageSize,
            sortBy,
            sortOrder,
            extraParams
          );
        } else {
          // Không truyền tham số role khi API không yêu cầu
          apiCall = field.apiService[field.apiMethod](
            1,
            pageSize,
            sortBy,
            sortOrder,
            extraParams
          );
        }

        apiCall.subscribe({
          next: (result: any) => {
            // ... existing code
          },
          error: (error: any) => {},
        });
      }
    });
  }

  filterLocalOptions(field: FieldConfig, filterValue: string): void {
    if (!filterValue || !this.originalOptions[field.name]) {
      // Nếu không có giá trị lọc hoặc không có dữ liệu gốc, sử dụng API search
      this.onSearch(field, filterValue);
      return;
    }

    // Nếu có ít kết quả (dưới 100 item), thực hiện lọc cục bộ
    if (this.originalOptions[field.name].length < 100) {
      const lowerFilter = filterValue.toLowerCase();
      field.options = this.originalOptions[field.name].filter((option) =>
        option.label.toLowerCase().includes(lowerFilter)
      );
    } else {
      // Nếu có quá nhiều kết quả, sử dụng API search
      this.onSearch(field, filterValue);
    }
  }

  handleSelectOpened(isOpen: boolean, field: FieldConfig): void {
    if (isOpen && field.type === 'select-search-api') {
      // Chỉ gọi API khi chưa tải dữ liệu trước đó hoặc không có tùy chọn
      if (
        !this.loadedFields.has(field.name) ||
        !field.options ||
        field.options.length === 0
      ) {
        this.onSearch(field, '');
      }

      // Đánh dấu control là đã touched để validate nếu cần
      setTimeout(() => {
        const control = document.getElementsByName(field.name)[0];
        if (control) {
          control.dispatchEvent(new Event('blur'));
        }
      });
    }
  }

  hasUnsavedChanges(): boolean {
    return (
      JSON.stringify(this.formData) !== JSON.stringify(this.originalFormData)
    );
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
        .subscribe((result) => {
          if (result) {
            this.dialogRef.close();
          }
        });
    } else {
      this.dialogRef.close();
    }
  }

  // File handling methods
  getFileAcceptTypes(): string {
    return this.allowedExtensions.join(',');
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError = '';

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!this.isValidFileType(file)) {
        this.fileError =
          'Chỉ hỗ trợ file Word (.doc, .docx) và Excel (.xls, .xlsx)';
        this.clearFileInput(input);
        return;
      }

      // Validate file size
      if (file.size > this.maxFileSize) {
        this.fileError = `Kích thước file không được vượt quá ${
          this.maxFileSize / (1024 * 1024)
        }MB`;
        this.clearFileInput(input);
        return;
      }

      this.fileToUpload = file;
    }
  }

  isValidFileType(file: File): boolean {
    // Check by MIME type
    if (this.allowedFileTypes.includes(file.type)) {
      return true;
    }

    // Check by extension (fallback)
    const fileName = file.name.toLowerCase();
    return this.allowedExtensions.some((ext) => fileName.endsWith(ext));
  }

  clearFile(): void {
    this.fileToUpload = null;
    this.fileError = '';

    // Reset input file
    const fileInput = document.querySelector(
      'input[type=file]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  clearFileInput(input: HTMLInputElement): void {
    input.value = '';
    this.fileToUpload = null;
  }

  getFileIcon(file: File): string {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return 'description';
    } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return 'table_chart';
    }
    return 'attach_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Form submission and validation
  onSubmit(mainForm: NgForm): void {
    if (mainForm.invalid) {
      Object.values(mainForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }

    if (this.submitAction) {
      const formDataToSubmit = { ...this.formData };

      if (this.fileToUpload) {
        formDataToSubmit.file = this.fileToUpload;
      }

      this.processFormData(formDataToSubmit);

      this.isLoading = true;
      try {
        this.submitAction(formDataToSubmit);
        this.isLoading = false;
      } catch (error) {
        console.error('Error submitting form:', error);
        this.isLoading = false;
      }
    }
  }

  processFormData(formDataToSubmit: any): void {
    this.fields.forEach((field) => {
      if (field.type === 'date') {
        const date = formDataToSubmit[field.name];
        if (date instanceof Date) {
          formDataToSubmit[field.name] = this.formatDateToYYYYMMDD(date);
        }
      }

      if (field.type === 'datetime') {
        const date = formDataToSubmit[field.name];
        const time = formDataToSubmit[field.name + '_time'] || '00:00';

        if (date) {
          const [hours, minutes] = time.split(':');
          const localDate = new Date(date);

          localDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          const offset = localDate.getTimezoneOffset();
          const localISOTime = new Date(
            localDate.getTime() - offset * 60 * 1000
          ).toISOString();

          formDataToSubmit[field.name] = localISOTime;
        }
      }
    });
  }

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Utility methods
  onSearch(field: FieldConfig, query: string): void {
    if (field.type === 'autocomplete-api' && !query) {
      this.formData[field.name] = null;
    }

    // Luôn gửi yêu cầu tìm kiếm, ngay cả khi query rỗng
    this.searchSubject.next({ field, query });
  }

  onSearchFromInput(event: Event, field: FieldConfig): void {
    const target = event.target as HTMLInputElement;
    const value = target?.value ?? '';
    this.onSearch(field, value);
  }

  onOptionSelected(field: FieldConfig, event: any): void {
    this.formData[field.name] = event.option.value;
  }

  getOptionLabel(field: FieldConfig, value: any): string {
    const option = field.options?.find((o) => o.value === value);
    return option ? option.label : '';
  }

  togglePassword(field: FieldConfig): void {
    field.hide = !field.hide;
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
      password: `Nhập ${field.label.toLowerCase()}`,
      textarea: `Nhập ${field.label.toLowerCase()}`,
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
      name: 'badge',
      firstName: 'person',
      lastName: 'person',
      email: 'email',
      phone: 'phone',
      phoneNumber: 'phone',
      address: 'location_on',
      description: 'description',
      userManager: 'supervisor_account',
      category: 'category',
      file: 'attach_file',
      password: 'lock',
      confirmPassword: 'lock',
      studentCode: 'badge',
    };
    return icons[field.name] || 'info';
  }

  getHeaderIcon(): string {
    if (this.title.includes('Thêm')) return 'add_circle';
    if (this.title.includes('Sửa') || this.title.includes('Chỉnh sửa'))
      return 'edit';
    return 'add';
  }

  getSubmitIcon(): string {
    if (this.submitButtonText.includes('Tạo')) return 'add';
    if (this.submitButtonText.includes('Cập nhật')) return 'save';
    if (this.submitButtonText.includes('Thêm')) return 'add';
    return 'check';
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

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }
}
