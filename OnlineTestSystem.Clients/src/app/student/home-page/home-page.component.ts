import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FilterUserQuiz, UserQuiz } from '../../admin/models/userQuiz.model';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { AuthService } from '../../core/auth/services/auth.service';
import { Router } from '@angular/router';
import { DoExamService } from '../services/do-exam.service';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { ExamExtendService } from '../../admin/services/exam-extend.service';
import { MatDialog } from '@angular/material/dialog';
import { AccessModalComponent } from '../access-modal/access-modal.component';
import { ExamUser } from '../../admin/models/examExtend.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DialogService } from '../../shared/services/dialog.service';
import { VietnamesePaginatorIntl } from '../../shared/vietnamese-paginator-intl';

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatFormFieldModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class HomePageComponent implements AfterViewInit {
  filteredUserQuizDataSource: UserQuiz[] = [];
  totalUserQuiz: number = 0;
  pageSizeUserQuiz: number = 5;
  userQUizFilter: FilterUserQuiz = {};
  currentSortBy: string = 'createdAt';
  currentSortOrder: 'asc' | 'desc' = 'desc';

  examDisplayedColumns = [
    'examName',
    'quizName',
    'startedAt',
    'finishedAt',
    'score',
  ];

  studentId: string = '';
  role: string | null = '';

  upcomingExamDataSource: ExamUser[] = [];
  isLoadingUpcoming = false;
  upcomingPage = 1;
  upcomingPageSize = 2;
  upcomingTotal = 0; // Thêm biến để lưu tổng số kỳ thi

  // Kỳ thi đang diễn ra
  oncomingExamDataSource: ExamUser[] = [];
  isLoadingOncoming = false;
  oncomingPage = 1;
  oncomingPageSize = 2;
  oncomingTotal = 0;

  constructor(
    private notification: SnackbarService,
    private authService: AuthService,
    private router: Router,
    private doExamService: DoExamService,
    private cookieService: CookieService,
    private examExtendService: ExamExtendService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    // this.role = this.authService.getUserRole();
    this.studentId = this.getStudentIdFromToken();
    this.loadUserQuizzes();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadUpcomingExams();
      this.loadOncomingExams();
    });
  }

  getStudentIdFromToken(): string {
    let token = this.cookieService.get('Authentication');
    if (!token) return '';
    token = token.replace(/^Bearer\s*/i, '').replace(/^Bearer%20/i, '');
    try {
      const decoded: any = jwtDecode(token);
      // Đúng key: http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier
      return (
        decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ] || ''
      );
    } catch (e) {
      return '';
    }
  }

  loadUserQuizzes(
    pageIndex: number = 1,
    pageSize: number = this.pageSizeUserQuiz,
    sortBy: string = 'startedAt',
    sortOrder: string = 'desc'
  ): void {
    this.userQUizFilter.userId = this.studentId;
    this.userQUizFilter.isCompleted = true;

    this.doExamService
      .getFilterUserQuiz(
        pageIndex,
        pageSize,
        sortBy,
        sortOrder,
        this.userQUizFilter
      )
      .subscribe((result) => {
        this.filteredUserQuizDataSource = result.items;
        this.totalUserQuiz = result.totalPages * this.pageSizeUserQuiz; // Hoặc nếu API có `total` thì thay vào
      });
  }

  applyFilterUserQuiz(): void {
    this.loadUserQuizzes();
  }

  clearFilterUserQuiz(): void {
    this.userQUizFilter = {
      userId: this.studentId,
    };
    this.loadUserQuizzes();
  }

  pageChangedUserQuiz(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageSizeUserQuiz = pageSize;
    this.loadUserQuizzes(
      pageIndex,
      pageSize,
      this.currentSortBy,
      this.currentSortOrder
    );
  }

  toISOLocalString(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds())
    );
  }

  loadUpcomingExams(
    pageIndex: number = 1,
    pageSize: number = this.upcomingPageSize
  ) {
    if (!this.studentId) return;

    this.isLoadingUpcoming = true;
    const filter = {
      userId: this.studentId,
      startTime: this.toISOLocalString(new Date()),
      isActive: true,
    };

    this.examExtendService
      .getFilterUpcomingExam(pageIndex, pageSize, 'startTime', 'asc', filter)
      .subscribe({
        next: (res) => {
          this.upcomingExamDataSource = res.items || [];
          this.upcomingTotal = res.totalItems || res.totalPages * pageSize;
          this.isLoadingUpcoming = false;
        },
        error: (err) => {
          console.error('Error loading upcoming exams:', err);
          this.isLoadingUpcoming = false;
        },
      });
  }

  // Cập nhật hàm loadOncomingExams để sử dụng pagination
  loadOncomingExams(
    pageIndex: number = 1,
    pageSize: number = this.oncomingPageSize
  ) {
    if (!this.studentId) return;

    this.isLoadingOncoming = true;
    const filter = {
      userId: this.studentId,
      isActive: true,
    };

    this.examExtendService
      .getFilterOncomingExam(pageIndex, pageSize, 'startTime', 'asc', filter)
      .subscribe({
        next: (res) => {
          this.oncomingExamDataSource = res.items || [];
          this.oncomingTotal = res.totalItems || res.totalPages * pageSize;
          this.isLoadingOncoming = false;
        },
        error: (err) => {
          console.error('Error loading oncoming exams:', err);
          this.isLoadingOncoming = false;
        },
      });
  }

  // Thêm hàm xử lý sự kiện chuyển trang
  pageChangedUpcoming(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;

    // Cập nhật lại pageSize nếu người dùng thay đổi
    if (this.upcomingPageSize !== pageSize) {
      this.upcomingPageSize = pageSize;
    }

    this.loadUpcomingExams(pageIndex, pageSize);
  }

  // Thêm hàm xử lý sự kiện chuyển trang
  pageChangedOncoming(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;

    // Cập nhật lại pageSize nếu người dùng thay đổi
    if (this.oncomingPageSize !== pageSize) {
      this.oncomingPageSize = pageSize;
    }

    this.loadOncomingExams(pageIndex, pageSize);
  }

  openAccessCodeModal(exam: any): void {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    const diffMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);

    const totalDuration =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const oneThirdDuration = totalDuration / 3;

    if (diffMinutes < -10) {
      // Trường hợp 2: Chưa đến giờ thi (cách giờ thi trên 10 phút)
      this.notification.info(
        'Chưa đến giờ thi. Vui lòng chờ đến giờ để nhập mã truy cập.'
      );
      return;
    } else if (diffMinutes >= -10 && diffMinutes <= oneThirdDuration) {
      this.openAccessCodeInputModal(exam);
    } else {
      // Trường hợp 3: Quá giờ thi
      this.notification.error(
        'Bạn đã vào muộn quá quy định (sau 1/3 thời gian thi). Vui lòng tham gia lần khác.'
      );
    }
  }

  openAccessCodeInputModal(exam: any): void {
    const dialogRef = this.dialog.open(AccessModalComponent, {
      width: '400px',
      data: { exam },
    });

    dialogRef.afterClosed().subscribe((accessCode: string | false) => {
      if (accessCode) {
        this.checkAccessCodeAndEnterExam(exam, accessCode);
      }
    });
  }

  checkAccessCodeAndEnterExam(exam: any, accessCode: string) {
    if (accessCode !== exam.accessCode) {
      this.notification.error('Mã truy cập không đúng!');
      return;
    }
    this.doExamService.checkUserHasExam(exam.examId, this.studentId).subscribe({
      next: (res) => {
        if (res.message) {
          this.notification.error(
            'Bạn đã tham gia kỳ thi này rồi. Không thể vào thi lại.'
          );

          return;
        }
        // Nếu chưa làm bài thì lấy quiz ngẫu nhiên và chuyển hướng
        this.showEnterExamConfirmation(exam);
      },
      error: () => {
        this.notification.error(
          'Có lỗi khi kiểm tra trạng thái tham gia của bạn.'
        );
      },
    });
  }

  showEnterExamConfirmation(exam: any) {
    const examDuration = this.calculateExamDuration(exam);

    this.dialogService
      .confirm({
        title: 'Xác nhận vào thi',
        message: `
          <div style="text-align: left; line-height: 1.6;">
            <p><strong>Lưu ý:</strong></p>
            <ul style="margin-left: 20px; margin-top: 8px;">
              <li>Bạn chỉ có <strong>một lần</strong> làm bài thi này</li>
              <li>Bạn không thể rời bài thi quá 5 phút. Nếu vi phạm bài thi sẽ tự động nộp bài</li>
              <li>Bạn không thể rời khỏi trang hoặc chuyển tab khác quá 3 lần. Nếu bạn vi phạm quy định này, bài thi sẽ tự động nộp ngay.</li>
              <li>Bài thi sẽ tự động nộp khi hết thời gian</li>
            </ul>
            <p style="margin-top: 16px; color: #d32f2f; font-weight: 600;">
              Bạn có chắc chắn muốn bắt đầu làm bài thi không?
            </p>
          </div>
        `,
        confirmText: 'Bắt đầu thi',
        cancelText: 'Hủy',
        confirmButtonClass: 'mat-success',
        allowHtml: true,
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.enterExam(exam);
        }
      });
  }

  enterExam(exam: any) {
    // Lấy quiz ngẫu nhiên và chuyển hướng
    this.examExtendService.getRandomQuizFromExam(exam.examId).subscribe({
      next: (quiz) => {
        if (quiz && quiz.id) {
          this.router.navigate(['/student/exam', quiz.id, 'start'], {
            queryParams: { examId: exam.examId },
          });
        } else {
          this.notification.error('Không tìm thấy đề thi trong kỳ thi này');
        }
      },
      error: () => {
        this.notification.error('Có lỗi khi tải đề thi. Vui lòng thử lại.');
      },
    });
  }

  calculateExamDuration(exam: any): number {
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  }

  goToUserQuizDetail(userQuiz: any) {
    this.router.navigate(['/student/user-quiz', userQuiz.id]);
  }
}
