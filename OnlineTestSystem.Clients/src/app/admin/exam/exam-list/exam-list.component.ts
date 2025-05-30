import {
  Component,
  NgZone,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
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
import {
  CreateExam,
  Exam,
  FilterExam,
  UpdateExam,
} from '../../models/exam.model';
import { ExamService } from '../../services/exam.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { AddModalComponent } from '../../../shared/add-modal/add-modal.component';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { AuthService } from '../../../core/auth/services/auth.service';
import {
  finalize,
  ReplaySubject,
  Subject,
  Subscription,
  take,
  takeUntil,
  timer,
} from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

interface DeleteConfirmDialogData {
  exam: Exam;
  confirmAction: () => void;
  cancelAction: () => void;
}

@Component({
  selector: 'app-exam-list',
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
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class ExamListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('deleteConfirmDialog')
  deleteConfirmDialogTemplate!: TemplateRef<any>;

  examDataSource: Exam[] = [];
  totalExams: number = 0;
  pageSize: number = 10;
  filter: FilterExam = {};
  isLoading: boolean = false;
  currentSortBy: string = 'createdAt';
  currentSortOrder: 'asc' | 'desc' = 'desc';

  displayedColumns: string[] = [
    'name',
    'description',
    'startTime',
    'endTime',
    'actions',
  ];

  role: string | null = '';
  userId: string = '';

  deleteConfirmDialogRef: MatDialogRef<any> | null = null;
  private destroyDialog$ = new Subject<void>();
  private countdownSubscription: Subscription | null = null;

  countdownValue$ = new ReplaySubject<number>(1);

  constructor(
    private examService: ExamService,
    private dialog: MatDialog,
    private notification: SnackbarService,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getUserRole();
    this.isLoading = true;
    this.loadExams();
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe((sortState: Sort) => {
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
            this.loadExams(
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

        this.loadExams(
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
    this.loadExams(1, this.pageSize);
  }

  clearFilter(): void {
    this.filter = {};
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadExams(1, this.pageSize);
  }

  loadExams(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = this.currentSortBy,
    sortOrder: string = this.currentSortOrder
  ): void {
    this.isLoading = true;
    this.filter.isActive = true;

    this.examService
      .getFilterExam(index, size, sortBy, sortOrder, this.filter)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.examDataSource = response.items;
          this.totalExams = response.totalItems || response.totalPages * size;
        },
        error: (error) => {
          this.notification.error('Không thể tải danh sách đề thi');
        },
      });
  }

  getLocaleTime(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);

    return d.toLocaleTimeString(navigator.language || 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  getLocaleDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageSize = pageSize;
    this.loadExams(
      pageIndex,
      pageSize,
      this.currentSortBy,
      this.currentSortOrder
    );
  }

  openAddModal(): void {
    const now = new Date();
    const dialogRef = this.dialog.open(AddModalComponent, {
      width: '500px',
      panelClass: 'add-modal-dialog',
      data: {
        title: 'Thêm Kỳ thi Mới',
        fields: [
          {
            label: 'Tên kỳ thi',
            name: 'name',
            type: 'text',
            validators: {
              required: true,
            },
            errorMessages: {
              required: 'Vui lòng nhập tên kỳ thi',
            },
          },
          { label: 'Mô tả', name: 'description', type: 'text' },
          {
            label: 'Mã truy cập',
            name: 'accessCode',
            type: 'text',
            validators: {
              required: true,
            },
            errorMessages: {
              required: 'Vui lòng nhập mã truy cập',
            },
          },
          {
            label: 'Ngày bắt đầu',
            name: 'startTime',
            type: 'datetime',
            value: now,
          },
          {
            label: 'Ngày kết thúc',
            name: 'endTime',
            type: 'datetime',
            value: now,
          },
        ],
        submitButtonText: 'Thêm Mới',
        submitAction: (formData: any) => {
          const examData: CreateExam = {
            name: formData.name?.trim() || '',
            description: formData.description?.trim() || '',
            accessCode: formData.accessCode?.trim() || '',
            startTime: formData.startTime,
            endTime: formData.endTime,
            isActive: true,
          };

          if (!examData.startTime || !examData.endTime) {
            this.notification.error(
              'Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc'
            );
            return;
          }

          this.addExam(examData, dialogRef);
        },
      },
    });
  }

  addExam(formData: CreateExam, dialogRef: any): void {
    this.isLoading = true;

    this.examService
      .addExam(formData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.notification.success('Kỳ thi được tạo thành công');
          this.loadExams();
          dialogRef.close();
        },
        error: (err) => {
          this.notification.error('Thêm kỳ thi thất bại!');
        },
      });
  }

  goToExamDetail(exam: any) {
    if (this.role === 'Admin') {
      this.router.navigate(['/admin/exam', exam.id]);
    } else if (this.role === 'Teacher') {
      this.router.navigate(['/teacher/exam', exam.id]);
    }
  }

  openDeleteConfirmDialog(exam: Exam): void {
    this.cleanupCountdown();

    this.startCountdown();

    const dialogData: DeleteConfirmDialogData = {
      exam: exam,
      confirmAction: () => {
        this.removeExam(exam);
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

  removeExam(exam: Exam): void {
    this.isLoading = true;

    const examDelete: UpdateExam = {
      name: exam.name,
      description: exam.description,
      accessCode: exam.accessCode,
      startTime: exam.startTime,
      endTime: exam.endTime,
      isActive: false,
    };

    this.examService
      .updateExam(exam.id, examDelete)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.notification.success('Xóa kỳ thi thành công');
          this.loadExams();
        },
        error: (error) => {
          this.notification.error(
            error?.error?.message || 'Kỳ thi không thể xóa.'
          );
        },
      });
  }
}
