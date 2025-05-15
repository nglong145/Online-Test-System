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
import { UserService } from '../../services/user.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { CreateUser, FilterUser, User } from '../../models/user.model';
import { AddModalComponent } from '../../../shared/add-modal/add-modal.component';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
@Component({
  selector: 'app-student-list',
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
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class StudentListComponent implements OnInit {
  studentDataSource: User[] = [];
  totalUsers: number = 0;
  pageSize: number = 10;
  filter: FilterUser = {};

  displayedColumns: string[] = [
    'studentCode',
    'name',
    'email',
    'dateOfBirth',
    'address',
    'phoneNumber',
  ];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private notification: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  applyFilter(): void {
    this.loadStudents(1, this.pageSize);
  }

  clearFilter(): void {
    this.filter = {};
    this.loadStudents(1, this.pageSize);
  }

  loadStudents(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = 'firstName',
    sortOrder: string = 'asc'
  ): void {
    this.userService
      .getFilterUser('student', index, size, sortBy, sortOrder, this.filter)
      .subscribe(
        (response) => {
          this.studentDataSource = response.items;
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
    this.loadStudents(pageIndex, pageSize);
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(AddModalComponent, {
      width: '500px',
      data: {
        title: 'Thêm học viên Mới',
        fields: [
          { label: 'Họ', name: 'lastName', type: 'text' },
          { label: 'Tên', name: 'firstName', type: 'text' },
          { label: 'Mã học viên', name: 'studentCode', type: 'text' },
          { label: 'Email', name: 'email', type: 'text' },
          { label: 'Password', name: 'password', type: 'text' },
          { label: 'Ngày Sinh', name: 'dateOfBirth', type: 'date' },
          { label: 'Số Điện Thoại', name: 'phoneNumber', type: 'text' },
          { label: 'Địa chỉ', name: 'address', type: 'text' },
        ],
        submitButtonText: 'Thêm Mới',
        submitAction: (formData: any) => this.addStudent(formData),
      },
    });
  }

  addStudent(formData: CreateUser): void {
    formData.role = 'student';
    this.userService.addUser(formData).subscribe(
      (response) => {
        this.notification.success('Học viên đã thêm thành công');
        this.loadStudents();
      },
      (error) => {
        this.notification.error(error);
        console.error('Lỗi khi thêm giảng viên:', error);
      }
    );
  }
}
