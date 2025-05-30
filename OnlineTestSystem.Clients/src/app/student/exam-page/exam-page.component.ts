import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { QuizService } from '../../teacher/services/quiz.service';
import { QuizWithQuestions } from '../../teacher/models/quiz.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { ExamExtendService } from '../../admin/services/exam-extend.service';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { AddUserAnswer, AddUserQuiz } from '../models/quiz.model';
import { DoExamService } from '../services/do-exam.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { MatIconModule } from '@angular/material/icon';
import { DialogService } from '../../shared/services/dialog.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-exam-page',
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatIconModule,
  ],
  templateUrl: './exam-page.component.html',
  styleUrl: './exam-page.component.scss',
})
export class ExamPageComponent implements OnInit, OnDestroy {
  quiz: QuizWithQuestions | null = null;
  currentQuestionIndex = 0;
  currentQuestion: any;
  selectedAnswers: { [questionIndex: number]: any } = {};
  timeLeft: number = 0; // ms
  timerSubscription?: Subscription;

  userQuizId: string | null = null;
  userId: string = '';
  examId: string | undefined = '';

  startTime: Date | null = null;
  isSubmitted: boolean = false;

  // Tracking user behavior
  leaveAttempts: number = 0;
  readonly MAX_LEAVE_ATTEMPTS = 3;
  isInFocus: boolean = true;
  isUserAway: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private notification: SnackbarService,
    private quizService: QuizService,
    private doExamService: DoExamService,
    private router: Router,
    private cookieService: CookieService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.userId = this.getOwnerIdFromToken();
    this.examId = this.route.snapshot.queryParamMap.get('examId') ?? undefined;
    const quizId = this.route.snapshot.paramMap.get('id')!;

    // Setup visibility handlers
    this.setupVisibilityHandlers();

    // Check for existing quiz or start new one
    this.doExamService.getDoingUserQuiz(this.examId!, this.userId).subscribe({
      next: (userQuiz) => {
        this.userQuizId = userQuiz.userQuizId;
        this.loadDoingUserQuiz(userQuiz);
      },
      error: () => {
        this.loadQuiz(quizId);
      },
    });
  }

  getOwnerIdFromToken(): string {
    let token = this.cookieService.get('Authentication');
    if (!token) return '';

    token = token.replace(/^Bearer\s*/i, '').replace(/^Bearer%20/i, '');
    try {
      const decoded: any = jwtDecode(token);
      return (
        decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ] || ''
      );
    } catch (e) {
      return '';
    }
  }

  loadDoingUserQuiz(userQuiz: any): void {
    // Setup quiz data
    this.quiz = { ...userQuiz.quiz, questions: userQuiz.questions };
    this.currentQuestionIndex = 0;
    this.currentQuestion = userQuiz.questions?.[0] || null;
    this.userQuizId = userQuiz.userQuizId;
    this.startTime = new Date(userQuiz.startedAt);

    // Restore saved leave attempts count
    const savedLeaveAttempts = localStorage.getItem(
      `quiz_${this.userQuizId}_leave_attempts`
    );
    if (savedLeaveAttempts) {
      this.leaveAttempts = parseInt(savedLeaveAttempts);
    }

    // Set remaining time and check if already expired
    this.timeLeft = userQuiz.remainingTime * 1000;
    if (this.timeLeft <= 0) {
      this.forceSubmitExam('Đã hết thời gian làm bài!');
      return;
    }

    // Restore selected answers
    if (userQuiz.questions?.length) {
      userQuiz.questions.forEach((q: any, index: number) => {
        if (q.questionType === 'MultipleChoice') {
          this.selectedAnswers[index] = {};
          q.answers.forEach((a: any) => {
            this.selectedAnswers[index][a.id] = q.userChosenAnswerIds.includes(
              a.id
            );
          });
        } else {
          this.selectedAnswers[index] = q.userChosenAnswerIds[0] || null;
        }
      });
    }

    this.startTimer();
  }

  loadQuiz(quizId: string): void {
    this.quizService.getQuizWithQuestionsAnswers(quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        if (quiz?.questions?.length) {
          this.currentQuestion = quiz.questions[0];
          this.currentQuestionIndex = 0;

          // Initialize answers structure
          quiz.questions.forEach((q, index) => {
            if (q.questionType === 'MultipleChoice') {
              this.selectedAnswers[index] = {};
              q.answers.forEach((a) => {
                this.selectedAnswers[index][a.id] = false;
              });
            }
          });
        }

        const payload: AddUserQuiz = {
          userId: this.userId,
          examId: this.examId,
        };

        // Start new user quiz
        this.doExamService.startQuiz(quizId, payload).subscribe({
          next: (res) => {
            this.userQuizId = res.userQuizId;
            if (this.userQuizId) {
              this.loadUserQuizDetail(this.userQuizId, quiz);
            }
          },
          error: (err) => {
            // Handle existing quiz case
            if (err.status === 400 && err.error?.userQuizId) {
              this.userQuizId = err.error.userQuizId;
              if (this.userQuizId) {
                this.loadUserQuizDetail(this.userQuizId, quiz);
              }
            } else {
              const msg = err.error?.message || 'Không thể bắt đầu làm bài.';
              this.notification.error(msg);
              this.router.navigate(['/student/home']);
            }
          },
        });
      },
      error: () => {
        this.notification.error('Không thể tải thông tin đề thi');
        this.router.navigate(['/student/home']);
      },
    });
  }

  loadUserQuizDetail(userQuizId: string, quiz: QuizWithQuestions): void {
    if (!userQuizId) {
      this.notification.error('Không thể tải thông tin bài làm');
      this.router.navigate(['/student/home']);
      return;
    }

    this.doExamService.getUserQuizDetail(userQuizId).subscribe({
      next: (userQuiz) => {
        if (userQuiz.isComplete) {
          this.notification.error('Bài thi đã được nộp!');
          this.router.navigate(['/student/home']);
          return;
        }

        this.startTime = new Date(userQuiz.startedAt);

        // Restore leave attempts
        const savedLeaveAttempts = localStorage.getItem(
          `quiz_${userQuizId}_leave_attempts`
        );
        if (savedLeaveAttempts) {
          this.leaveAttempts = parseInt(savedLeaveAttempts);
        }

        // Calculate remaining time
        const now = Date.now();
        const timeElapsed = now - this.startTime.getTime();
        const totalDuration = (quiz?.duration ?? 0) * 60 * 1000;
        this.timeLeft = Math.max(0, totalDuration - timeElapsed);

        if (this.timeLeft <= 0) {
          this.forceSubmitExam('Đã hết thời gian làm bài!');
          return;
        }

        // Restore selected answers
        if (userQuiz.questions?.length) {
          userQuiz.questions.forEach((q, index) => {
            if (q.questionType === 'MultipleChoice') {
              this.selectedAnswers[index] = {};
              q.answers.forEach((a) => {
                this.selectedAnswers[index][a.id] =
                  q.userChosenAnswerIds.includes(a.id);
              });
            } else {
              this.selectedAnswers[index] = q.userChosenAnswerIds[0] || null;
            }
          });
        }

        this.startTimer();
      },
      error: () => {
        this.notification.error('Không thể tải thông tin bài thi');
        this.router.navigate(['/student/home']);
      },
    });
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeLeft -= 1000;
      if (this.timeLeft <= 0) {
        this.timerSubscription?.unsubscribe();
        this.submitExam(true); // Auto-submit when time expires
      }
    });
  }

  isAnswered(index: number): boolean {
    const ans = this.selectedAnswers[index];
    if (!ans) return false;

    if (typeof ans === 'object') {
      return Object.values(ans).some((v) => v === true);
    }

    return ans !== null && ans !== undefined && ans !== '';
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
    if (this.quiz?.questions) {
      this.currentQuestion = this.quiz.questions[index];
    } else {
      this.currentQuestion = null;
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.goToQuestion(this.currentQuestionIndex - 1);
    }
  }

  nextQuestion(): void {
    if (
      this.quiz?.questions &&
      this.currentQuestionIndex < this.quiz.questions.length - 1
    ) {
      this.goToQuestion(this.currentQuestionIndex + 1);
    }
  }

  recordAnswer(questionId: string, answerId: string): void {
    if (!this.userQuizId) return;

    const payload: AddUserAnswer = {
      questionId,
      answerId,
      userVoiceUrl: null,
      answerText: null,
    };

    this.doExamService.recordAnswer(this.userQuizId, payload).subscribe();
  }

  submitExam(isAutoSubmit: boolean = false): void {
    if (!this.userQuizId) {
      this.notification.error('Không thể nộp bài thi. Vui lòng thử lại sau.');
      return;
    }

    if (this.isSubmitted) {
      this.notification.error('Bài thi đã được nộp trước đó.');
      return;
    }

    if (isAutoSubmit) {
      // Skip confirmation for auto-submit
      this.performSubmitExam('Đã tự động nộp bài');
    } else {
      // Show confirmation dialog for manual submit
      this.dialogService
        .confirm({
          title: 'Xác nhận nộp bài',
          message: 'Bạn có chắc chắn muốn nộp bài thi không?',
          confirmText: 'Nộp bài',
          cancelText: 'Hủy',
          confirmButtonClass: 'mat-success',
        })
        .subscribe((confirmed) => {
          if (confirmed) {
            this.performSubmitExam('Nộp bài thi thành công!');
          }
        });
    }
  }

  performSubmitExam(successMessage: string = 'Nộp bài thi thành công!'): void {
    this.isSubmitted = true;

    const payload: AddUserQuiz = {
      userId: this.userId,
      examId: this.examId,
      finishedAt: new Date().toISOString(),
      isComplete: true,
    };

    this.doExamService
      .submitQuiz(this.userQuizId!, payload)
      .pipe(
        finalize(() => {
          // Always clean up and navigate regardless of API success
          this.cleanupQuizResources();
          this.router.navigate(['/student/home']);
        })
      )
      .subscribe({
        next: () => {
          this.notification.success(successMessage);
        },
        error: () => {
          this.notification.error(
            'Có lỗi khi nộp bài. Hệ thống sẽ tự động xử lý.'
          );
        },
      });
  }

  forceSubmitExam(reason: string): void {
    if (!this.userQuizId) {
      this.router.navigate(['/student/home']);
      return;
    }

    // Already submitted, just show notification and redirect
    if (this.isSubmitted) {
      this.notification.error(reason);
      this.router.navigate(['/student/home']);
      return;
    }

    this.isSubmitted = true;

    const payload: AddUserQuiz = {
      userId: this.userId,
      examId: this.examId,
      finishedAt: new Date().toISOString(),
      isComplete: true,
    };

    // Try to submit with retry logic
    let retryCount = 0;
    const maxRetries = 2; // Reduced from 3 to 2 retries

    const attemptSubmit = () => {
      this.doExamService
        .submitQuiz(this.userQuizId!, payload)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.cleanupQuizResources();
            this.notification.error(reason);
            this.router.navigate(['/student/home']);
          },
          error: () => {
            retryCount++;
            if (retryCount < maxRetries) {
              // Retry with exponential backoff
              setTimeout(() => attemptSubmit(), 800 * retryCount);
            } else {
              // All retries failed - still cleanup and redirect
              this.cleanupQuizResources();
              this.notification.error(
                `${reason} (Lỗi kết nối - bài thi sẽ được xử lý tự động)`
              );
              this.router.navigate(['/student/home']);
            }
          },
        });
    };

    attemptSubmit();
  }

  cleanupQuizResources(): void {
    // Clear all localStorage items related to this quiz
    if (this.userQuizId) {
      localStorage.removeItem(`quiz_${this.userQuizId}_leave_attempts`);
    }

    // Cleanup timer
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.cleanupQuizResources();

    // Remove all event listeners
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  onMultiChoiceChange(questionId: string): void {
    if (!this.userQuizId) return;

    const selected = this.selectedAnswers[this.currentQuestionIndex];
    for (const [answerId, isSelected] of Object.entries(selected)) {
      if (isSelected) {
        this.recordAnswer(questionId, answerId);
      }
    }
  }

  setupVisibilityHandlers(): void {
    // Handle tab visibility changes
    document.addEventListener(
      'visibilitychange',
      (this.handleVisibilityChange = this.handleVisibilityChange.bind(this))
    );

    // Handle window focus changes
    window.addEventListener(
      'blur',
      (this.handleWindowBlur = this.handleWindowBlur.bind(this))
    );
    window.addEventListener(
      'focus',
      (this.handleWindowFocus = this.handleWindowFocus.bind(this))
    );

    // Handle page unload attempts
    window.addEventListener(
      'beforeunload',
      (this.handleBeforeUnload = this.handleBeforeUnload.bind(this))
    );

    // Handle navigation attempts (both browser back and manual URL changes)
    window.onpopstate = () => {
      if (!this.isSubmitted) {
        this.forceSubmitExam(
          'Bạn đã cố gắng rời khỏi trang bài thi. Hệ thống tự động nộp bài!'
        );
      }
    };
  }

  // Event handlers for focus and visibility
  handleVisibilityChange(): void {
    if (document.hidden && !this.isSubmitted) {
      if (!this.isUserAway) {
        this.isUserAway = true;
        this.handleUserLeaveAttempt('Bạn đã chuyển sang tab khác!');
      }
    } else {
      this.isUserAway = false;
      this.isInFocus = true;
    }
  }

  handleWindowBlur(): void {
    if (!this.isSubmitted && !this.isUserAway && !document.hidden) {
      this.isUserAway = true;
      this.isInFocus = false;
      this.handleUserLeaveAttempt('Bạn đã chuyển khỏi cửa sổ bài thi!');
    }
  }

  handleWindowFocus(): void {
    this.isUserAway = false;
    this.isInFocus = true;
  }

  handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.isSubmitted) {
      // Force exam submission when user tries to leave/refresh
      this.forceSubmitExam(
        'Bạn đã rời khỏi trang bài thi. Hệ thống tự động nộp bài!'
      );

      // Still show browser warning
      event.preventDefault();
      event.returnValue =
        'Rời khỏi trang sẽ kết thúc bài thi của bạn. Bạn có chắc chắn muốn tiếp tục?';
    }
  }

  handleUserLeaveAttempt(message: string): void {
    this.leaveAttempts++;

    // Save attempts count to localStorage
    if (this.userQuizId) {
      localStorage.setItem(
        `quiz_${this.userQuizId}_leave_attempts`,
        this.leaveAttempts.toString()
      );
    }

    // Auto-submit if max attempts reached
    if (this.leaveAttempts >= this.MAX_LEAVE_ATTEMPTS) {
      this.forceSubmitExam(
        'Bạn đã rời khỏi trang bài thi quá nhiều lần (3/3). Hệ thống sẽ tự động nộp bài!'
      );
    } else {
      // Show warning
      const attemptsLeft = this.MAX_LEAVE_ATTEMPTS - this.leaveAttempts;
      this.notification.warning(
        `${message} Bạn còn ${attemptsLeft} lần rời trước khi bài thi tự động bị nộp.`
      );
    }
  }
}
