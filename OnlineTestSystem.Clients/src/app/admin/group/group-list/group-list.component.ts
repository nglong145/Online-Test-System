import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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

import { MatDialog } from '@angular/material/dialog';

import { UserService } from '../../services/user.service';

import { Router, RouterModule } from '@angular/router';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { AddGroup, FilterGroup, Group } from '../../models/group.model';
import { GroupService } from '../../services/group.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ModalCreateComponent } from '../modal-create/modal-create.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/auth/services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { FieldConfig } from '../modal-create/modal-create.component';
import { finalize, Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-group-list',
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
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl }],
})
export class GroupListComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  groupDataSource: Group[] = [];
  totalGroups: number = 0;
  pageSize: number = 10;
  filter: FilterGroup = {};
  isLoading: boolean = false;
  currentSortBy: string = 'createdAt';
  currentSortOrder: 'asc' | 'desc' = 'desc';

  userId: string = '';
  role: string | null = '';

  displayedColumns: string[] = [
    'name',
    'description',
    'memberCount',
    'isActive',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private groupService: GroupService,
    private notification: SnackbarService,
    private authService: AuthService,
    private router: Router
  ) {
    this.subscription = this.groupService.groupUpdate$.subscribe((updated) => {
      if (updated) {
        this.loadGroups();
      }
    });
  }

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
    this.userId = this.getOwnerIdFromToken();
    this.role = this.authService.getUserRole();
    if (this.role === 'Admin') {
      this.displayedColumns.splice(2, 0, 'userManager');
    }
    this.isLoading = true;
    this.loadGroups();
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe((sortState: Sort) => {
        const clickedColumn = sortState.active;
        const clickedDirection = sortState.direction;

        if (clickedColumn === this.currentSortBy) {
          if (clickedDirection === '') {
            // Reset to default sort
            this.currentSortBy = 'createdAt';
            this.currentSortOrder = 'desc';
            this.sort.active = this.currentSortBy;
            this.sort.direction = this.currentSortOrder;
            this.sort._stateChanges.next();
            this.loadGroups(
              1,
              this.pageSize,
              this.currentSortBy,
              this.currentSortOrder
            );
            return;
          } else {
            this.currentSortOrder = clickedDirection === 'asc' ? 'asc' : 'desc';
          }
        } else {
          this.currentSortBy = clickedColumn;
          this.currentSortOrder = clickedDirection === 'asc' ? 'asc' : 'desc';
        }

        this.loadGroups(
          1,
          this.pageSize,
          this.currentSortBy,
          this.currentSortOrder
        );
      });
    }
  }

  loadGroups(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = 'createdAt',
    sortOrder: string = 'desc'
  ): void {
    this.isLoading = true;

    if (this.role === 'Teacher') {
      this.filter.userManager = this.userId;
    }

    this.groupService
      .getFilteredGroups(index, size, sortBy, sortOrder, this.filter)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.groupDataSource = response.items;
          this.totalGroups = response.totalItems || response.totalPages * size;
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
    this.loadGroups(1, this.pageSize);
  }

  clearFilter(): void {
    this.filter = {};
    if (this.role === 'Teacher') {
      this.filter.userManager = this.userId;
    }
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadGroups(1, this.pageSize);
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.pageSize = pageSize;
    this.loadGroups(
      pageIndex,
      pageSize,
      this.currentSortBy,
      this.currentSortOrder
    );
  }

  openAddGroupModal(): void {
    const fields: FieldConfig[] = [
      {
        name: 'name',
        label: 'Tên nhóm',
        type: 'text',
        validators: {
          required: true,
        },
        errorMessages: {
          required: 'Vui lòng nhập tên nhóm',
        },
      },
      {
        name: 'description',
        label: 'Mô tả',
        type: 'textarea',
      },
    ];

    // Only add userManager field if role is Admin
    if (this.role === 'Admin') {
      fields.push({
        name: 'userManager',
        label: 'Người quản lý',
        type: 'select-search-api',
        apiService: this.userService,
        apiMethod: 'getFilterUser',
        apiFieldName: 'name',
        apiConfig: {
          extraParams: { role: 'teacher', isActive: true },
          pageSize: 10,
          sortBy: 'firstName',
          sortOrder: 'asc',
          mapResult: (item: any) => ({
            value: item.id,
            label: `${item.lastName} ${item.firstName}`,
          }),
        },
        options: [],
        validators: {
          required: true,
        },
        errorMessages: {
          required: 'Vui lòng chọn giáo viên quản lý',
        },
      });
    }

    const dialogRef = this.dialog.open(ModalCreateComponent, {
      width: '500px',
      panelClass: 'add-modal-dialog',
      data: {
        title: 'Thêm nhóm mới',
        fields: fields,
        submitButtonText: 'Tạo nhóm',
        submitAction: (formData: AddGroup) => {
          // If role is Teacher, automatically set userManager
          if (this.role === 'Teacher') {
            formData.userManager = this.userId;
          }
          formData.isActive = true;

          this.groupService.addGroup(formData).subscribe({
            next: (response) => {
              this.notification.success('Thêm nhóm thành công');
              this.loadGroups();
              dialogRef.close();
            },
            error: (error) => {
              console.error('Error creating group:', error);
              this.notification.error(
                error?.error?.message || 'Có lỗi xảy ra khi thêm nhóm'
              );
            },
          });
        },
      },
    });
  }

  goToDetail(group: any) {
    if (this.role === 'Admin') {
      this.router.navigate(['/admin/group', group.id]);
    } else if (this.role === 'Teacher') {
      this.router.navigate(['/teacher/group', group.id]);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
