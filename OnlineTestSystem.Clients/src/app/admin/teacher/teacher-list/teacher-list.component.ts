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
import { CreateUser, FilterUser, User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { AddModalComponent } from '../../../shared/add-modal/add-modal.component';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-teacher-list',
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
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './teacher-list.component.html',
  styleUrl: './teacher-list.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class TeacherListComponent implements OnInit {
  displayedColumns: string[] = [
    'firstName',
    'email',
    'address',
    'phoneNumber',
    'isActive',
  ];
  teacherDataSource = new MatTableDataSource<User>([]);
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
    this.teacherDataSource.sortData = (data: User[], sort: MatSort) => data;
    this.loadTeachers();
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.loadTeachers();
    });
  }

  ngAfterViewInit(): void {
    this.teacherDataSource.sort = this.sort;

    this.sort.sortChange.subscribe((sortState: Sort) => {
      // Reset paging khi sort thay đổi
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }

      // Xác định sort field và direction từ Material Sort
      if (sortState.direction) {
        // Nếu có direction (asc hoặc desc)
        this.currentSortBy = sortState.active;
        this.currentSortOrder = sortState.direction as 'asc' | 'desc';
      } else {
        // Nếu không có direction (trở về mặc định)
        this.currentSortBy = 'createdAt';
        this.currentSortOrder = 'desc';
      }

      // Gọi API với tham số sort mới
      this.isLoading = true;
      this.loadTeachers(
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
    this.loadTeachers();
  }

  loadTeachers(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = this.currentSortBy,
    sortOrder: string = this.currentSortOrder
  ): void {
    this.isLoading = true;
    this.userService
      .getFilterUser('teacher', index, size, sortBy, sortOrder, this.filter)
      .subscribe(
        (response) => {
          this.teacherDataSource = response.items;
          this.totalUsers = response.totalPages * size;
          this.isLoading = false;
        },
        (error) => {
          this.notification.error('Không thể tải dữ liệu giáo viên');
          this.isLoading = false;
        }
      );
  }

  pageChanged(event: any): void {
    // const pageIndex = event.pageIndex + 1;
    // const pageSize = event.pageSize;
    // this.loadTeachers(pageIndex, pageSize);
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageSize = pageSize;
    this.loadTeachers(
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
      disableClose: true,
      data: {
        title: 'Thêm Giảng Viên Mới',
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
        submitAction: (formData: any) => this.addTeacher(formData, dialogRef),
      },
    });
  }

  addTeacher(formData: CreateUser, dialogRef: any): void {
    this.isLoading = true;
    formData.studentCode = null;
    formData.role = 'teacher';

    this.userService.addUser(formData).subscribe(
      (response) => {
        this.notification.success('Giảng viên đã thêm thành công');
        this.loadTeachers();
        this.isLoading = false;
        dialogRef.close();
      },
      (error) => {
        this.notification.error(error?.error?.error || 'Có lỗi xảy ra!');
        this.isLoading = false;
      }
    );
  }

  goToDetail(teacher: any) {
    this.router.navigate(['/admin/teacher', teacher.id]);
  }
}
