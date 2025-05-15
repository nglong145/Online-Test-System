import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../services/group.service';
import { UserService } from '../../services/user.service';
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
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  ],
  templateUrl: './group-detail.component.html',
  styleUrl: './group-detail.component.scss',
})
export class GroupDetailComponent implements OnInit {
  groupId!: string;
  group: any = {};
  teachers: any[] = [];
  members: any[] = [];
  pageSize = 10;
  totalMembers = 0;
  currentPage = 0;

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id')!;

    // ✅ Load teachers trước, rồi mới load group
    this.userService
      .getFilterUser('teacher', 1, 10, 'CreatedAt', 'asc', {})
      .subscribe({
        next: (teachers) => {
          this.teachers = teachers;

          // Sau khi có danh sách teachers → load group
          this.groupService.getGroupById(this.groupId).subscribe({
            next: (group) => {
              this.group = group;

              // ✅ ép kiểu userManagerId về number để đảm bảo match select
              if (this.group.userManagerId) {
                this.group.userManagerId = +this.group.userManagerId;
              }
            },
            error: () =>
              this.snackBar.open('Failed to load group', 'Close', {
                duration: 3000,
              }),
          });
        },
        error: () =>
          this.snackBar.open('Failed to load teachers', 'Close', {
            duration: 3000,
          }),
      });

    // Load members song song
    this.loadMembers();
  }

  loadMembers(): void {
    this.groupService
      .getUserGroup(this.groupId, this.currentPage + 1, this.pageSize)
      .subscribe({
        next: (response) => {
          this.members = response;
        },
        error: () => {
          this.snackBar.open('Failed to load members', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  pageChanged(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMembers();
  }

  updateGroup(): void {
    // ✅ Khi update bạn chỉ cần giữ userManagerId là id → backend sẽ lưu đúng
    this.groupService.updateGroup(this.groupId, this.group).subscribe({
      next: () => {
        this.snackBar.open('Group updated successfully', 'Close', {
          duration: 3000,
        });
        // reload lại thông tin mới
        this.ngOnInit();
      },
      error: () => {
        this.snackBar.open('Failed to update group', 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
