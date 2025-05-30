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
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ExamService } from '../../services/exam.service';
import { FilterUserQuiz, UserQuiz } from '../../models/userQuiz.model';
import { DoExamService } from '../../../student/services/do-exam.service';
import {
  MAT_DATE_FORMATS,
  DateAdapter,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { CustomDateAdapter } from '../../../shared/custom-date-picker/custom-date-adapter';
import { MY_DATE_FORMATS } from '../../../shared/custom-date-picker/custom-date.model';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { DialogService } from '../../../shared/services/dialog.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-student-detail',
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
  ],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss',
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl },
  ],
})
export class StudentDetailComponent {
  @ViewChild('formRef') formRef!: NgForm;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  student: User = {
    id: '',
    studentCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    isActive: true,
    roleId: '',
    roleName: '',
  };

  filteredExamDataSource: UserQuiz[] = [];
  totalExams = 0;
  pageSize = 5;
  examFilter: FilterUserQuiz = {};

  examDisplayedColumns = [
    'examName',
    'quizName',
    'startedAt',
    'finishedAt',
    'score',
  ];

  studentDateOfBirth: Date | null = null;
  studentId: string = '';
  originalStudent: User | null = null;
  isLoading: boolean = false;
  isSaving: boolean = false;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private notification: SnackbarService,
    private doExamService: DoExamService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      this.studentId = params['id'];
      this.loadStudentDetails();
      this.loadUserQuizzes();
    });
  }

  stringToDate(dateString: string): Date | null {
    if (!dateString) return null;
    return new Date(dateString);
  }

  loadStudentDetails(): void {
    this.isLoading = true;
    this.userService
      .getUserById(this.studentId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.student = response;
          this.studentDateOfBirth = this.student.dateOfBirth
            ? new Date(this.student.dateOfBirth)
            : null;
          this.originalStudent = JSON.parse(JSON.stringify(response));

          // Reset form dirty state after loading
          setTimeout(() => {
            if (this.formRef) {
              this.formRef.form.markAsPristine();
            }
          });
        },
        error: (error) => {
          this.notification.error('Không thể tải thông tin sinh viên');
        },
      });
  }

  updateStudent(): void {
    if (!this.hasUnsavedChanges()) {
      this.notification.info('Không có thông tin thay đổi');
      return;
    }

    this.dialogService
      .confirm({
        title: 'Xác nhận cập nhật',
        message: 'Bạn có chắc chắn muốn cập nhật thông tin sinh viên này?',
        confirmText: 'Cập nhật',
        cancelText: 'Hủy',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.saveStudentData();
        }
      });
  }

  saveStudentData(): void {
    this.isSaving = true;
    this.userService
      .updateUser(this.student.id, this.student)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.notification.success('Cập nhật thông tin sinh viên thành công');
          this.loadStudentDetails();
        },
        error: (error) => {
          this.notification.error(
            error?.error?.error || 'Có lỗi xảy ra khi cập nhật thông tin!'
          );
        },
      });
  }

  onDateChange(date: Date | null) {
    this.studentDateOfBirth = date;
    if (date) {
      this.student.dateOfBirth = this.formatDateISO(date);
    } else {
      this.student.dateOfBirth = undefined; // Hoặc null nếu BE chấp nhận
    }
  }

  formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadUserQuizzes(
    pageIndex: number = 1,
    pageSize: number = this.pageSize,
    sortBy: string = 'finishedAt',
    sortOrder: string = 'desc'
  ): void {
    this.isLoading = true;
    this.examFilter.userId = this.studentId;

    this.doExamService
      .getFilterUserQuiz(
        pageIndex,
        pageSize,
        sortBy,
        sortOrder,
        this.examFilter
      )
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (result) => {
          this.filteredExamDataSource = result.items;
          this.totalExams = result.totalItems || result.totalPages * pageSize;
        },
        error: (error) => {
          this.notification.error('Không thể tải danh sách bài thi');
          console.error('Error loading user quizzes:', error);
        },
      });
  }

  applyFilter(): void {
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.examFilter.userId = this.studentId;
    this.loadUserQuizzes(1, this.pageSize);
  }

  clearFilter(): void {
    this.examFilter = {
      userId: this.studentId,
    };
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadUserQuizzes();
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageSize = pageSize;
    this.loadUserQuizzes(pageIndex, pageSize);
  }

  isStudentChanged(): boolean {
    if (!this.originalStudent) return false;
    return (
      JSON.stringify(this.student) !== JSON.stringify(this.originalStudent)
    );
  }
  hasUnsavedChanges(): boolean {
    return this.isStudentChanged();
  }

  goBack(): void {
    if (this.hasUnsavedChanges()) {
      this.dialogService
        .confirm({
          title: 'Xác nhận',
          message:
            'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn quay lại không?',
          confirmText: 'Rời đi',
          cancelText: 'Ở lại',
        })
        .subscribe((confirmed) => {
          if (confirmed) {
            this.router.navigate(['/admin/student']);
          }
        });
    } else {
      this.router.navigate(['/admin/student']);
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }
}
