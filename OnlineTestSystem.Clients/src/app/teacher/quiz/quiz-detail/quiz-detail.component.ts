import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { QuizWithQuestions } from '../../models/quiz.model';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { QuizService } from '../../services/quiz.service';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  takeUntil,
} from 'rxjs/operators';
import { Subject } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/services/auth.service';
import { DialogService } from '../../../shared/services/dialog.service';

@Component({
  selector: 'app-quiz-detail',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSelectModule,
    RouterModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './quiz-detail.component.html',
  styleUrl: './quiz-detail.component.scss',
})
export class QuizDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  quiz: QuizWithQuestions | null = null;
  originalQuiz: QuizWithQuestions | null = null;
  activeQuestionIndex: number = 0;
  isLoading = false;

  // Category selection
  categorySelect: Category[] = [];
  categorySelectFilter: Category[] = [];
  categoryFilterCtrl = new FormControl('');
  pageIndexSelect = 1;
  pageSizeSelect = 100;
  sortBy = 'name';
  sortOrder = 'desc';

  role: string | null = '';

  private destroy$ = new Subject<void>();

  @ViewChildren('questionCardRef') questionCards!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private notification: SnackbarService,
    private categoryService: CategoryService,
    private router: Router,
    private authService: AuthService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getUserRole();
    this.loadQuizData();
    this.setupCategorySearch();
  }

  ngAfterViewInit(): void {
    window.addEventListener('scroll', this.onScroll, true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('scroll', this.onScroll, true);
  }

  loadQuizData(): void {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (!quizId) {
      this.notification.error('Không tìm thấy ID đề thi');
      this.goBack();
      return;
    }

    this.isLoading = true;
    this.quizService
      .getQuizWithQuestionsAnswers(quizId)
      .pipe(
        finalize(() => (this.isLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.quiz = res;
          this.originalQuiz = JSON.parse(JSON.stringify(res));
        },
        error: (err) => {
          console.error('Error loading quiz data:', err);
          this.notification.error('Không thể tải dữ liệu đề thi');
        },
      });
  }

  setupCategorySearch(): void {
    this.loadCategoriesSelect('');

    this.categoryFilterCtrl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.loadCategoriesSelect(searchTerm || '');
      });
  }

  goBack(): void {
    if (this.hasUnsavedChanges()) {
      this.dialogService
        .confirm({
          title: 'Xác nhận',
          message:
            'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát không?',
          confirmText: 'Thoát',
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

  private navigateBack(): void {
    if (this.role === 'Teacher') {
      this.router.navigate(['/teacher/quiz']);
    } else if (this.role === 'Admin') {
      this.router.navigate(['/admin/quiz']);
    }
  }

  // Display name mappings
  questionTypeNameMap: { [key: string]: string } = {
    MultipleChoice: 'Trắc nghiệm nhiều đáp án',
    SingleChoice: 'Trắc nghiệm một đáp án',
    TrueFalse: 'Đúng/Sai',
    FillInTheBlanks: 'Điền từ',
    ShortAnswer: 'Câu trả lời ngắn',
    LongAnswer: 'Câu trả lời dài',
    Listening: 'Nghe',
    Speaking: 'Nói',
  };

  questionLevelNameMap: { [key: string]: string } = {
    Easy: 'Dễ',
    Medium: 'Trung bình',
    Hard: 'Khó',
  };

  getQuestionTypeDisplayName(name: string): string {
    return this.questionTypeNameMap[name] || name || 'Không xác định';
  }

  getQuestionLevelDisplayName(name: string): string {
    return this.questionLevelNameMap[name] || name || 'Không xác định';
  }

  // Category management
  loadCategoriesSelect(searchName: string): void {
    const filter: any = { name: searchName, isActive: true };

    this.categoryService
      .getFilterCategory(
        this.pageIndexSelect,
        this.pageSizeSelect,
        this.sortBy,
        this.sortOrder,
        filter
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.categorySelect = res.items ?? [];
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
    if (selected && this.quiz) {
      this.quiz.category = selected.id;
    }
  }

  compareCategoryIds(id1: string, id2: string): boolean {
    return id1 && id2 ? id1 === id2 : id1 === id2;
  }

  // Scroll handling
  onScroll = () => {
    if (!this.questionCards || this.questionCards.length === 0) return;

    const offsets = this.questionCards.map((ref) => {
      const rect = ref.nativeElement.getBoundingClientRect();
      return rect.top >= 0 ? rect.top : Number.MAX_SAFE_INTEGER;
    });

    const minOffset = Math.min(...offsets);
    const index = offsets.findIndex((o) => o === minOffset);

    if (index !== -1 && index !== this.activeQuestionIndex) {
      this.activeQuestionIndex = index;
    }
  };

  scrollToQuestion(index: number): void {
    this.activeQuestionIndex = index;
    const el = document.getElementById('question-' + index);
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  }

  truncateText(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  // Quiz update
  updateQuiz(): void {
    if (!this.quiz || !this.isQuizChanged()) {
      return;
    }

    this.dialogService
      .confirm({
        title: 'Xác nhận cập nhật',
        message: 'Bạn có chắc chắn muốn cập nhật thông tin đề thi?',
        confirmText: 'Cập nhật',
        cancelText: 'Hủy',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.performUpdate();
        }
      });
  }

  private performUpdate(): void {
    if (!this.quiz) return;

    const updateBody = {
      title: this.quiz.title,
      category: this.quiz.category,
      description: this.quiz.description,
      duration: this.quiz.duration,
      isActive: true,
    };

    this.isLoading = true;
    this.quizService
      .updateQuiz(this.quiz.id, updateBody)
      .pipe(
        finalize(() => (this.isLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.notification.success('Cập nhật thông tin đề thi thành công!');
          this.loadQuizData();
        },
        error: (error) => {
          console.error('Error updating quiz:', error);
          this.notification.error(
            error?.error?.message || 'Cập nhật thông tin thất bại!'
          );
        },
      });
  }

  // Change detection
  isQuizChanged(): boolean {
    if (!this.originalQuiz || !this.quiz) return false;

    return (
      this.quiz.title !== this.originalQuiz.title ||
      this.quiz.category !== this.originalQuiz.category ||
      this.quiz.description !== this.originalQuiz.description ||
      this.quiz.duration !== this.originalQuiz.duration
    );
  }

  hasUnsavedChanges(): boolean {
    return this.isQuizChanged();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges()) {
      $event.returnValue =
        'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát không?';
    }
  }
}
