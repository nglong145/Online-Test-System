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
import { Exam, ExamQuiz } from '../../models/exam.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ExamService } from '../../services/exam.service';
import { DatePipe } from '@angular/common';
import { FilterExamQuiz } from '../../../student/models/quiz.model';
import { FilterUserQuiz, UserQuiz } from '../../models/userQuiz.model';
import { QuizService } from '../../../student/services/quiz.service';

@Component({
  selector: 'app-exam-detail',
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
  templateUrl: './exam-detail.component.html',
  styleUrl: './exam-detail.component.scss',
  providers: [DatePipe],
})
export class ExamDetailComponent {
  exam: Exam = {
    id: '',
    name: '',
    accessCode: '',
    startTime: '',
    endTime: '',
    description: '',
    isActive: true,
  };

  // Dữ liệu mock của các câu hỏi trong exam
  questionsDataSource = [
    {
      title: 'Question 1',
      description: 'Description for question 1',
      duration: 30,
    },
    {
      title: 'Question 2',
      description: 'Description for question 2',
      duration: 45,
    },
  ];

  // Dữ liệu mock của các bài thi đã nộp
  examsDataSource = [
    {
      examName: 'Math Final Exam',
      examPeriod: '2024 Spring',
      startDate: new Date('2024-06-01T09:00:00'),
      endDate: new Date('2024-06-01T12:00:00'),
      score: 85,
    },
    {
      examName: 'Physics Final Exam',
      examPeriod: '2024 Spring',
      startDate: new Date('2024-06-05T09:00:00'),
      endDate: new Date('2024-06-05T12:00:00'),
      score: 90,
    },
  ];

  filteredQuestionsDataSource = this.questionsDataSource;
  filteredExamsDataSource = this.examsDataSource;

  questionsDisplayedColumns: string[] = ['title', 'description', 'duration'];
  examDisplayedColumns: string[] = [
    'examName',
    'examPeriod',
    'startDate',
    'endDate',
    'score',
  ];

  totalQuestions: number = this.questionsDataSource.length;
  totalExams: number = this.examsDataSource.length;
  pageSize: number = 5;

  // Các bộ lọc
  titleFilter: string = '';
  examPeriodFilter: string = '';
  examNameFilter: string = '';
  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;
  scoreFilter: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private notification: SnackbarService,
    private examService: ExamService,
    private quizService: QuizService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.loadExamDetails(examId);
    }
  }

  // exam detail
  convertToLocalDateFormat(date: string): string {
    const dateObj = new Date(date); // Chuyển chuỗi ISO thành đối tượng Date
    const day = ('0' + dateObj.getDate()).slice(-2);
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const year = dateObj.getFullYear();
    const hours = ('0' + dateObj.getHours()).slice(-2);
    const minutes = ('0' + dateObj.getMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`; // Định dạng chuẩn "yyyy-MM-ddTHH:mm"
  }

  loadExamDetails(examId: string): void {
    if (examId) {
      this.examService.getExamById(examId).subscribe(
        (response) => {
          this.exam = response;
          this.exam.startTime = this.convertToLocalDateFormat(
            this.exam.startTime
          );
          this.exam.endTime = this.convertToLocalDateFormat(this.exam.endTime);
          this.loadExamQuizzes();
          this.loadUserQuizzes();
        },
        (error) => {
          console.error('Error fetching teacher details', error);
        }
      );
    }
  }

  updateExam(): void {
    this.examService.updateExam(this.exam.id, this.exam).subscribe(
      (response) => {
        this.notification.success('Cập nhật thành công');
        this.loadExamDetails(this.exam.id);
      },
      (error) => {
        this.notification.error(error);
        console.error('Error updating teacher', error);
      }
    );
  }

  // ExamQuiz
  filteredExamQuizDataSource: ExamQuiz[] = [];
  totalExamQuizzes = 0;
  pageSizeExamQuiz = 5;
  filter: FilterExamQuiz = {};

  examQuizDisplayedColumns = ['title', 'totalQuestion', 'duration'];

  loadExamQuizzes(
    pageIndex: number = 1,
    pageSize: number = this.pageSize
  ): void {
    const filter = {
      examId: this.exam.id,
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

    this.examService
      .getFilterExamQuiz(pageIndex, pageSize, 'id', 'asc', filter)
      .subscribe((result) => {
        this.filteredExamQuizDataSource = result.items;
        this.totalExams = result.totalPages * pageSize; // Hoặc nếu API có `total` thì thay vào
      });
  }

  // Áp dụng bộ lọc
  applyFilter() {
    this.filteredQuestionsDataSource = this.questionsDataSource.filter(
      (question) => {
        const matchesTitle = this.titleFilter
          ? question.title
              .toLowerCase()
              .includes(this.titleFilter.toLowerCase())
          : true;
        return matchesTitle;
      }
    );

    this.filteredExamsDataSource = this.examsDataSource.filter((exam) => {
      const matchesExamName = this.examNameFilter
        ? exam.examName
            .toLowerCase()
            .includes(this.examNameFilter.toLowerCase())
        : true;
      const matchesExamPeriod = this.examPeriodFilter
        ? exam.examPeriod
            .toLowerCase()
            .includes(this.examPeriodFilter.toLowerCase())
        : true;
      const matchesStartDate = this.startDateFilter
        ? exam.startDate >= this.startDateFilter
        : true;
      const matchesEndDate = this.endDateFilter
        ? exam.endDate <= this.endDateFilter
        : true;
      const matchesScore =
        this.scoreFilter !== null ? exam.score >= this.scoreFilter : true;
      return (
        matchesExamName &&
        matchesExamPeriod &&
        matchesStartDate &&
        matchesEndDate &&
        matchesScore
      );
    });
  }

  pageChangedExamQuiz(event: any) {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.loadExamQuizzes(pageIndex, pageSize);
  }

  // user quiz
  filteredUserQuizDataSource: UserQuiz[] = [];
  totalUserQuizzes = 0;
  pageSizeUserQuiz = 5;
  filterUserQuiz: FilterUserQuiz = {};

  userQuizDisplayedColumns = [
    'studentCode',
    'name',
    'quizName',
    'startedAt',
    'finishedAt',
    'score',
  ];

  loadUserQuizzes(
    pageIndex: number = 1,
    pageSize: number = this.pageSize
  ): void {
    const filter = {
      examId: this.exam.id,
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
        this.filteredUserQuizDataSource = result.items;
        this.totalExams = result.totalPages * pageSize; // Hoặc nếu API có `total` thì thay vào
      });
  }

  // Hàm thay đổi trang phân trang
  pageChangedUserQuiz(event: any) {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.loadUserQuizzes(pageIndex, pageSize);
  }
}
