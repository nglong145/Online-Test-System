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

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CategoryService } from '../../services/category.service';
import { Bank, CreateBank, FilterBank } from '../../models/bank.model';
import { BankService } from '../../services/bank.service';
import { UserService } from '../../../admin/services/user.service';

@Component({
  selector: 'app-bank-list',
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
  templateUrl: './bank-list.component.html',
  styleUrl: './bank-list.component.scss',
})
export class BankListComponent implements OnInit {
  bankDataSource: Bank[] = [];
  totalBanks: number = 0;
  pageSize: number = 10;
  filter: FilterBank = {};

  displayedColumns: string[] = ['name', 'owner', 'category', 'total'];

  constructor(
    private bankService: BankService,
    private userService: UserService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private notification: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadBanks();
  }

  loadBanks(
    index: number = 1,
    size: number = this.pageSize,
    sortBy: string = 'name',
    sortOrder: string = 'asc'
  ): void {
    this.bankService
      .getFilterBank(index, size, sortBy, sortOrder, this.filter)
      .subscribe(
        (response) => {
          this.bankDataSource = response.items;
          this.totalBanks = response.totalPages * size;
        },
        (error) => {
          console.error('Error fetching category data', error);
        }
      );
  }

  pageChanged(event: any): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.loadBanks(pageIndex, pageSize);
  }

  openAddModal(): void {
    const dialogRef = this.dialog.open(AddModalComponent, {
      width: '500px',
      data: {
        title: 'Thêm ngân hàng câu hỏi Mới',
        fields: [
          { label: 'Tên ngân hàng câu hỏi', name: 'name', type: 'text' },
          {
            label: 'Người tạo',
            name: 'ownerId',
            type: 'select-search-api',
            apiService: this.userService,
            apiMethod: 'getFilterUser',
            apiFieldName: 'name',
          },
          {
            label: 'Danh mục',
            name: 'quizCategoryId',
            type: 'select-search-api',
            apiService: this.categoryService,
            apiMethod: 'getFilterCategory',
            apiFieldName: 'name',
          },
        ],
        submitButtonText: 'Thêm Mới',
        submitAction: (formData: any) => this.addBank(formData),
      },
    });
  }

  addBank(formData: CreateBank): void {
    this.bankService.addBank(formData).subscribe(
      (response) => {
        console.log('Thêm giảng viên thành công:', response);
        this.notification.success('Danh mụcmục đã thêm thành công');
        // Sau khi thêm thành công, gọi lại loadTeachers để tải lại danh sách giảng viên
        this.loadBanks(); // Gọi lại hàm loadTeachers để tải lại danh sách mới nhất
      },
      (error) => {
        this.notification.error(error);
        console.error('Lỗi khi thêm giảng viên:', error);
      }
    );
  }
}
