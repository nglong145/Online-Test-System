import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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

import { MatDialog } from '@angular/material/dialog';
import { GroupService } from '../services/group.service';
import { UserService } from '../../services/user.service';
import { AddModalComponent } from '../../../shared/add-modal/add-modal.component';
import { RouterModule } from '@angular/router';

interface Group {
  name: string;
  createdAt: string;
  description: Date;
  userManager: string;
}

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
  ],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss',
})
export class GroupListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'name',
    'description',
    'createdAt',
    'userManager',
  ];
  groupDataSource!: MatTableDataSource<Group>;
  totalGroups: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  searchValue: string = ''; // For search filter

  @ViewChild(MatSort) sort!: MatSort; // Reference to MatSort
  @ViewChild(MatPaginator) paginator!: MatPaginator; // Reference to MatPaginator

  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private groupService: GroupService
  ) {}

  ngOnInit(): void {
    this.fetchGroups();
  }

  ngAfterViewInit(): void {
    this.groupDataSource.sort = this.sort; // Set the sorting functionality
    this.groupDataSource.paginator = this.paginator; // Set the paginator functionality
  }

  fetchGroups(): void {
    const sortBy = 'createdAt'; // Sorting field
    const sortOrder = 'desc'; // Sorting order ('asc' or 'desc')

    this.groupService
      .getFilteredGroups(this.pageIndex + 1, this.pageSize, sortBy, sortOrder)
      .subscribe((response) => {
        // Map through the response to concatenate the manager's first and last name
        const groupsWithManagerName = response.items.map((group: any) => ({
          ...group,
          userManager: `${group.managerFisrtName} ${group.managerLastName}`, // Concatenate first and last name
        }));

        this.groupDataSource = new MatTableDataSource(groupsWithManagerName);
        this.totalGroups = response.totalPages * this.pageSize; // Set the total group count
        this.applyFilter(); // Apply the search filter
      });
  }

  // Method to apply search filter
  applyFilter(): void {
    this.groupDataSource.filter = this.searchValue.trim().toLowerCase();
  }

  pageChanged(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchGroups();
  }

  onSearchChange(searchValue: string): void {
    this.searchValue = searchValue; // Update search value
    this.applyFilter(); // Apply the filter
  }

  openAddGroupModal(): void {
    // Lấy danh sách teacher trước
    this.userService
      .getFilterUser('teacher', 1, 10, 'CreatedAt', 'asc', {})
      .subscribe((teachers: any[]) => {
        const teacherOptions = teachers.map((teacher) => ({
          value: teacher.id,
          label: `${teacher.lastName} ${teacher.firstName}`,
        }));

        const dialogRef = this.dialog.open(AddModalComponent, {
          width: '400px',
          data: {
            title: 'Add New Group',
            fields: [
              { name: 'name', label: 'Group Name', type: 'text' },
              { name: 'description', label: 'Description', type: 'text' },
              {
                name: 'userManagerId',
                label: 'User Manager',
                type: 'select',
                options: teacherOptions,
              },
            ],
            submitButtonText: 'Create',
          },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            // Gọi API tạo group
            this.groupService.addGroup(result).subscribe(() => {
              this.fetchGroups(); // Refresh lại danh sách
            });
          }
        });
      });
  }
}
