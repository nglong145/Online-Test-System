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
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { GroupService } from '../../services/group.service';
import { FilterGroupByManager } from '../../models/group.model';

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
})
export class TeacherDetailComponent implements OnInit {
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
  groupFilter: string = '';
  filteredGroupDataSource: any[] = []; // Danh sách nhóm đã lọc
  totalGroups: number = 0;
  pageSize: number = 5;
  groupDisplayedColumns: string[] = ['groupName', 'memberCount'];

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private notification: SnackbarService,
    private groupService: GroupService
  ) {}

  ngOnInit(): void {
    this.loadTeacherDetails();
  }

  loadTeacherDetails(): void {
    const teacherId = this.route.snapshot.paramMap.get('id'); // Lấy ID giảng viên từ URL
    if (teacherId) {
      this.userService.getUserById(teacherId).subscribe(
        (response) => {
          this.teacher = response;
          this.loadGroups(response.id, this.groupFilter); // Tải nhóm sau khi lấy giảng viên
        },
        (error) => {
          console.error('Error fetching teacher details', error);
        }
      );
    }
  }

  logStatus(): void {
    console.log('Current Status:', this.teacher.isActive);
  }

  // Phương thức gọi API cập nhật thông tin giảng viên
  updateTeacher(): void {
    if (this.teacher.studentCode === '') {
      this.teacher.studentCode = null; // Đặt studentCode là null nếu là teacher
    }
    this.userService.updateUser(this.teacher.id, this.teacher).subscribe(
      (response) => {
        this.notification.success('Cập nhật thành công');
        this.loadTeacherDetails();
      },
      (error) => {
        this.notification.error(error);
        console.error('Error updating teacher', error);
      }
    );
  }

  // Chuyển đổi định dạng ngày khi chọn
  onDateChange(event: any) {
    const selectedDate = event.value;
    this.teacher.dateOfBirth = this.formatDate(selectedDate); // Cập nhật ngày theo định dạng yyyy/mm/dd
  }

  // Định dạng ngày theo định dạng yyyy/mm/dd
  formatDate(date: any): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  loadGroups(managerId: string, groupNameFilter: string): void {
    this.groupService
      .getFilterGroupByManager(managerId, 1, this.pageSize, groupNameFilter)
      .subscribe(
        (groups) => {
          this.filteredGroupDataSource = groups.items;
          this.totalGroups = groups.length; // Sử dụng length nếu API không trả về tổng số nhóm
        },
        (error) => {
          console.error('Error fetching groups', error);
        }
      );
  }

  applyFilter(): void {
    if (this.teacher.id) {
      this.loadGroups(this.teacher.id, this.groupFilter); // Gọi lại API với filter mới
    }
  }

  // Phương thức phân trang nhóm lớp
  pageChanged(event: any): void {
    const filter = { pageIndex: event.pageIndex + 1, pageSize: event.pageSize }; // Bạn có thể thêm các filter khác nếu cần
    this.loadGroups(filter.pageIndex, filter.pageSize);
  }
}
