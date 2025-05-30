import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
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
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { AddModalComponent } from '../../../shared/add-modal/add-modal.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoryService } from '../../services/category.service';
import {
  Bank,
  CreateBank,
  FilterBank,
  UpdateBank,
} from '../../models/bank.model';
import { BankService } from '../../services/bank.service';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../../core/auth/services/auth.service';
import { DialogService } from '../../../shared/services/dialog.service';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  Subject,
  Subscription,
  finalize,
  interval,
  take,
  takeUntil,
  timer,
} from 'rxjs';

// Interface để quản lý data của dialog
interface DeleteConfirmDialogData {
  bank: Bank;
  confirmAction: () => void;
  cancelAction: () => void;
}

@Component({
  selector: 'app-bank-list',
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
  templateUrl: './bank-list.component.html',
  styleUrl: './bank-list.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class BankListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('deleteConfirmDialog')
  deleteConfirmDialogTemplate!: TemplateRef<any>;

  bankDataSource: Bank[] = [];
  totalBanks: number = 0;
  pageSize: number = 10;
  filter: FilterBank = {};
  isLoading: boolean = false;
  currentSortBy: string = 'createdAt';
  currentSortOrder: 'asc' | 'desc' = 'desc';

  displayedColumns: string[] = [
    'name',
    'owner',
    'category',
    'total',
    'actions',
  ];

  ownerId: string = ''; // userId
  role: string | null = '';

  // Dialog related properties
  deleteConfirmDialogRef: MatDialogRef<any> | null = null;
  private destroyDialog$ = new Subject<void>();
  private countdownSubscription: Subscription | null = null;

  // Sử dụng ReplaySubject để đảm bảo UI nhận được giá trị ngay lập tức
  countdownValue$ = new ReplaySubject<number>(1);

  constructor(
    private bankService: BankService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private notification: SnackbarService,
    private authService: AuthService,
    private router: Router,
    private dialogService: DialogService,
    private changeDetector: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  getOwnerIdFromToken(): string {
    try {
      const token = localStorage.getItem('token');
      if (!token) return '';
      const decoded: any = jwtDecode(token);
      const userId =
        decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ];
      return userId || '';
    } catch (error) {
      console.error('Failed to decode token', error);
      return '';
    }
  }

  ngOnInit(): void {
    this.ownerId = this.getOwnerIdFromToken();
    this.role = this.authService.getUserRole();
    this.isLoading = true;
    this.loadBanks();
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
            this.loadBanks(
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

        this.loadBanks(
          1,
          this.pageSize,
          this.currentSortBy,
          this.currentSortOrder
        );
      });
    }
  }

  applyFilter(): void {
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadBanks(1, this.pageSize);
  }

  clearFilter(): void {
    this.filter = {};
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadBanks(1, this.pageSize);
  }

  loadBanks(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = this.currentSortBy,
    sortOrder: string = this.currentSortOrder
  ): void {
    this.isLoading = true;
    this.filter.isActive = true;

    if (this.role === 'Teacher') {
      this.filter.ownerId = this.ownerId;
    }

    this.bankService
      .getFilterBank(index, size, sortBy, sortOrder, this.filter)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.bankDataSource = response.items;
          this.totalBanks = response.totalItems || response.totalPages * size;
        },
        error: (error) => {
          this.notification.error('Không thể tải danh sách ngân hàng câu hỏi');
        },
      });
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageSize = pageSize;
    this.loadBanks(
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
      data: {
        title: 'Thêm ngân hàng câu hỏi mới',
        fields: [
          {
            label: 'Tên ngân hàng câu hỏi',
            name: 'name',
            type: 'text',
            validators: {
              required: true,
            },
            errorMessages: {
              required: 'Vui lòng nhập tên ngân hàng câu hỏi',
            },
          },
          {
            label: 'Danh mục',
            name: 'quizCategoryId',
            type: 'select-search-api',
            apiService: this.categoryService,
            apiMethod: 'getFilterCategory',
            apiFieldName: 'name',
            apiConfig: {
              extraParams: { isActive: true },
              pageSize: 15,
              sortBy: 'name',
              sortOrder: 'asc',
              mapResult: (item: any) => ({
                value: item.id,
                label: item.name,
              }),
            },
            validators: {
              required: true,
            },
            errorMessages: {
              required: 'Vui lòng chọn danh mục',
            },
          },
          {
            label: 'File câu hỏi (không bắt buộc)',
            name: 'file',
            type: 'file',
          },
        ],
        submitButtonText: 'Tạo ngân hàng',
        submitAction: (formData: any) => {
          formData.ownerId = this.ownerId;
          this.addBank(formData, dialogRef);
        },
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadBanks();
    });
  }

  addBank(formData: any, dialogRef: any): void {
    this.isLoading = true;

    if (formData.file) {
      // Upload file
      this.bankService
        .uploadCreateBank(
          formData.file,
          formData.name,
          formData.ownerId,
          formData.quizCategoryId
        )
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (res) => {
            this.notification.success('Upload ngân hàng câu hỏi thành công!');
            this.loadBanks();
            dialogRef.close();
          },
          error: (err) => {
            this.notification.error('Upload thất bại!');
          },
        });
    } else {
      // Add normal bank
      this.bankService
        .addBank(formData)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            this.notification.success('Thêm ngân hàng câu hỏi thành công!');
            this.loadBanks();
            dialogRef.close();
          },
          error: (error) => {
            this.notification.error('Thêm ngân hàng câu hỏi thất bại!');
          },
        });
    }
  }

  openDeleteConfirmDialog(bank: Bank): void {
    this.cleanupCountdown();

    this.startCountdown();

    const dialogData: DeleteConfirmDialogData = {
      bank: bank,
      confirmAction: () => {
        this.removeBank(bank);
        this.deleteConfirmDialogRef?.close();
      },
      cancelAction: () => {
        this.deleteConfirmDialogRef?.close();
      },
    };

    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'delete-confirm-dialog';
    dialogConfig.disableClose = true;
    dialogConfig.width = '500px';
    dialogConfig.data = dialogData;

    this.deleteConfirmDialogRef = this.dialog.open(
      this.deleteConfirmDialogTemplate,
      dialogConfig
    );

    this.deleteConfirmDialogRef.afterClosed().subscribe(() => {
      this.cleanupCountdown();
    });
  }

  startCountdown(): void {
    this.countdownValue$.next(5);

    this.countdownSubscription = timer(0, 1000)
      .pipe(take(6), takeUntil(this.destroyDialog$))
      .subscribe({
        next: (tick) => {
          this.ngZone.run(() => {
            const newValue = 5 - tick;
            this.countdownValue$.next(newValue);
          });
        },
      });
  }

  // Hàm dọn dẹp countdown
  cleanupCountdown(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
    }
    this.destroyDialog$.next();
  }

  removeBank(bank: Bank): void {
    this.isLoading = true;

    const bankDelete: UpdateBank = {
      name: bank.name,
      ownerId: bank.ownerId,
      quizCategoryId: bank.quizCategoryId,
      isActive: false,
    };

    this.bankService
      .updateBank(bank.id, bankDelete)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.notification.success('Xóa ngân hàng câu hỏi thành công!');
          this.loadBanks();
        },
        error: (error) => {
          this.notification.error(
            error?.error?.message || 'Ngân hàng câu hỏi không thể xóa.'
          );
        },
      });
  }

  goToBankDetail(bank: any) {
    if (this.role === 'Admin') {
      this.router.navigate(['/admin/bank', bank.id]);
    } else if (this.role === 'Teacher') {
      this.router.navigate(['/teacher/bank', bank.id]);
    }
  }

  ngOnDestroy() {
    this.cleanupCountdown();
    this.destroyDialog$.complete();
    this.countdownValue$.complete();
  }
}
