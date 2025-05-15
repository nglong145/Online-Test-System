import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { Category, FilterCategory } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-category-detail',
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
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.scss',
})
export class CategoryDetailComponent implements OnInit {
  category: Category = {
    id: '',
    name: '',
    description: '',
    parentId: '',
    parentName: '',
    isActive: true,
  };

  categorySelect: Category[] = [];
  categorySelectFilter: Category[] = [];

  // Control để filter tên category trong select
  categoryFilterCtrl = new FormControl('');

  // Pagination & filter cho API category
  pageIndexSelect = 1;
  pageSizeSelect = 100; // Tăng nếu cần, hoặc implement lazy load
  sortBy = 'name';
  sortOrder = 'asc';

  groupFilter: string = '';
  filteredGroupDataSource: any[] = []; // Danh sách nhóm đã lọc
  totalGroups: number = 0;
  pageSize: number = 5;
  groupDisplayedColumns: string[] = ['groupName', 'memberCount'];

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private notification: SnackbarService // private groupService: GroupService
  ) {}

  ngOnInit(): void {
    this.loadCategoryDetails();
    this.categoryFilterCtrl.valueChanges
      .pipe(debounceTime(100), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.loadCategoriesSelect(searchTerm || '');
      });
  }

  loadCategoryDetails(): void {
    const cateId = this.route.snapshot.paramMap.get('id');
    if (cateId) {
      this.categoryService.getCategoryById(cateId).subscribe(
        (response) => {
          this.category = response;
          this.loadCategoriesSelect('');
        },
        (error) => {
          console.error('Error fetching category details', error);
          this.loadCategoriesSelect('');
        }
      );
    }
  }

  loadCategoriesSelect(searchName: string): void {
    const filter: FilterCategory = {
      id: this.category.id,
      name: searchName,
    };

    this.categoryService
      .getFilterCategory(
        this.pageIndexSelect,
        this.pageSizeSelect,
        this.sortBy,
        this.sortOrder,
        filter
      )
      .subscribe(
        (res) => {
          this.categorySelect = res.items;
          this.categorySelectFilter = [...this.categorySelect];
        },
        (err) => {
          console.error('Error loading categories', err);
        }
      );
  }

  // Khi select mở ra, load lại danh sách (hoặc có thể load lazy)
  onCategorySelectOpen(opened: boolean): void {
    if (opened) {
      this.loadCategoriesSelect(this.categoryFilterCtrl.value || '');
    }
  }

  // Khi chọn category từ dropdown
  onCategorySelected(selectedId: string): void {
    const selected = this.categorySelect.find((c) => c.id === selectedId);
    if (selected) {
      this.category.parentName = selected.name;
    } else {
      this.category.parentName = '';
    }
  }

  // So sánh 2 category để giữ selected đúng khi bind
  compareCategoryIds(id1: string, id2: string): boolean {
    return id1 && id2 ? id1 === id2 : id1 === id2;
  }

  // Phương thức gọi API cập nhật thông tin giảng viên
  updateCategory(): void {
    this.categoryService
      .updateCategory(this.category.id, this.category)
      .subscribe(
        (response) => {
          this.notification.success('Cập nhật thành công');
          this.loadCategoryDetails();
        },
        (error) => {
          this.notification.error(error);
          console.error('Error updating teacher', error);
        }
      );
  }

  // loadGroups(managerId: string, groupNameFilter: string): void {
  //   this.groupService
  //     .getFilterGroupByManager(managerId, 1, this.pageSize, groupNameFilter)
  //     .subscribe(
  //       (groups) => {
  //         this.filteredGroupDataSource = groups.items;
  //         this.totalGroups = groups.length; // Sử dụng length nếu API không trả về tổng số nhóm
  //       },
  //       (error) => {
  //         console.error('Error fetching groups', error);
  //       }
  //     );
  // }

  // applyFilter(): void {
  //   if (this.teacher.id) {
  //     this.loadGroups(this.teacher.id, this.groupFilter); // Gọi lại API với filter mới
  //   }
  // }

  // // Phương thức phân trang nhóm lớp
  // pageChanged(event: any): void {
  //   const filter = { pageIndex: event.pageIndex + 1, pageSize: event.pageSize }; // Bạn có thể thêm các filter khác nếu cần
  //   this.loadGroups(filter.pageIndex, filter.pageSize);
  // }
}
