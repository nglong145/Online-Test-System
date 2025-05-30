import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { GroupService } from '../../services/group.service';
import { FilterGroup, Group } from '../../models/group.model';
import {
  MAT_DATE_FORMATS,
  DateAdapter,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { CustomDateAdapter } from '../../../shared/custom-date-picker/custom-date-adapter';
import { MY_DATE_FORMATS } from '../../../shared/custom-date-picker/custom-date.model';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { DialogService } from '../../../shared/services/dialog.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-teacher-detail',
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
  templateUrl: './teacher-detail.component.html',
  styleUrl: './teacher-detail.component.scss',
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl },
  ],
})
export class TeacherDetailComponent implements OnInit {
  @ViewChild('formRef') formRef!: NgForm;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  teacher: User = {
    id: '',
    studentCode: null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    isActive: true,
    roleId: '',
    roleName: '',
  };

  filteredGroupDataSource: Group[] = [];
  totalGroups: number = 0;
  pageSize: number = 5;
  groupFilter: FilterGroup = {};
  groupDisplayedColumns: string[] = ['groupName', 'memberCount'];

  teacherDateOfBirth: Date | null = null;
  teacherId: string = '';
  originalTeacher: User | null = null;
  isLoading: boolean = false;
  isSaving: boolean = false;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private notification: SnackbarService,
    private groupService: GroupService,
    private router: Router,
    private dialog: DialogService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.route.params.subscribe((params) => {
      this.teacherId = params['id'];
      this.loadTeacherDetails();
      this.loadGroups();
    });
  }

  stringToDate(dateString: string): Date | null {
    if (!dateString) return null;
    return new Date(dateString);
  }

  loadTeacherDetails(): void {
    this.isLoading = true;
    this.userService
      .getUserById(this.teacherId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.teacher = response;
          this.teacherDateOfBirth = this.teacher.dateOfBirth
            ? new Date(this.teacher.dateOfBirth)
            : null;
          this.originalTeacher = JSON.parse(JSON.stringify(response));

          // Reset form dirty state after loading
          setTimeout(() => {
            if (this.formRef) {
              this.formRef.form.markAsPristine();
            }
          });
        },
        error: (error) => {
          this.notification.error('Không thể tải thông tin giáo viên');
        },
      });
  }

  updateTeacher(): void {
    if (!this.hasUnsavedChanges()) {
      this.notification.info('Không có thông tin thay đổi');
      return;
    }

    this.dialog
      .confirm({
        title: 'Xác nhận cập nhật',
        message: 'Bạn có chắc chắn muốn cập nhật thông tin giáo viên này?',
        confirmText: 'Cập nhật',
        cancelText: 'Hủy',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.saveTeacherData();
        }
      });
  }

  saveTeacherData(): void {
    if (this.teacher.studentCode === '') {
      this.teacher.studentCode = null;
    }

    this.isSaving = true;
    this.userService
      .updateUser(this.teacher.id, this.teacher)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.notification.success('Cập nhật thông tin giáo viên thành công');
          this.loadTeacherDetails();
        },
        error: (error) => {
          this.notification.error(
            error?.error?.error || 'Có lỗi xảy ra khi cập nhật thông tin!'
          );
        },
      });
  }

  onDateChange(date: Date | null) {
    this.teacherDateOfBirth = date;
    if (date) {
      this.teacher.dateOfBirth = this.formatDateISO(date);
    } else {
      this.teacher.dateOfBirth = undefined;
    }
  }

  formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadGroups(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = 'createdAt',
    sortOrder: string = 'desc'
  ): void {
    if (!this.teacherId) return;

    this.isLoading = true;
    this.groupFilter.userManager = this.teacherId;
    this.groupService
      .getFilterGroupByManager(index, size, sortBy, sortOrder, this.groupFilter)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (groups) => {
          this.filteredGroupDataSource = groups.items;
          this.totalGroups = groups.totalItems || groups.totalPages * size;
        },
        error: (error) => {
          this.notification.error('Không thể tải danh sách nhóm');
        },
      });
  }

  applyFilter(): void {
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.groupFilter.userManager = this.teacherId;
    this.loadGroups(1, this.pageSize);
  }

  clearFilter(): void {
    this.groupFilter = {
      userManager: this.teacherId,
    };
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadGroups();
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageSize = pageSize;
    this.loadGroups(pageIndex, pageSize);
  }

  goToGroupDetail(group: any) {
    this.router.navigate(['/admin/group', group.id]);
  }

  goBack(): void {
    if (this.hasUnsavedChanges()) {
      this.dialog
        .confirm({
          title: 'Xác nhận',
          message:
            'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn quay lại không?',
          confirmText: 'Quay lại',
          cancelText: 'Ở lại',
        })
        .subscribe((confirmed) => {
          if (confirmed) {
            this.router.navigate(['/admin/teacher']);
          }
        });
    } else {
      this.router.navigate(['/admin/teacher']);
    }
  }

  isTeacherChanged(): boolean {
    if (!this.originalTeacher) return false;
    return (
      JSON.stringify(this.teacher) !== JSON.stringify(this.originalTeacher)
    );
  }

  hasUnsavedChanges(): boolean {
    return this.isTeacherChanged();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }
}
