import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
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
import {
  FormControl,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { GroupService } from '../../services/group.service';
import { Group, UserGroup } from '../../models/group.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { User } from '../../models/user.model';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AuthService } from '../../../core/auth/services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { DialogService } from '../../../shared/services/dialog.service';

@Component({
  selector: 'app-group-detail',
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
    MatCardModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './group-detail.component.html',
  styleUrl: './group-detail.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class GroupDetailComponent implements OnInit {
  @ViewChild('formRef') formRef!: NgForm;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  group: Group = {
    id: '',
    name: '',
    description: '',
    userManager: '',
    createdDate: '',
    managerFisrtName: '',
    managerLastName: '',
    isActive: true,
    memberCount: 0,
  };
  originalGroup: Group | null = null;

  userId: string = '';
  role: string | null = '';
  isLoading: boolean = false;
  isSaving: boolean = false;

  // select teacher
  teacherSelect: User[] = [];
  teacherSelectFilter: User[] = [];
  teacherFilterCtrl = new FormControl('');
  pageIndexSelect = 1;
  pageSizeSelect = 100;
  sortBy = 'firstName';
  sortOrder = 'asc';

  showAddUserRow = false;
  selectedAddUserId: string | null = null;
  studentAddOptions: User[] = [];
  studentAddFilterCtrl = new FormControl('');

  filteredUserGroupDataSource: UserGroup[] = [];
  totalUserGroups: number = 0;
  pageSize: number = 5;
  userGroupFilter: any = {};
  userGroupDisplayedColumns: string[] = ['studentCode', 'fullName', 'actions'];

  groupId: string = '';

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private userService: UserService,
    private snackBar: SnackbarService,
    private authService: AuthService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  getOwnerIdFromToken(): string {
    try {
      const token = localStorage.getItem('token');
      if (!token) return '';
      const decoded: any = jwtDecode(token);
      const userId =
        decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ];
      return userId || '';
    } catch (error) {
      console.error('Failed to decode token', error);
      return '';
    }
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.userId = this.getOwnerIdFromToken();
    this.role = this.authService.getUserRole();

    this.route.params.subscribe((params) => {
      this.groupId = params['id'];
      this.loadGroupDetails();
      this.loadUserGroups();
    });

    // Load teachers for select
    this.loadTeachersSelect('');
    this.teacherFilterCtrl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.loadTeachersSelect(searchTerm || '');
      });

    // Load students for select with filter
    this.studentAddFilterCtrl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((term) => this.loadStudentAddOptions(term || ''));
  }

  loadTeachersSelect(searchName: string): void {
    const filter: any = { name: searchName, isActive: true };
    this.userService
      .getFilterUser(
        'teacher',
        1,
        this.pageSizeSelect,
        this.sortBy,
        this.sortOrder,
        filter
      )
      .pipe(finalize(() => {}))
      .subscribe({
        next: (res) => {
          this.teacherSelect = res.items ?? [];
          this.teacherSelectFilter = [...this.teacherSelect];
        },
        error: (err) => {
          this.snackBar.error('Không thể tải danh sách giáo viên');
        },
      });
  }

  onTeacherSelectOpen(opened: boolean): void {
    if (opened) {
      this.loadTeachersSelect(this.teacherFilterCtrl.value || '');
    }
  }

  onTeacherSelected(selectedId: string): void {
    const selected = this.teacherSelect.find((c) => c.id === selectedId);
    if (selected && this.group) {
      this.group.userManager = selected.id;
    }
  }

  compareTeacherIds(id1: string, id2: string): boolean {
    return id1 && id2 ? id1 === id2 : id1 === id2;
  }

  loadGroupDetails(): void {
    this.isLoading = true;
    this.groupService
      .getGroupById(this.groupId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.group = response;
          this.originalGroup = JSON.parse(JSON.stringify(response));

          if (
            this.role === 'Teacher' &&
            this.group.userManager !== this.userId
          ) {
            this.router.navigate(['/access-denied']);
            return;
          }
        },
        error: (error) => {
          this.snackBar.error('Không thể tải thông tin nhóm');
        },
      });
  }

  isGroupChanged(): boolean {
    if (!this.originalGroup) return false;
    return JSON.stringify(this.group) !== JSON.stringify(this.originalGroup);
  }

  isAddingUser(): boolean {
    return !!this.showAddUserRow;
  }

  hasUnsavedChanges(): boolean {
    return this.isGroupChanged() || this.isAddingUser();
  }

  updateGroup(): void {
    if (!this.isGroupChanged()) {
      this.snackBar.info('Không có thông tin thay đổi');
      return;
    }

    this.dialogService
      .confirm({
        title: 'Xác nhận cập nhật',
        message: 'Bạn có chắc chắn muốn cập nhật thông tin nhóm này?',
        confirmText: 'Cập nhật',
        cancelText: 'Hủy',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.saveGroupChanges();
        }
      });
  }

  saveGroupChanges(): void {
    this.isSaving = true;

    if (this.role === 'Teacher') {
      this.group.userManager = this.userId;
    }

    this.groupService
      .updateGroup(this.group.id, this.group)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.snackBar.success('Cập nhật thông tin nhóm thành công');
          this.loadGroupDetails();
        },
        error: (error) => {
          this.snackBar.error(
            error?.error?.error || 'Có lỗi xảy ra khi cập nhật thông tin!'
          );
        },
      });
  }

  loadUserGroups(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = 'userId',
    sortOrder: string = 'desc'
  ): void {
    this.isLoading = true;
    this.userGroupFilter.groupId = this.groupId;
    this.groupService
      .getFilteredUserGroups(
        index,
        size,
        sortBy,
        sortOrder,
        this.userGroupFilter
      )
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (groups) => {
          this.filteredUserGroupDataSource = groups.items;
          this.totalUserGroups = groups.totalItems || groups.totalPages * size;
        },
        error: (error) => {
          console.error('Error fetching group members', error);
          this.snackBar.error('Không thể tải danh sách thành viên');
        },
      });
  }

  applyFilter(): void {
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.userGroupFilter.groupId = this.groupId;
    this.loadUserGroups(1, this.pageSize);
  }

  clearFilter(): void {
    this.userGroupFilter = {
      groupId: this.groupId,
    };
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadUserGroups();
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageSize = pageSize;
    this.loadUserGroups(pageIndex, pageSize);
  }

  loadStudentAddOptions(searchTerm: string = ''): void {
    this.userService
      .getFilterUser('student', 1, 100, 'studentCode', 'asc', {
        name: searchTerm,
        isActive: true,
      })
      .subscribe({
        next: (res) => {
          this.studentAddOptions = res.items;
        },
        error: (err) => {
          this.snackBar.error('Không thể tải danh sách sinh viên');
        },
      });
  }

  onStudentSelectOpen(opened: boolean): void {
    if (opened) {
      this.loadStudentAddOptions(this.studentAddFilterCtrl.value || '');
    }
  }

  compareStudentIds(id1: string, id2: string): boolean {
    return id1 && id2 ? id1 === id2 : id1 === id2;
  }

  confirmAddUser(): void {
    if (!this.selectedAddUserId) {
      this.snackBar.error('Vui lòng chọn sinh viên');
      return;
    }

    this.isLoading = true;
    this.groupService
      .addUserGroup(this.groupId, this.selectedAddUserId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.snackBar.success(res.message || 'Thêm thành viên thành công!');
          this.showAddUserRow = false;
          this.selectedAddUserId = null;
          this.loadUserGroups();
          this.loadGroupDetails(); // Refresh member count
        },
        error: (err: any) => {
          this.snackBar.error(
            err?.error?.message || 'Có lỗi xảy ra khi thêm thành viên!'
          );
        },
      });
  }

  cancelAddUser(): void {
    this.showAddUserRow = false;
    this.selectedAddUserId = null;
  }

  removeUserFromGroup(user: UserGroup): void {
    const stringDelete = `sinh viên ${user.fullName} khỏi nhóm ${this.group.name}`;

    this.dialogService.confirmDelete(stringDelete).subscribe((confirmed) => {
      if (confirmed) {
        this.isLoading = true;
        this.groupService
          .deleteUserGroup(this.groupId, user.userId)
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe({
            next: () => {
              this.snackBar.success('Xóa thành viên thành công!');
              this.loadUserGroups();
              this.loadGroupDetails(); // Refresh member count
            },
            error: (error) => {
              this.snackBar.error('Xóa thành viên thất bại!');
            },
          });
      }
    });
  }

  goBack(): void {
    if (this.hasUnsavedChanges()) {
      this.dialogService
        .confirm({
          title: 'Xác nhận',
          message:
            'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn quay lại không?',
          confirmText: 'Quay lại',
          cancelText: 'Ở lại',
        })
        .subscribe((confirmed) => {
          if (confirmed) {
            this.navigateBack();
          }
        });
    } else {
      this.navigateBack();
    }
  }

  navigateBack(): void {
    if (this.role === 'Teacher') {
      this.router.navigate(['/teacher/group']);
    } else if (this.role === 'Admin') {
      this.router.navigate(['/admin/group']);
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }
}
