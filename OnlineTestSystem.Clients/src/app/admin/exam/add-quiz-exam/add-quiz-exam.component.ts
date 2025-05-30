import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FilterQuiz,
  Quiz,
  QuizWithQuestions,
} from '../../../teacher/models/quiz.model';
import { ExamQuiz } from '../../models/examExtend.model';
import { QuizService } from '../../../teacher/services/quiz.service';
import { ExamExtendService } from '../../services/exam-extend.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { DialogService } from '../../../shared/services/dialog.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { finalize } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-add-quiz-exam',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-quiz-exam.component.html',
  styleUrl: './add-quiz-exam.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class AddQuizExamComponent implements OnInit {
  examId: string = '';
  role: string | null = '';
  isLoading = false;
  isExamQuizzesLoading = false;
  isAvailableQuizzesLoading = false;
  isPreviewLoading = false;

  // Individual loading states
  loadingStates: { [key: string]: boolean } = {};

  // ExamQuiz list
  examQuizzes: ExamQuiz[] = [];
  totalExamQuizzes = 0;
  pageSizeExamQuiz = 5;
  examQuizColumns = ['title', 'totalQuestion', 'duration', 'actions'];

  // Available Quiz list
  availableQuizzes: Quiz[] = [];
  totalAvailableQuizzes = 0;
  pageSizeAvailableQuiz = 5;
  quizColumns = ['title', 'totalQuestion', 'duration', 'actions'];

  // Selected quiz for preview
  selectedQuiz: QuizWithQuestions | null = null;

  // Filters
  filterExamQuiz = {
    examId: '',
    title: '',
  };

  filterQuiz: FilterQuiz = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private examExtendService: ExamExtendService,
    private notification: SnackbarService,
    private dialogService: DialogService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.role = this.authService.getUserRole();
    this.isLoading = true;
    this.examId = this.route.snapshot.paramMap.get('id') || '';
    if (this.examId) {
      this.loadExamQuizzes();
      this.loadAvailableQuizzes();
    } else {
      this.notification.error('Không tìm thấy kỳ thi');
      this.goBack();
    }
  }

  // Load ExamQuizzes
  loadExamQuizzes(
    pageIndex: number = 1,
    pageSize: number = this.pageSizeExamQuiz
  ): void {
    this.isExamQuizzesLoading = true;
    this.filterExamQuiz.examId = this.examId;
    this.examExtendService
      .getFilterExamQuiz(
        pageIndex,
        pageSize,
        'title',
        'asc',
        this.filterExamQuiz
      )
      .pipe(
        finalize(() => {
          this.isExamQuizzesLoading = false;
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.examQuizzes = result.items;
          this.totalExamQuizzes = result.totalPages * pageSize;
        },
        error: (error) => {
          this.notification.error(
            'Không thể tải danh sách đề thi trong kỳ thi'
          );
          console.error(error);
        },
      });
  }

  // Load Available Quizzes
  loadAvailableQuizzes(
    pageIndex: number = 1,
    pageSize: number = this.pageSizeAvailableQuiz
  ): void {
    this.isAvailableQuizzesLoading = true;
    this.filterQuiz.isActive = true;
    this.quizService
      .getFilterQuiz(pageIndex, pageSize, 'title', 'asc', this.filterQuiz)
      .pipe(
        finalize(() => {
          this.isAvailableQuizzesLoading = false;
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.availableQuizzes = result.items;
          this.totalAvailableQuizzes = result.totalPages * pageSize;
        },
        error: (error) => {
          this.notification.error('Không thể tải danh sách đề thi có sẵn');
          console.error(error);
        },
      });
  }

  // Pagination event handlers
  pageChangedExamQuiz(event: any): void {
    this.loadExamQuizzes(event.pageIndex + 1, event.pageSize);
  }

  pageChangedAvailableQuiz(event: any): void {
    this.loadAvailableQuizzes(event.pageIndex + 1, event.pageSize);
  }

  // Preview Quiz
  previewQuiz(quizId: string) {
    this.isPreviewLoading = true;
    this.selectedQuiz = null;

    this.quizService
      .getQuizWithQuestionsAnswers(quizId)
      .pipe(finalize(() => (this.isPreviewLoading = false)))
      .subscribe({
        next: (quiz) => {
          this.selectedQuiz = quiz;
          this.selectedQuiz.totalScore = Math.round(
            this.selectedQuiz.questions?.reduce(
              (sum, question) => sum + (question.score || 0),
              0
            ) || 0
          );
        },
        error: (error) => {
          this.notification.error('Không thể tải chi tiết đề thi');
          console.error(error);
        },
      });
  }

  // Add Quiz to Exam
  addQuizToExam(quizId: string) {
    if (this.loadingStates[`availableQuiz-${quizId}`]) {
      return; // Prevent multiple clicks
    }

    this.loadingStates[`availableQuiz-${quizId}`] = true;

    this.examExtendService
      .addExamQuiz(this.examId, quizId)
      .pipe(
        finalize(() => delete this.loadingStates[`availableQuiz-${quizId}`])
      )
      .subscribe({
        next: () => {
          this.notification.success('Thêm đề thi vào kỳ thi thành công');
          this.loadExamQuizzes();
          this.loadAvailableQuizzes();
        },
        error: (error) => {
          this.notification.error(
            error.error?.message || 'Thêm đề thi thất bại'
          );
          console.error(error);
        },
      });
  }

  // Remove Quiz from Exam
  removeQuizFromExam(quiz: ExamQuiz) {
    if (this.loadingStates[`examQuiz-${quiz.quizId}`]) {
      return; // Prevent multiple clicks
    }

    this.dialogService.confirmDelete(quiz.title).subscribe((confirmed) => {
      if (confirmed) {
        this.loadingStates[`examQuiz-${quiz.quizId}`] = true;

        this.examExtendService
          .deleteExamQuiz(this.examId, quiz.quizId)
          .pipe(
            finalize(() => delete this.loadingStates[`examQuiz-${quiz.quizId}`])
          )
          .subscribe({
            next: () => {
              this.notification.success('Xóa đề thi khỏi kỳ thi thành công');
              this.loadExamQuizzes();
              this.loadAvailableQuizzes();

              // If current preview is the removed quiz, clear preview
              if (this.selectedQuiz && this.selectedQuiz.id === quiz.quizId) {
                this.selectedQuiz = null;
              }
            },
            error: (error) => {
              this.notification.error('Xóa đề thi thất bại');
              console.error(error);
            },
          });
      }
    });
  }

  // Filter methods
  applyExamQuizFilter(): void {
    this.loadExamQuizzes(1); // Reset về trang 1
  }

  clearExamQuizFilter(): void {
    this.filterExamQuiz = {
      examId: this.examId,
      title: '',
    };
    this.loadExamQuizzes(1); // Reset về trang 1
  }

  applyQuizFilter(): void {
    this.loadAvailableQuizzes(1); // Reset về trang 1
  }

  clearQuizFilter(): void {
    this.filterQuiz = {
      title: '',
      categoryName: '',
      isActive: true,
    };
    this.loadAvailableQuizzes(1); // Reset về trang 1
  }

  getAlphabetLabel(index: number): string {
    return String.fromCharCode(65 + index); // 65 là mã ASCII của 'A'
  }

  goBack(): void {
    if (this.role === 'Admin') {
      this.router.navigate(['/admin/exam', this.examId]);
    } else if (this.role === 'Teacher') {
      this.router.navigate(['/teacher/exam', this.examId]);
    }
  }

  isItemLoading(type: string, id: string): boolean {
    return !!this.loadingStates[`${type}-${id}`];
  }
}
