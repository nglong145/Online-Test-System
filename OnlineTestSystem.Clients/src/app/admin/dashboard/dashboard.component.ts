import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Inject,
  LOCALE_ID,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../services/dashboard.service';
import { ExamService } from '../services/exam.service';
import { DashboardSummary, ExamAverageScore } from '../models/dashboard.model';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { finalize } from 'rxjs';
import { formatDate } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import {
  MAT_DATE_FORMATS,
  DateAdapter,
  MAT_DATE_LOCALE,
} from '@angular/material/core';

Chart.register(...registerables);

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' },
  },
  display: {
    dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' },
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Dashboard summary data
  dashboardSummary: DashboardSummary = {
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalExams: 0,
    totalQuizzes: 0,
    totalGroups: 0,
    completedExamsCount: 0,
    runningExamsCount: 0,
    finishedExamsCount: 0,
  };

  // Loading state
  isLoading = true;
  isChartLoading = true;
  isExamsLoading = true;

  // Chart data and options
  examScores: ExamAverageScore[] = [];
  examChart: any;

  // Date filter for chart
  dateRangeForm = new FormGroup({
    start: new FormControl<Date | null>(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ),
    end: new FormControl<Date | null>(new Date()),
  });

  // Current exams
  ongoingExams: any[] = [];
  upcomingExams: any[] = [];

  ongoingExamsPage = 1;
  upcomingExamsPage = 1;
  ongoingExamsPageSize = 5;
  upcomingExamsPageSize = 5;
  ongoingExamsHasMore = true;
  upcomingExamsHasMore = true;
  isLoadingMoreOngoing = false;
  isLoadingMoreUpcoming = false;

  constructor(
    private dashboardService: DashboardService,
    private examService: ExamService,
    private notification: SnackbarService,
    private dateAdapter: DateAdapter<Date>,
    @Inject(LOCALE_ID) private locale: string
  ) {
    this.dateAdapter.setLocale('vi-VN');
  }

  @ViewChild('ongoingExamsContainer') ongoingExamsContainer!: ElementRef;
  @ViewChild('upcomingExamsContainer') upcomingExamsContainer!: ElementRef;

  ngOnInit(): void {
    this.loadSummaryData();
    this.loadChartData();
    this.loadOngoingExams();
    this.loadUpcomingExams();
  }

  ngOnDestroy(): void {
    // Clean up chart resources when component is destroyed
    if (this.examChart) {
      this.examChart.destroy();
      this.examChart = null;
    }
  }

  loadSummaryData(): void {
    this.isLoading = true;
    this.dashboardService
      .getSummary()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.dashboardSummary = data;
        },
        error: (error) => {
          this.notification.error('Không thể tải dữ liệu tổng quan');
          console.error('Error loading dashboard summary:', error);
        },
      });
  }

  loadChartData(): void {
    this.isChartLoading = true;

    // Cleanup existing chart before loading new data
    if (this.examChart) {
      this.examChart.destroy();
      this.examChart = null;
    }

    const startDate = this.dateRangeForm.get('start')?.value;
    const endDate = this.dateRangeForm.get('end')?.value;

    const filter = {
      startDate: startDate ? this.formatDateForApi(startDate, true) : undefined,
      endDate: endDate ? this.formatDateForApi(endDate, false) : undefined,
      passingScore: 5,
    };

    this.dashboardService
      .getFilterChart(filter)
      .pipe(finalize(() => (this.isChartLoading = false)))
      .subscribe({
        next: (data) => {
          this.examScores = data;
          if (this.examScores && this.examScores.length > 0) {
            setTimeout(() => this.initializeChart(), 100);
          }
        },
        error: (error) => {
          this.notification.error('Không thể tải dữ liệu biểu đồ');
        },
      });
  }

  formatDateForApi(date: Date, isStartDate: boolean): string {
    // Clone the date to avoid modifying the original
    const newDate = new Date(date);

    // Set time to beginning or end of day
    if (isStartDate) {
      newDate.setHours(0, 0, 0, 0);
    } else {
      newDate.setHours(23, 59, 59, 999);
    }

    // Return in ISO format for API
    return newDate.toISOString();
  }

  // Format date for display
  formatDisplayDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDate(date, 'dd/MM/yyyy HH:mm', this.locale);
  }

  initializeChart(): void {
    if (!this.examScores || this.examScores.length === 0) {
      return; // Don't initialize if there's no data
    }

    const chartCanvas = document.getElementById(
      'examScoresChart'
    ) as HTMLCanvasElement;
    if (!chartCanvas) return;

    // Make sure we don't have an existing chart
    if (this.examChart) {
      this.examChart.destroy();
    }

    const labels = this.examScores.map((exam) => exam.examName);
    const avgScores = this.examScores.map((exam) => exam.averageScore);
    const passRates = this.examScores.map(
      (exam) => Math.round((exam.passRate + Number.EPSILON) * 100) / 100
    ); // Use original passRate value

    this.examChart = new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Điểm trung bình',
            data: avgScores,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y-scores',
          },
          {
            label: 'Tỉ lệ đạt (%)',
            data: passRates,
            type: 'line',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            pointRadius: 4,
            pointBorderWidth: 2,
            fill: false,
            tension: 0.4,
            yAxisID: 'y-rates',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          'y-scores': {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            min: 0,
            max: 10, // Max score is typically 10
            title: {
              display: true,
              text: 'Điểm trung bình',
              color: 'rgba(54, 162, 235, 1)',
            },
            grid: {
              display: true,
            },
            ticks: {
              color: 'rgba(54, 162, 235, 1)',
            },
          },
          'y-rates': {
            type: 'linear',
            position: 'right',
            beginAtZero: true,
            min: 0,
            max: 100, // Pass rates are between 0-100%
            title: {
              display: true,
              text: 'Tỉ lệ đạt (%)',
              color: 'rgba(255, 99, 132, 1)',
            },
            grid: {
              display: false,
            },
            ticks: {
              color: 'rgba(255, 99, 132, 1)',
            },
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: 'Điểm trung bình và tỉ lệ đạt theo kỳ thi',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            position: 'top',
            align: 'center',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.dataset.yAxisID === 'y-rates') {
                  label += context.parsed.y + '%';
                } else {
                  label += context.parsed.y.toFixed(2);
                }
                return label;
              },
            },
          },
        },
      },
    });
  }

  applyDateFilter(): void {
    this.loadChartData();
  }

  resetDateFilter(): void {
    this.dateRangeForm.setValue({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    });
    this.loadChartData();
  }

  getTimeRemaining(endTime: string): string {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const distance = end - now;

    if (distance <= 0) return 'Đã kết thúc';

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    result += `${minutes}m`;

    return result;
  }

  navigateToExamDetail(examId: string): void {
    window.location.href = `/admin/exam/${examId}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDate(date, 'dd/MM/yyyy HH:mm', this.locale);
  }

  loadOngoingExams(loadMore: boolean = false): void {
    if (loadMore) {
      this.isLoadingMoreOngoing = true;
    } else {
      this.isExamsLoading = true;
      this.ongoingExamsPage = 1;
      this.ongoingExams = [];
    }

    this.examService
      .getFilterExamOncoming(
        this.ongoingExamsPage,
        this.ongoingExamsPageSize,
        'startTime',
        'asc',
        { isActive: true }
      )
      .pipe(
        finalize(() => {
          this.isLoadingMoreOngoing = false;
          this.isExamsLoading = false;
        })
      )
      .subscribe({
        next: (result) => {
          const newExams = result.items || [];
          if (loadMore) {
            this.ongoingExams = [...this.ongoingExams, ...newExams];
          } else {
            this.ongoingExams = newExams;
          }

          // Check if there are more exams to load
          this.ongoingExamsHasMore =
            newExams.length === this.ongoingExamsPageSize;
        },
        error: (error) => {
          this.notification.error(
            'Không thể tải danh sách kỳ thi đang diễn ra'
          );
          console.error('Error loading ongoing exams:', error);
        },
      });
  }

  // Modify loadUpcomingExams to support pagination
  loadUpcomingExams(loadMore: boolean = false): void {
    if (loadMore) {
      this.isLoadingMoreUpcoming = true;
    } else {
      this.upcomingExamsPage = 1;
      this.upcomingExams = [];
    }

    this.examService
      .getFilterExamUpcoming(
        this.upcomingExamsPage,
        this.upcomingExamsPageSize,
        'startTime',
        'asc',
        { isActive: true }
      )
      .pipe(
        finalize(() => {
          this.isLoadingMoreUpcoming = false;
        })
      )
      .subscribe({
        next: (result) => {
          const newExams = result.items || [];
          if (loadMore) {
            this.upcomingExams = [...this.upcomingExams, ...newExams];
          } else {
            this.upcomingExams = newExams;
          }

          // Check if there are more exams to load
          this.upcomingExamsHasMore =
            newExams.length === this.upcomingExamsPageSize;
        },
        error: (error) => {
          this.notification.error('Không thể tải danh sách kỳ thi sắp diễn ra');
        },
      });
  }

  // Add load more methods
  loadMoreOngoingExams(): void {
    if (this.ongoingExamsHasMore && !this.isLoadingMoreOngoing) {
      this.ongoingExamsPage++;
      this.loadOngoingExams(true);
    }
  }

  loadMoreUpcomingExams(): void {
    if (this.upcomingExamsHasMore && !this.isLoadingMoreUpcoming) {
      this.upcomingExamsPage++;
      this.loadUpcomingExams(true);
    }
  }

  // Add scroll event handlers
  onOngoingExamsScroll(event: Event): void {
    const element = this.ongoingExamsContainer.nativeElement;
    if (
      element.scrollHeight - element.scrollTop - element.clientHeight < 50 &&
      this.ongoingExamsHasMore &&
      !this.isLoadingMoreOngoing
    ) {
      this.loadMoreOngoingExams();
    }
  }

  onUpcomingExamsScroll(event: Event): void {
    const element = this.upcomingExamsContainer.nativeElement;
    if (
      element.scrollHeight - element.scrollTop - element.clientHeight < 50 &&
      this.upcomingExamsHasMore &&
      !this.isLoadingMoreUpcoming
    ) {
      this.loadMoreUpcomingExams();
    }
  }
}
