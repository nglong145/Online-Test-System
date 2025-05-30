import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  MatPaginatorIntl,
} from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { AddModalComponent } from '../../../shared/add-modal/add-modal.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import {
  Category,
  CreateCategory,
  FilterCategory,
} from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogService } from '../../../shared/services/dialog.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-category-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSelectModule,
    MatTabsModule,
    RouterModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class CategoryListComponent implements OnInit, AfterViewInit {
  categoryDataSource: Category[] = [];
  totalCategories: number = 0;
  pageSize: number = 10;
  filter: FilterCategory = {};
  isLoading: boolean = false;
  currentSortBy: string = 'createdAt';
  currentSortOrder: 'asc' | 'desc' = 'desc';

  displayedColumns: string[] = ['name', 'description', 'parentName', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterSubject = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private notification: SnackbarService,
    private router: Router,
    private dialogService: DialogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadCategories();

    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.loadCategories();
    });
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe((sortState: Sort) => {
        // Reset paging khi sort thay đổi
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }

        const clickedColumn = sortState.active;
        const clickedDirection = sortState.direction;

        if (clickedColumn === this.currentSortBy) {
          if (clickedDirection === '') {
            // Reset to default sort
            this.currentSortBy = 'createdAt';
            this.currentSortOrder = 'desc';
            this.sort.active = this.currentSortBy;
            this.sort.direction = this.currentSortOrder;
            this.sort._stateChanges.next();
            this.loadCategories(
              1,
              this.pageSize,
              this.currentSortBy,
              this.currentSortOrder
            );
            return;
          } else {
            this.currentSortOrder = clickedDirection === 'asc' ? 'asc' : 'desc';
          }
        } else {
          this.currentSortBy = clickedColumn;
          this.currentSortOrder = clickedDirection === 'asc' ? 'asc' : 'desc';
        }

        this.loadCategories(
          1,
          this.pageSize,
          this.currentSortBy,
          this.currentSortOrder
        );
      });
    }
  }

  applyFilter(): void {
    this.filterSubject.next();

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  clearFilter(): void {
    this.filter = {};
    this.loadCategories(1, this.pageSize);

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  loadCategories(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = this.currentSortBy,
    sortOrder: string = this.currentSortOrder
  ): void {
    this.isLoading = true;

    this.categoryService
      .getFilterCategory(index, size, sortBy, sortOrder, this.filter)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.categoryDataSource = response.items;
          this.totalCategories =
            response.totalItems || response.totalPages * size;
        },
        error: (error) => {
          this.notification.error('Không thể tải danh sách danh mục');
        },
      });
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageSize = pageSize;
    this.loadCategories(
      pageIndex,
      pageSize,
      this.currentSortBy,
      this.currentSortOrder
    );
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(AddModalComponent, {
      width: '500px',
      panelClass: 'add-modal-dialog',
      disableClose: true,
      data: {
        title: 'Thêm danh mục mới',
        fields: [
          {
            label: 'Tên danh mục',
            name: 'name',
            type: 'text',
            validators: {
              required: true,
            },
            errorMessages: {
              required: 'Vui lòng nhập tên danh mục',
            },
          },
          {
            label: 'Mô tả',
            name: 'description',
            type: 'textarea',
            placeholder: 'Nhập mô tả cho danh mục (không bắt buộc)',
          },
          {
            label: 'Danh mục cha (nếu có)',
            name: 'parentId',
            type: 'select-search-api',
            apiService: this.categoryService,
            apiMethod: 'getFilterCategory',
            apiFieldName: 'name',
            apiConfig: {
              pageSize: 15,
              sortBy: 'name',
              sortOrder: 'asc',
              mapResult: (item: any) => ({
                value: item.id,
                label: item.name,
              }),
            },
          },
        ],
        submitButtonText: 'Tạo danh mục',
        submitAction: (formData: CreateCategory) =>
          this.addCategory(formData, dialogRef),
      },
    });
  }

  addCategory(formData: CreateCategory, dialogRef: any): void {
    this.isLoading = true;
    formData.isActive = true;

    this.categoryService
      .addCategory(formData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.notification.success('Thêm danh mục thành công');
          this.loadCategories();
          dialogRef.close();
        },
        error: (error) => {
          this.notification.error(
            error?.error?.message || 'Có lỗi xảy ra khi thêm danh mục'
          );
        },
      });
  }

  goToDetail(category: any) {
    this.router.navigate(['/admin/category', category.id]);
  }

  removeCategory(category: Category): void {
    const stringDelete = `danh mục ${category.name}`;

    this.dialogService.confirmDelete(stringDelete).subscribe((confirmed) => {
      if (confirmed) {
        this.isLoading = true;

        this.categoryService
          .deleteCategory(category.id)
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe({
            next: () => {
              this.notification.success('Xóa danh mục thành công!');
              this.loadCategories();
            },
            error: (error) => {
              this.notification.error(
                error?.error?.message ||
                  'Danh mục không thể xóa vì có danh mục con hoặc đã được sử dụng.'
              );
            },
          });
      }
    });
  }
}
