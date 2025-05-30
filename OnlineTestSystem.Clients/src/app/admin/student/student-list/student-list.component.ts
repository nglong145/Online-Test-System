import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { CreateUser, FilterUser, User } from '../../models/user.model';
import { AddModalComponent } from '../../../shared/add-modal/add-modal.component';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, Subject } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class StudentListComponent implements OnInit {
  displayedColumns: string[] = [
    'studentCode',
    'firstName',
    'email',
    'address',
    'phoneNumber',
    'isActive',
  ];
  studentDataSource = new MatTableDataSource<User>([]);
  totalUsers: number = 0;
  pageSize: number = 10;
  filter: FilterUser = {};

  isLoading: boolean = false;
  currentSortBy: string = 'createdAt';
  currentSortOrder: 'asc' | 'desc' | 'default' = 'desc';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filterSubject = new Subject<void>();

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private notification: SnackbarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadStudents();
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.loadStudents();
    });
  }

  ngAfterViewInit(): void {
    this.studentDataSource.sort = this.sort;

    this.sort.sortChange.subscribe((sortState: Sort) => {
      const clickedColumn = sortState.active;
      const clickedDirection = sortState.direction; // 'asc', 'desc' hoặc ''

      if (clickedColumn === this.currentSortBy) {
        if (this.currentSortOrder === 'desc') {
          // Trở về mặc định
          this.currentSortBy = 'createdAt';
          this.currentSortOrder = 'desc';

          // Cập nhật UI sort mà không emit sự kiện lặp lại
          this.sort.active = this.currentSortBy;
          this.sort.direction = this.currentSortOrder;
          this.sort._stateChanges.next();

          // load dữ liệu mặc định
          this.loadStudents(
            1,
            this.pageSize,
            this.currentSortBy,
            this.currentSortOrder
          );
          return; // thoát khỏi xử lý để tránh vòng lặp
        } else if (this.currentSortOrder === 'asc') {
          this.currentSortOrder = 'desc';
        } else {
          this.currentSortOrder = 'asc';
        }
      } else {
        this.currentSortBy = clickedColumn;
        this.currentSortOrder = 'asc';
      }

      this.loadStudents(
        1,
        this.pageSize,
        this.currentSortBy,
        this.currentSortOrder
      );
    });
  }

  applyFilter(): void {
    this.filterSubject.next();
  }

  clearFilter(): void {
    this.filter = {};
    this.loadStudents();
  }

  loadStudents(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = this.currentSortBy,
    sortOrder: string = this.currentSortOrder
  ): void {
    this.userService
      .getFilterUser('student', index, size, sortBy, sortOrder, this.filter)
      .subscribe(
        (response) => {
          this.studentDataSource = response.items;
          this.totalUsers = response.totalPages * size;
          this.isLoading = false;
        },
        (error) => {
          this.notification.error('Không thể tải dữ liệu sinh viên');
          this.isLoading = false;
        }
      );
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageSize = pageSize;
    this.loadStudents(
      pageIndex,
      pageSize,
      this.currentSortBy,
      this.currentSortOrder
    );
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(AddModalComponent, {
      width: '500px',
      panelClass: 'add-modal-dialog',
      data: {
        title: 'Thêm sinh viên Mới',
        fields: [
          {
            label: 'Họ và tên đệm',
            name: 'lastName',
            type: 'text',
            validators: {
              required: true,
            },
            errorMessages: {
              required: 'Vui lòng nhập Họ và tên đệm',
            },
          },
          {
            label: 'Tên',
            name: 'firstName',
            type: 'text',
            validators: {
              required: true,
            },
            errorMessages: {
              required: 'Vui lòng nhập tên',
            },
          },
          {
            label: 'Mã sinh viên',
            name: 'studentCode',
            type: 'text',
            validators: {
              required: true,
            },
            errorMessages: {
              required: 'Vui lòng nhập mã sinh viên',
            },
          },
          {
            label: 'Email',
            name: 'email',
            type: 'text',
            validators: {
              required: true,
              pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$',
            },
            errorMessages: {
              required: 'Vui lòng nhập email',
              pattern: 'Email không đúng định dạng',
            },
          },
          {
            label: 'Mật khẩu',
            name: 'password',
            type: 'password',
            hide: true,
            validators: {
              required: true,
              pattern:
                '^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
            },
            errorMessages: {
              required: 'Vui lòng nhập mật khẩu',
              pattern:
                'Mật khẩu phải gồm 8 ký tự và có ít nhất 1 chữ in hoa, 1 ký tự đặc biệt, 1 chữ số',
            },
          },
          {
            label: 'Ngày Sinh',
            name: 'dateOfBirth',
            type: 'date',
            validators: {
              required: true,
            },
            errorMessages: {
              required: 'Vui lòng nhập ngày sinh',
            },
          },
          {
            label: 'Số Điện Thoại',
            name: 'phoneNumber',
            type: 'text',
            validators: {
              required: true,
              pattern: '^(\\+84|0)[3|5|7|8|9]\\d{8}$',
            },
            errorMessages: {
              required: 'Vui lòng nhập số điện thoại',
              pattern: 'Số điện thoại không đúng định dạng',
            },
          },
          { label: 'Địa chỉ', name: 'address', type: 'textarea' },
        ],
        submitButtonText: 'Thêm Mới',
        submitAction: (formData: any) => this.addStudent(formData, dialogRef),
      },
    });
  }

  addStudent(formData: CreateUser, dialogRef: any): void {
    formData.role = 'student';
    this.userService.addUser(formData).subscribe(
      (response) => {
        this.notification.success('Học viên đã thêm thành công');
        this.loadStudents();
        dialogRef.close();
      },
      (error) => {
        this.notification.error(error?.error?.error || 'Có lỗi xảy ra!');
      }
    );
  }

  goToDetail(student: any) {
    this.router.navigate(['/admin/student', student.id]);
  }
}
