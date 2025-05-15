import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ExamService } from '../../services/exam.service';
import { FilterUserQuiz, UserQuiz } from '../../models/userQuiz.model';
import { QuizService } from '../../../student/services/quiz.service';

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
})
export class StudentDetailComponent {
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

  // Các bộ lọc
  examNameFilter: string = '';
  examPeriodFilter: string = '';
  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;
  scoreFilter: number | null = null;

  filteredExamDataSource: UserQuiz[] = [];
  totalExams = 0;
  pageSize = 5;
  filter: FilterUserQuiz = {};

  examDisplayedColumns = [
    'examName',
    'quizName',
    'startedAt',
    'finishedAt',
    'score',
  ];

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private notification: SnackbarService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const studentId = this.route.snapshot.paramMap.get('id');
    if (studentId) {
      this.loadStudentDetails(studentId);
    }
  }

  loadStudentDetails(studentId: string): void {
    const userId = this.route.snapshot.paramMap.get('id'); // Lấy ID giảng viên từ URL
    if (userId) {
      this.userService.getUserById(userId).subscribe(
        (response) => {
          this.student = response;
          this.loadUserQuizzes();
        },
        (error) => {
          console.error('Error fetching teacher details', error);
        }
      );
    }
  }

  // Phương thức gọi API cập nhật thông tin giảng viên
  updateStudent(): void {
    this.userService.updateUser(this.student.id, this.student).subscribe(
      (response) => {
        this.notification.success('Cập nhật thành công');
        this.loadStudentDetails(this.student.id);
      },
      (error) => {
        this.notification.error(error);
        console.error('Error updating teacher', error);
      }
    );
  }

  // Chuyển đổi định dạng ngày khi chọn
  onDateChange(event: any) {
    const selectedDate = event.value;
    this.student.dateOfBirth = this.formatDate(selectedDate); // Cập nhật ngày theo định dạng yyyy/mm/dd
  }

  // Định dạng ngày theo định dạng yyyy/mm/dd
  formatDate(date: any): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  loadUserQuizzes(
    pageIndex: number = 1,
    pageSize: number = this.pageSize
  ): void {
    const filter = {
      userId: this.student.id,
      examName: this.examNameFilter || undefined,
      examPeriod: this.examPeriodFilter || undefined,
      startDate: this.startDateFilter
        ? this.startDateFilter.toISOString()
        : undefined,
      endDate: this.endDateFilter
        ? this.endDateFilter.toISOString()
        : undefined,
      score: this.scoreFilter || undefined,
    };

    this.quizService
      .getFilterUserQuiz(pageIndex, pageSize, 'Score', 'asc', filter)
      .subscribe((result) => {
        this.filteredExamDataSource = result.items;
        this.totalExams = result.totalPages * pageSize; // Hoặc nếu API có `total` thì thay vào
      });
  }

  applyFilter(): void {
    this.loadUserQuizzes();
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.loadUserQuizzes(pageIndex, pageSize);
  }
}
