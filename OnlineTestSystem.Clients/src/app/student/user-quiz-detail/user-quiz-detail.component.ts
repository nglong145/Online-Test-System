import { Component } from '@angular/core';
import {
  UserQuizDetail,
  UserQuizQuestionDetail,
} from '../models/userQuiz.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DoExamService } from '../services/do-exam.service';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-quiz-detail',
  imports: [CommonModule, MatIconModule],
  templateUrl: './user-quiz-detail.component.html',
  styleUrl: './user-quiz-detail.component.scss',
})
export class UserQuizDetailComponent {
  userQuizDetail: UserQuizDetail | null = null;
  activeQuestionIndex = 0;
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  constructor(
    private route: ActivatedRoute,
    private doExamService: DoExamService,
    private notification: SnackbarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userQuizId = this.route.snapshot.paramMap.get('id')!;
    this.loadUserQuizDetail(userQuizId);
  }

  loadUserQuizDetail(userQuizId: string) {
    this.doExamService.getUserQuizDetail(userQuizId).subscribe({
      next: (detail) => {
        this.userQuizDetail = detail;
      },
      error: () => {
        this.notification.error('Không lấy được dữ liệu chi tiết lần thi!');
      },
    });
  }

  // Kiểm tra câu hỏi này đã trả lời đúng hay sai
  isQuestionCorrect(question: UserQuizQuestionDetail): boolean {
    // Nếu có ít nhất 1 userChosenAnswer không đúng với đáp án đúng => sai
    const correctAnswerIds = question.answers
      .filter((a) => a.isCorrect)
      .map((a) => a.id);
    const userChosenIds = question.userChosenAnswerIds;
    // So sánh bộ đáp án user chọn với đáp án đúng
    return this.arraysEqual(correctAnswerIds, userChosenIds);
  }

  arraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return sorted1.every((val, index) => val === sorted2[index]);
  }

  // Kiểm tra đáp án này có phải là đáp án đúng của câu hỏi
  isAnswerCorrect(answerId: string, question: UserQuizQuestionDetail): boolean {
    return question.answers.some((a) => a.id === answerId && a.isCorrect);
  }

  // Kiểm tra đáp án này có được người dùng chọn không
  isAnswerSelected(
    answerId: string,
    question: UserQuizQuestionDetail
  ): boolean {
    return question.userChosenAnswerIds.includes(answerId);
  }

  setActiveQuestion(index: number) {
    if (
      this.userQuizDetail?.questions &&
      index >= 0 &&
      index < this.userQuizDetail.questions.length
    ) {
      this.activeQuestionIndex = index;
    }
  }

  get activeQuestion(): UserQuizQuestionDetail | null {
    if (
      this.userQuizDetail?.questions &&
      this.activeQuestionIndex >= 0 &&
      this.activeQuestionIndex < this.userQuizDetail.questions.length
    ) {
      return this.userQuizDetail.questions[this.activeQuestionIndex];
    }
    return null;
  }

  goBack(): void {
    this.router.navigate(['/student/home']);
  }
}
