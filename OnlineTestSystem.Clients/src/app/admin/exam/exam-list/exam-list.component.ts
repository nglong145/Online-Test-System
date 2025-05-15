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
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateExam, Exam, FilterExam } from '../../models/exam.model';
import { ExamService } from '../../services/exam.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { AddModalComponent } from '../../../shared/add-modal/add-modal.component';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';

@Component({
  selector: 'app-exam-list',
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
  ],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class ExamListComponent implements OnInit {
  examDataSource: Exam[] = [];
  totalUsers: number = 0;
  pageSize: number = 10;
  filter: FilterExam = {};

  displayedColumns: string[] = ['name', 'description', 'startTime', 'endTime'];

  constructor(
    private examService: ExamService,
    private dialog: MatDialog,
    private notification: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  applyFilter(): void {
    this.loadExams(1, this.pageSize);
  }

  clearFilter(): void {
    this.filter = {};
    this.loadExams(1, this.pageSize);
  }

  loadExams(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = 'name',
    sortOrder: string = 'asc'
  ): void {
    this.examService
      .getFilterExam(index, size, sortBy, sortOrder, this.filter)
      .subscribe(
        (response) => {
          this.examDataSource = response.items;
          this.totalUsers = response.totalPages * size;
        },
        (error) => {
          console.error('Error fetching teacher data', error);
        }
      );
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.loadExams(pageIndex, pageSize);
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(AddModalComponent, {
      width: '500px',
      data: {
        title: 'Thêm Kỳ thi Mới',
        fields: [
          { label: 'Tên kỳ thi', name: 'name', type: 'text' },
          { label: 'Mô tả', name: 'description', type: 'text' },
          { label: 'Mã truy cập', name: 'accessCode', type: 'text' },
          {
            label: 'Thời gian bắt đầu',
            name: 'startTime',
            type: 'date',
          },
          {
            label: 'Thời gian kết thúc',
            name: 'endTime',
            type: 'date',
          },
        ],
        submitButtonText: 'Thêm Mới',
        submitAction: (formData: any) => this.addExam(formData),
      },
    });
  }

  addExam(formData: CreateExam): void {
    this.examService.addExam(formData).subscribe(
      (response) => {
        this.notification.success('Kỳ thi đã thêm thành công');
        this.loadExams();
      },
      (error) => {
        this.notification.error(error);
        console.error('Lỗi khi thêm kỳ thi:', error);
      }
    );
  }
}
