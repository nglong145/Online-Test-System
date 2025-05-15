// add-modal.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

export type FieldType =
  | 'text'
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
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './add-modal.component.html',
  styleUrl: './add-modal.component.scss',
})
export class AddModalComponent {
  // formData: any = { startDate: '', startTime: '', endDate: '', endTime: '' }; // Khởi tạo formData cho các trường ngày và giờ
  // fields: any[] = [
  //   {
  //     label: 'Thời gian bắt đầu (Date)',
  //     name: 'startDate',
  //     type: 'date',
  //   },
  //   {
  //     label: 'Thời gian bắt đầu (Time)',
  //     name: 'startTime',
  //     type: 'datetime',
  //   },
  //   {
  //     label: 'Thời gian kết thúc (Date)',
  //     name: 'endDate',
  //     type: 'date',
  //   },
  //   {
  //     label: 'Thời gian kết thúc (Time)',
  //     name: 'endTime',
  //     type: 'datetime',
  //   },
  // ];
  formData: any = {};
  fields: FieldConfig[] = [];
  submitButtonText = 'Save';
  title = '';
  submitAction: (formData: any) => void = () => {};

  searchSubject = new Subject<{ field: FieldConfig; query: string }>();

  constructor(
    public dialogRef: MatDialogRef<AddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title ?? 'Modal Title';
    this.submitButtonText = data.submitButtonText ?? 'Save';
    this.fields = data.fields ?? [];

    // Set default value theo type
    this.formData = this.fields.reduce((acc, field) => {
      acc[field.name] = [
        'select',
        'select-search-api',
        'autocomplete-api',
      ].includes(field.type)
        ? field.value ?? null
        : field.value ?? '';
      return acc;
    }, {} as any);

    this.submitAction = data.submitAction;

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => prev.query === curr.query),
        switchMap(({ field, query }) => {
          if (!field.apiService || !field.apiMethod) return [];
          return field.apiService[field.apiMethod](1, 10, 'name', 'asc', {
            [field.apiFieldName ?? 'name']: query,
          });
        })
      )
      .subscribe((result: any) => {
        const apiField = this.fields.find(
          (f) => f.type === 'autocomplete-api' || f.type === 'select-search-api'
        );
        if (apiField) {
          apiField.options =
            result.items?.map((item: any) => ({
              value: item.id,
              label: item.name,
            })) ?? [];
        }
      });
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.submitAction) {
      this.submitAction(this.formData);
      this.dialogRef.close();
    }
  }

  onSearch(field: FieldConfig, query: string): void {
    if (!query && field.type === 'autocomplete-api') {
      this.formData[field.name] = null;
    }
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
}
