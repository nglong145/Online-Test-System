import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { AddModalComponent } from '../../../shared/add-modal/add-modal.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  BankWithQuestions,
  Enum,
  QuestionWithAnswers,
} from '../../models/bank-detail.model';
import { BankService } from '../../services/bank.service';
import { debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AddAnswer, AddQuestion, Answer } from '../../models/question.model';
import { QuestionService } from '../../services/question.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { DialogService } from '../../../shared/services/dialog.service';

@Component({
  selector: 'app-bank-detail',
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
    MatDividerModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './bank-detail.component.html',
  styleUrl: './bank-detail.component.scss',
})
export class BankDetailComponent implements OnInit, AfterViewInit {
  questionTypeList: Enum[] = [];
  questionLevelList: Enum[] = [];
  bank: BankWithQuestions | null = null;

  activeQuestionIndex: number = 0;

  categorySelect: Category[] = [];
  categorySelectFilter: Category[] = [];
  categoryFilterCtrl = new FormControl('');
  pageIndexSelect = 1;
  pageSizeSelect = 100;
  sortBy = 'name';
  sortOrder = 'asc';

  changedQuestions: { [id: string]: QuestionWithAnswers } = {};
  addedQuestions: AddQuestion[] = [];
  removedQuestions: string[] = [];

  changedAnswers: { [id: string]: Answer } = {};
  addedAnswers: AddAnswer[] = [];
  removedAnswers: string[] = [];

  role: string | null = '';
  originalBankInfo: Partial<BankWithQuestions> | null = null;

  @ViewChildren('questionCardRef') questionCards!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private bankService: BankService,
    private notification: SnackbarService,
    private categoryService: CategoryService,
    private questionService: QuestionService,
    private cookieService: CookieService,
    private authService: AuthService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getUserRole();
    const bankId = this.route.snapshot.paramMap.get('id');
    if (bankId) {
      forkJoin([
        this.bankService.getBankWithQuestionsAnswers(bankId),
        this.bankService.getQuestionType(),
        this.bankService.getQuestionLevel(),
      ]).subscribe(
        ([bankData, typeEnums, levelEnums]) => {
          this.questionTypeList = typeEnums;
          this.questionLevelList = levelEnums;
          this.bank = bankData;
          this.originalBankInfo = {
            name: this.bank?.name,
            quizCategoryId: this.bank?.quizCategoryId,
          };

          const userId = this.getOwnerIdFromToken();
          if (
            this.role === 'Teacher' &&
            this.bank &&
            this.bank.ownerId !== userId
          ) {
            this.router.navigate(['/access-denied'], { replaceUrl: true });
            return;
          }

          if (this.bank.questions?.length) {
            this.bank.questions.forEach((q) => {
              const type = typeEnums.find((t) => t.name === q.questionType);
              if (type) q.questionType = type.value;
              const level = levelEnums.find((l) => l.name === q.level);
              if (level) q.level = level.value;
            });
          }
        },
        (err) => this.notification.error('Không lấy được dữ liệu chi tiết!')
      );
    }

    this.loadCategoriesSelect('');
    this.categoryFilterCtrl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.loadCategoriesSelect(searchTerm || '');
      });
  }

  goBack(): void {
    if (this.role === 'Teacher') {
      this.router.navigate(['/teacher/bank']);
    } else if (this.role === 'Admin') {
      this.router.navigate(['/admin/bank']);
    }
  }

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

  // Map name tiếng Anh sang tiếng Việt cho level (giả sử là Easy, Medium, Hard)
  questionLevelNameMap: { [key: string]: string } = {
    Easy: 'Dễ',
    Medium: 'Trung bình',
    Hard: 'Khó',
  };

  // Hàm lấy tên tiếng Việt cho questionType dựa trên value
  getQuestionTypeNameByValue(value: string): string {
    const found = this.questionTypeList.find((t) => t.value === value);
    return found ? this.questionTypeNameMap[found.name] || found.name : '';
  }

  // Hàm lấy tên tiếng Việt cho level dựa trên value
  getQuestionLevelNameByValue(value: string): string {
    const found = this.questionLevelList.find((l) => l.value === value);
    return found ? this.questionLevelNameMap[found.name] || found.name : '';
  }

  getOwnerIdFromToken(): string {
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

  loadCategoriesSelect(searchName: string): void {
    const filter: any = { name: searchName };
    this.categoryService
      .getFilterCategory(
        this.pageIndexSelect,
        this.pageSizeSelect,
        this.sortBy,
        this.sortOrder,
        filter
      )
      .subscribe(
        (res) => {
          this.categorySelect = res.items ?? [];
          this.categorySelectFilter = [...this.categorySelect];
        },
        (err) => {
          console.error('Error loading categories', err);
        }
      );
  }

  onCategorySelectOpen(opened: boolean): void {
    if (opened) {
      this.loadCategoriesSelect(this.categoryFilterCtrl.value || '');
    }
  }

  onCategorySelected(selectedId: string): void {
    const selected = this.categorySelect.find((c) => c.id === selectedId);
    if (selected && this.bank) {
      this.bank.quizCategoryId = selected.id;
    }
  }

  compareCategoryIds(id1: string, id2: string): boolean {
    return id1 && id2 ? id1 === id2 : id1 === id2;
  }

  updateBank() {
    if (!this.bank) return;

    const updateBody = {
      name: this.bank.name ?? '',
      quizCategoryId: this.bank.quizCategoryId,
      ownerId: this.bank.ownerId ?? '',
      isActive: true,
    };

    if (this.role === 'Teacher') {
      const ownerId = this.getOwnerIdFromToken();
      if (ownerId) {
        updateBody.ownerId = ownerId;
      }
    }

    this.bankService.updateBank(this.bank.id, updateBody).subscribe({
      next: () => {
        this.notification.success(
          'Cập nhật thông tin ngân hàng câu hỏi thành công!'
        );
        this.reloadBankDetail();
        this.originalBankInfo = {
          name: this.bank?.name,
          quizCategoryId: this.bank?.quizCategoryId,
        };
      },
      error: () => {
        this.notification.error('Cập nhật thông tin thất bại!');
      },
    });
  }

  ngAfterViewInit(): void {
    window.addEventListener('scroll', this.onScroll, true);
  }
  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll, true);
  }

  // Lắng nghe scroll để đổi highlight
  onScroll = () => {
    if (!this.questionCards) return;
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

  // Sidebar scroll
  scrollToQuestion(index: number) {
    this.activeQuestionIndex = index;
    const el = document.getElementById('question-' + index);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  truncateText(text: string, length: number) {
    if (!text) return '';
    return text.length > length ? text.substr(0, length) + '...' : text;
  }

  // Track question change
  onQuestionChanged(question: QuestionWithAnswers, i: number) {
    if (!question.id) {
      // New question
      if (this.addedQuestions[i]) {
        this.addedQuestions[i] = {
          ...this.addedQuestions[i],
          content: question.content,
          questionType: String(question.questionType),
          level: String(question.level),
          isActive: question.isActive,
        };
      }
    } else {
      this.changedQuestions[question.id] = { ...question };
    }
  }

  // Track answer change
  onAnswerChanged(answer: Answer, questionIndex: number, answerIndex: number) {
    if (answer.id) {
      this.changedAnswers[answer.id] = { ...answer };
    } else {
      // New answer: tránh thêm trùng
      if (
        !this.addedAnswers.some(
          (a) =>
            a.content === answer.content && a.questionId === answer.questionId
        )
      ) {
        this.addedAnswers.push({
          content: answer.content,
          order: answer.order ?? 1,
          questionId: answer.questionId,
          isCorrect: answer.isCorrect ?? false,
          isActive: answer.isActive ?? true,
        });
      }
    }
  }

  // Thêm mới câu hỏi (UI)
  addQuestion() {
    if (!this.bank || !this.bank.questions) return;
    const order = this.bank.questions.length + 1;
    const newQuestion = {
      id: '',
      content: '',
      order: order,
      questionType: this.questionTypeList[0]?.value ?? '',
      isActive: true,
      level: this.questionLevelList[0]?.value ?? '',
      bankId: this.bank.id,
      answers: [],
    };
    this.bank.questions.push(newQuestion as any);
  }

  // Xóa câu hỏi (UI)
  removeQuestion(index: number) {
    this.dialogService
      .confirm({
        title: 'Xác nhận xóa',
        message:
          'Bạn có chắc chắn muốn xóa câu hỏi này? Tất cả đáp án của câu hỏi cũng sẽ bị xóa.',
        confirmText: 'Xóa',
        cancelText: 'Hủy',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          if (!this.bank || !this.bank.questions) return;
          const q = this.bank.questions[index];
          if (!q) return;
          if (q.id) this.removedQuestions.push(q.id);
          this.bank.questions.splice(index, 1);
          this.notification.success('Đã xóa câu hỏi');
        }
      });
    // if (!this.bank || !this.bank.questions) return;
    // const q = this.bank.questions[index];
    // if (!q) return;
    // if (q.id) this.removedQuestions.push(q.id);
    // this.bank.questions.splice(index, 1);
  }

  // Thêm mới đáp án (UI)
  addAnswer(questionIndex: number) {
    if (!this.bank || !this.bank.questions) return;
    const q = this.bank.questions[questionIndex];
    const order = q.answers.length + 1;
    const newAnswer = {
      id: '',
      content: '',
      order: order,
      questionId: q?.id || '', // Nếu là câu hỏi mới thì sẽ cập nhật sau
      isCorrect: false,
      isActive: true,
    };
    q.answers.push(newAnswer as any);
  }

  // Xóa đáp án (UI)
  removeAnswer(questionIndex: number, answerIndex: number) {
    if (!this.bank || !this.bank.questions) return;
    const q = this.bank?.questions[questionIndex];
    if (!q) return;
    const a = q.answers[answerIndex];
    if (a?.id) this.removedAnswers.push(a.id);
    q.answers.splice(answerIndex, 1);
  }

  // Chọn loại question SingleChoice thì chỉ 1 đáp án đúng
  onAnswerCheckChange(questionIndex: number, answerIndex: number) {
    if (!this.bank || !this.bank.questions) return;
    const question = this.bank.questions[questionIndex];
    if (!question) return;
    const type = String(question.questionType);

    if (type !== 'MultipleChoice' && type !== '0') {
      // Tất cả loại khác chỉ cho phép 1 đáp án đúng
      question.answers.forEach((ans, idx) => {
        const oldValue = ans.isCorrect;
        ans.isCorrect = idx === answerIndex;
        if (oldValue !== ans.isCorrect) {
          this.onAnswerChanged(ans, questionIndex, idx);
        }
      });
    } else {
      // MultipleChoice: toggle từng đáp án
      const answer = question.answers[answerIndex];
      answer.isCorrect = !answer.isCorrect;
      this.onAnswerChanged(answer, questionIndex, answerIndex);
    }
    this.onQuestionChanged(question, questionIndex);
  }

  // ================== CẬP NHẬT TẤT CẢ =================
  async updateAllQuestionsAndAnswers() {
    const bankId = this.route.snapshot.paramMap.get('id');
    this.dialogService
      .confirm({
        title: 'Xác nhận cập nhật',
        message: 'Bạn có chắc chắn muốn cập nhật tất cả thay đổi?',
        confirmText: 'Cập nhật',
        cancelText: 'Hủy',
      })
      .subscribe(async (confirmed) => {
        if (confirmed) {
          try {
            (this.bank?.questions ?? []).forEach((question) => {
              const type = String(question.questionType);
              if (type !== 'MultipleChoice' && type !== '0') {
                let found = false;
                question.answers.forEach((ans) => {
                  if (!found && ans.isCorrect) {
                    found = true;
                  } else {
                    ans.isCorrect = false;
                  }
                });
              }
            });

            // 1. Thêm mới câu hỏi (chỉ lấy từ UI những câu chưa có id, đã nhập nội dung)
            if (!bankId) return;
            const questionsToAdd = (this.bank?.questions ?? []).filter(
              (q) => !q.id && q.content
            );
            const addQ$ = questionsToAdd.map((q, idx) =>
              this.questionService
                .addQuestion({
                  content: q.content,
                  order: q.order ?? idx + 1,
                  questionType: String(q.questionType),
                  isActive: q.isActive,
                  level: String(q.level),
                  bankId: bankId,
                })
                .toPromise()
            );
            const addedResults = await Promise.all(addQ$);

            // 2. Map lại id mới cho các answer vừa tạo, update UI
            questionsToAdd.forEach((q, idx) => {
              const newId = addedResults[idx]?.id;
              if (newId) {
                q.id = newId;
                q.answers.forEach((ans) => {
                  if (!ans.id) ans.questionId = newId;
                });
              }
            });

            // 3. Thêm mới đáp án (chỉ lấy từ UI các answer chưa có id)
            const answersToAdd = (this.bank?.questions ?? [])
              .flatMap((q) => q.answers)
              .filter((ans) => !ans.id && ans.content && ans.questionId);
            const addA$ = answersToAdd.map((ans, index) =>
              this.questionService
                .addAnswer({
                  content: ans.content,
                  order: ans.order ?? index + 1,
                  questionId: ans.questionId,
                  isCorrect: !!ans.isCorrect,
                  isActive: !!ans.isActive,
                })
                .toPromise()
            );
            await Promise.all(addA$);

            // 4. Update các câu hỏi đã sửa
            const updateQ$ = Object.values(this.changedQuestions)
              .filter((q) => typeof q.id === 'string' && !!q.id)
              .map((q) =>
                this.questionService
                  .updateQuestion(q.id as string, {
                    content: q.content,
                    order: q.order,
                    questionType: String(q.questionType),
                    isActive: true,
                    level: String(q.level),
                    bankId: bankId,
                  })
                  .toPromise()
              );
            await Promise.all(updateQ$);

            // 5. Update các đáp án đã sửa
            const updateA$ = Object.values(this.changedAnswers)
              .filter((a) => typeof a.id === 'string' && !!a.id)
              .map((a) =>
                this.questionService.updateAnswer(a.id as string, a).toPromise()
              );
            await Promise.all(updateA$);

            // 6. Xóa câu hỏi, đáp án
            const deleteQ$ = this.removedQuestions.map((id) =>
              this.questionService
                .deleteQuestion(id)
                .toPromise()
                .catch((err) => {
                  // Nếu status là 204/200 thì coi như thành công
                  if (err && (err.status === 204 || err.status === 200))
                    return true;
                  // Nếu BE trả về response null hoặc undefined, cũng bỏ qua
                  if (!err || err.status === 0) return true;
                  // Log lỗi thực sự
                  console.error('Delete Question error', err);
                  throw err;
                })
            );
            const deleteA$ = this.removedAnswers.map((id) =>
              this.questionService
                .deleteAnswer(id)
                .toPromise()
                .catch((err) => {
                  if (err && (err.status === 204 || err.status === 200))
                    return true;
                  if (!err || err.status === 0) return true;
                  console.error('Delete Answer error', err);
                  throw err;
                })
            );
            await Promise.all([...deleteQ$, ...deleteA$]);

            // 7. Reset tracking và reload lại dữ liệu
            this.notification.success('Cập nhật thành công!');
            this.resetTracking();
            this.reloadBankDetail();
          } catch (err) {
            this.notification.error('Cập nhật thất bại!');
          }
        }
      });
  }

  resetTracking() {
    this.changedQuestions = {};
    this.addedQuestions = [];
    this.removedQuestions = [];
    this.changedAnswers = {};
    this.addedAnswers = [];
    this.removedAnswers = [];
  }

  reloadBankDetail() {
    if (!this.bank?.id) return;
    this.bankService
      .getBankWithQuestionsAnswers(this.bank.id)
      .subscribe((bankData) => {
        this.bank = bankData;
        this.originalBankInfo = {
          name: this.bank?.name,
          quizCategoryId: this.bank?.quizCategoryId,
        };

        // Map lại questionType, level về value cho select
        if (this.bank.questions?.length) {
          this.bank.questions.forEach((q) => {
            const type = this.questionTypeList.find(
              (t) => t.name === q.questionType
            );
            if (type) q.questionType = type.value;
            const level = this.questionLevelList.find(
              (l) => l.name === q.level
            );
            if (level) q.level = level.value;
          });
        }
      });
  }

  isBankInfoChanged(): boolean {
    if (!this.bank || !this.originalBankInfo) return false;
    return (
      this.bank.name !== this.originalBankInfo.name ||
      this.bank.quizCategoryId !== this.originalBankInfo.quizCategoryId
    );
  }

  // ================== CẢNH BÁO RỜI TRANG =================
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges()) $event.returnValue = true;
  }
  hasUnsavedChanges() {
    const hasNewQuestions = (this.bank?.questions ?? []).some(
      (q) => !q.id && q.content
    );
    const hasNewAnswers = (this.bank?.questions ?? [])
      .flatMap((q) => q.answers)
      .some((ans) => !ans.id && ans.content && ans.questionId);

    return (
      this.isBankInfoChanged() ||
      hasNewQuestions ||
      hasNewAnswers ||
      Object.keys(this.changedQuestions).length > 0 ||
      this.removedQuestions.length > 0 ||
      Object.keys(this.changedAnswers).length > 0 ||
      this.removedAnswers.length > 0
    );
  }
}
