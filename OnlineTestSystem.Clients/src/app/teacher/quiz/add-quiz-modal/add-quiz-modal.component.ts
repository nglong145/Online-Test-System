import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QuizService } from '../../services/quiz.service';
import { CategoryService } from '../../services/category.service';
import { BankService } from '../../services/bank.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { CreateQuiz } from '../../models/quiz.model';
import { debounceTime, Subject, switchMap, finalize, takeUntil } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DialogService } from '../../../shared/services/dialog.service';

@Component({
  selector: 'app-add-quiz-modal',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './add-quiz-modal.component.html',
  styleUrl: './add-quiz-modal.component.scss',
})
export class AddQuizModalComponent implements OnInit, OnDestroy {
  randomQuiz = {
    questionBankId: '',
    numberOfQuestionsPerQuiz: 10,
    numberOfQuizzes: 1,
    score: 10,
    duration: 60,
  };

  bankOptions: { value: string; label: string }[] = [];
  bankFilterCtrl = new FormControl('');
  isLoading = false;

  private searchBank$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<AddQuizModalComponent>,
    private quizService: QuizService,
    private bankService: BankService,
    private snackbar: SnackbarService,
    private dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    // Tự động tải danh sách ngân hàng câu hỏi khi component khởi tạo
    this.loadBanks('');

    // Theo dõi filter của ngân hàng
    this.bankFilterCtrl.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe((value) => {
        this.loadBanks(value || '');
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBanks(searchTerm: string) {
    this.isLoading = true;
    this.bankService
      .getFilterBank(1, 20, 'name', 'asc', {
        name: searchTerm,
        isActive: true,
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.bankOptions = (res.items || []).map((item: any) => ({
            value: item.id,
            label: item.name,
          }));
        },
        error: (error) => {
          console.error('Error loading banks', error);
          this.snackbar.error('Không thể tải danh sách ngân hàng câu hỏi');
        },
      });
  }

  onSubmitRandom() {
    // Validate thông tin
    if (!this.randomQuiz.questionBankId) {
      this.snackbar.error('Vui lòng chọn ngân hàng câu hỏi');
      return;
    }

    if (this.randomQuiz.numberOfQuestionsPerQuiz < 1) {
      this.snackbar.error('Số câu hỏi mỗi đề phải lớn hơn hoặc bằng 1');
      return;
    }

    if (this.randomQuiz.numberOfQuizzes < 1) {
      this.snackbar.error('Số lượng đề phải lớn hơn hoặc bằng 1');
      return;
    }

    if (this.randomQuiz.score < 0) {
      this.snackbar.error('Điểm số phải lớn hơn hoặc bằng 0');
      return;
    }

    if (this.randomQuiz.duration < 1) {
      this.snackbar.error('Thời lượng phải lớn hơn hoặc bằng 1 phút');
      return;
    }

    // Xác nhận trước khi tạo
    this.dialogService
      .confirm({
        title: 'Xác nhận tạo đề thi',
        message: `Bạn sắp tạo ${this.randomQuiz.numberOfQuizzes} đề thi với ${this.randomQuiz.numberOfQuestionsPerQuiz} câu hỏi/đề. Tiếp tục?`,
        confirmText: 'Tạo đề thi',
        cancelText: 'Hủy bỏ',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.createRandomQuizzes();
        }
      });
  }

  createRandomQuizzes() {
    this.isLoading = true;

    // Xử lý submit tạo ngẫu nhiên
    this.quizService
      .createQuizRandomBank(this.randomQuiz)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.snackbar.success('Tạo đề thi ngẫu nhiên thành công!');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error creating quizzes', error);
          this.snackbar.error(
            error?.error?.message || 'Lỗi khi tạo đề thi tự động!'
          );
        },
      });
  }

  close() {
    this.dialogRef.close();
  }

  hasUnsavedChanges(): boolean {
    return (
      this.randomQuiz.questionBankId !== '' ||
      this.randomQuiz.numberOfQuestionsPerQuiz !== 10 ||
      this.randomQuiz.numberOfQuizzes !== 1 ||
      this.randomQuiz.score !== 10 ||
      this.randomQuiz.duration !== 60
    );
  }

  // Thêm phương thức này để hỗ trợ xác nhận khi đóng modal có thay đổi
  onClose() {
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
            this.dialogRef.close();
          }
        });
    } else {
      this.dialogRef.close();
    }
  }
}
