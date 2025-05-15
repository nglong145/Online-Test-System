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
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { AddModalComponent } from '../../../shared/add-modal/add-modal.component';

import { MatDatepickerModule } from '@angular/material/datepicker'; // Import MatDatepickerModule
import { MatNativeDateModule } from '@angular/material/core';
import {
  Category,
  CreateCategory,
  FilterCategory,
} from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-list',
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
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  categoryDataSource: Category[] = [];
  totalCategories: number = 0;
  pageSize: number = 10;
  filter: FilterCategory = {};

  displayedColumns: string[] = ['name', 'description', 'categoryParent'];

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private notification: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = 'name',
    sortOrder: string = 'asc'
  ): void {
    this.categoryService
      .getFilterCategory(index, size, sortBy, sortOrder, this.filter)
      .subscribe(
        (response) => {
          this.categoryDataSource = response.items;
          this.totalCategories = response.totalPages * size;
        },
        (error) => {
          console.error('Error fetching category data', error);
        }
      );
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.loadCategories(pageIndex, pageSize);
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(AddModalComponent, {
      width: '500px',
      data: {
        title: 'Thêm danh mục Mới',
        fields: [
          { label: 'Tên danh mục', name: 'name', type: 'text' },
          { label: 'Mô tả', name: 'description', type: 'text' },
          {
            label: 'Danh mục cha (nếu có)',
            name: 'parentId',
            type: 'select-search-api',
            apiService: this.categoryService,
            apiMethod: 'getFilterCategory',
            apiFieldName: 'name',
          },
        ],
        submitButtonText: 'Thêm Mới',
        submitAction: (formData: any) => this.addCategory(formData),
      },
    });
  }

  addCategory(formData: CreateCategory): void {
    formData.isActive = true;
    this.categoryService.addCategory(formData).subscribe(
      (response) => {
        console.log('Thêm giảng viên thành công:', response);
        this.notification.success('Danh mụcmục đã thêm thành công');
        // Sau khi thêm thành công, gọi lại loadTeachers để tải lại danh sách giảng viên
        this.loadCategories(); // Gọi lại hàm loadTeachers để tải lại danh sách mới nhất
      },
      (error) => {
        this.notification.error(error);
        console.error('Lỗi khi thêm giảng viên:', error);
      }
    );
  }
}
