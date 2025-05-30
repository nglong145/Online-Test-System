import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { Category, FilterCategory } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Bank, FilterBank } from '../../models/bank.model';
import { BankService } from '../../services/bank.service';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { DialogService } from '../../../shared/services/dialog.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/auth/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-category-detail',
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
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class CategoryDetailComponent implements OnInit {
  @ViewChild('formRef') formRef!: NgForm;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  category: Category = {
    id: '',
    name: '',
    description: '',
    parentId: '',
    parentName: '',
    isActive: true,
  };

  originalCategory: Category | null = null;
  isLoading: boolean = false;
  isSaving: boolean = false;
  role: string | null = '';

  // Category select options
  categorySelect: Category[] = [];
  categorySelectFilter: Category[] = [];
  categoryFilterCtrl = new FormControl('');
  pageIndexSelect = 1;
  pageSizeSelect = 100;
  sortBy = 'name';
  sortOrder = 'asc';

  // Banks list
  filteredBankDataSource: Bank[] = [];
  totalBanks: number = 0;
  pageSize: number = 5;
  bankFilter: FilterBank = {};
  bankDisplayedColumns: string[] = ['name', 'questions'];
  currentSortBy: string = 'name';
  currentSortOrder: 'asc' | 'desc' = 'asc';

  categoryId: string = '';

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private notification: SnackbarService,
    private bankService: BankService,
    private dialogService: DialogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.role = this.authService.getUserRole();

    this.route.params.subscribe((params) => {
      this.categoryId = params['id'];
      this.loadCategoryDetails();
      this.loadBanks();
    });

    this.loadCategoriesSelect('');
    this.categoryFilterCtrl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.loadCategoriesSelect(searchTerm || '');
      });
  }

  loadCategoryDetails(): void {
    this.isLoading = true;
    this.categoryService
      .getCategoryById(this.categoryId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.category = response;
          this.originalCategory = JSON.parse(JSON.stringify(response));
        },
        error: (error) => {
          console.error('Error fetching category details', error);
          this.notification.error('Không thể tải thông tin danh mục');
        },
      });
  }

  loadCategoriesSelect(searchName: string): void {
    const filter: FilterCategory = {
      name: searchName,
      isActive: true,
    };

    // Exclude current category from options to prevent circular parent reference
    if (this.categoryId) {
      filter.id = this.categoryId;
    }

    this.categoryService
      .getFilterCategory(
        this.pageIndexSelect,
        this.pageSizeSelect,
        this.sortBy,
        this.sortOrder,
        filter
      )
      .pipe(finalize(() => {}))
      .subscribe({
        next: (res) => {
          this.categorySelect = res.items || [];
          this.categorySelectFilter = [...this.categorySelect];
        },
        error: (err) => {
          console.error('Error loading categories', err);
          this.notification.error('Không thể tải danh sách danh mục');
        },
      });
  }

  onCategorySelectOpen(opened: boolean): void {
    if (opened) {
      this.loadCategoriesSelect(this.categoryFilterCtrl.value || '');
    }
  }

  onCategorySelected(selectedId: string): void {
    const selected = this.categorySelect.find((c) => c.id === selectedId);
    if (selected) {
      this.category.parentName = selected.name;
    } else {
      this.category.parentName = '';
    }
  }

  compareCategoryIds(id1: string, id2: string): boolean {
    return id1 && id2 ? id1 === id2 : id1 === id2;
  }

  isCategoryChanged(): boolean {
    if (!this.originalCategory) return false;
    return (
      JSON.stringify(this.category) !== JSON.stringify(this.originalCategory)
    );
  }

  updateCategory(): void {
    if (!this.isCategoryChanged()) {
      this.notification.info('Không có thông tin thay đổi');
      return;
    }

    this.dialogService
      .confirm({
        title: 'Xác nhận cập nhật',
        message: 'Bạn có chắc chắn muốn cập nhật thông tin danh mục này?',
        confirmText: 'Cập nhật',
        cancelText: 'Hủy',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.saveChanges();
        }
      });
  }

  saveChanges(): void {
    this.isSaving = true;

    this.categoryService
      .updateCategory(this.category.id, this.category)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.notification.success('Cập nhật thông tin danh mục thành công');
          this.loadCategoryDetails();
        },
        error: (error) => {
          this.notification.error(
            error?.error?.message || 'Có lỗi xảy ra khi cập nhật thông tin!'
          );
        },
      });
  }

  loadBanks(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = this.currentSortBy,
    sortOrder: string = this.currentSortOrder
  ): void {
    this.isLoading = true;
    this.bankFilter.quizCategoryId = this.categoryId;

    this.bankService
      .getFilterBank(index, size, sortBy, sortOrder, this.bankFilter)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.filteredBankDataSource = response.items;
          this.totalBanks = response.totalItems || response.totalPages * size;
        },
        error: (error) => {
          console.error('Error fetching bank list', error);
          this.notification.error('Không thể tải danh sách ngân hàng câu hỏi');
        },
      });
  }

  applyFilter(): void {
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.bankFilter.quizCategoryId = this.categoryId;
    this.loadBanks(1, this.pageSize);
  }

  clearFilter(): void {
    this.bankFilter = {
      quizCategoryId: this.categoryId,
    };
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadBanks();
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageSize = pageSize;
    this.loadBanks(pageIndex, pageSize);
  }

  goToBankDetail(bank: any) {
    if (this.role === 'Teacher') {
      this.router.navigate(['/teacher/bank', bank.id]);
    } else if (this.role === 'Admin') {
      this.router.navigate(['/admin/bank', bank.id]);
    }
  }

  goBack(): void {
    if (this.hasUnsavedChanges()) {
      this.dialogService
        .confirm({
          title: 'Xác nhận',
          message:
            'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn quay lại không?',
          confirmText: 'Quay lại',
          cancelText: 'Ở lại',
        })
        .subscribe((confirmed) => {
          if (confirmed) {
            this.navigateBack();
          }
        });
    } else {
      this.navigateBack();
    }
  }

  navigateBack(): void {
    if (this.role === 'Teacher') {
      this.router.navigate(['/teacher/category']);
    } else if (this.role === 'Admin') {
      this.router.navigate(['/admin/category']);
    }
  }

  hasUnsavedChanges(): boolean {
    return this.isCategoryChanged();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }
}
