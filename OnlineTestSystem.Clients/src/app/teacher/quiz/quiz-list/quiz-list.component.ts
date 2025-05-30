import {
  Component,
  NgZone,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
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
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { FilterQuiz, Quiz, UpdateQuiz } from '../../models/quiz.model';
import { QuizService } from '../../services/quiz.service';
import { AddQuizModalComponent } from '../add-quiz-modal/add-quiz-modal.component';
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
  quiz: Quiz;
  confirmAction: () => void;
  cancelAction: () => void;
}

@Component({
  selector: 'app-quiz-list',
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
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './quiz-list.component.html',
  styleUrl: './quiz-list.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class QuizListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('deleteConfirmDialog')
  deleteConfirmDialogTemplate!: TemplateRef<any>;

  quizDataSource: Quiz[] = [];
  totalQuizzes: number = 0;
  pageSize: number = 10;
  filter: FilterQuiz = {};
  isLoading: boolean = false;
  currentSortBy: string = 'createdAt';
  currentSortOrder: 'asc' | 'desc' = 'desc';

  displayedColumns: string[] = [
    'title',
    'category',
    'description',
    'questions',
    'duration',
    'actions',
  ];

  role: string | null = '';

  deleteConfirmDialogRef: MatDialogRef<any> | null = null;
  private destroyDialog$ = new Subject<void>();
  private countdownSubscription: Subscription | null = null;

  countdownValue$ = new ReplaySubject<number>(1);

  constructor(
    private quizService: QuizService,
    private dialog: MatDialog,
    private notification: SnackbarService,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getUserRole();
    this.isLoading = true;
    this.loadQuizzes();
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
            this.loadQuizzes(
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

        this.loadQuizzes(
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
    this.loadQuizzes(1, this.pageSize);
  }

  clearFilter(): void {
    this.filter = {};
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadQuizzes(1, this.pageSize);
  }

  loadQuizzes(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = this.currentSortBy,
    sortOrder: string = this.currentSortOrder
  ): void {
    this.isLoading = true;
    this.filter.isActive = true;

    this.quizService
      .getFilterQuiz(index, size, sortBy, sortOrder, this.filter)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.quizDataSource = response.items;
          this.totalQuizzes = response.totalItems || response.totalPages * size;
        },
        error: (error) => {
          this.notification.error('Không thể tải danh sách đề thi');
        },
      });
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageSize = pageSize;
    this.loadQuizzes(
      pageIndex,
      pageSize,
      this.currentSortBy,
      this.currentSortOrder
    );
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(AddQuizModalComponent, {
      width: '500px',
      panelClass: 'add-modal-dialog',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadQuizzes();
    });
  }

  addQuiz(formData: any): void {
    this.isLoading = true;
    if (formData.file) {
      this.quizService
        .addQuiz(formData)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (res) => {
            this.notification.success('Đề thi được tạo tự động thành công');
            this.loadQuizzes();
          },
          error: (err) => {
            this.notification.error('Thêm đề thi thất bại!');
          },
        });
    }
  }

  openDeleteConfirmDialog(quiz: Quiz): void {
    this.cleanupCountdown();

    this.startCountdown();

    const dialogData: DeleteConfirmDialogData = {
      quiz: quiz,
      confirmAction: () => {
        this.removeQuiz(quiz);
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

  removeQuiz(quiz: Quiz): void {
    this.isLoading = true;

    const quizDelete: UpdateQuiz = {
      category: quiz.category,
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      isActive: false,
    };

    this.quizService
      .updateQuiz(quiz.id, quizDelete)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.notification.success('Xóa đề thi thành công');
          this.loadQuizzes();
        },
        error: (error) => {
          this.notification.error(
            error?.error?.message || 'Đề thi không thể xóa.'
          );
        },
      });
  }

  goToQuizDetail(quiz: any) {
    if (this.role === 'Admin') {
      this.router.navigate(['/admin/quiz', quiz.id]);
    } else if (this.role === 'Teacher') {
      this.router.navigate(['/teacher/quiz', quiz.id]);
    }
  }
}
