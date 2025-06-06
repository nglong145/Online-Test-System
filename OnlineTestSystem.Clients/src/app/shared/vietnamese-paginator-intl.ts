import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class VietnamesePaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Số bản ghi mỗi trang:';
  override nextPageLabel = 'Trang tiếp';
  override previousPageLabel = 'Trang trước';
  override firstPageLabel = 'Trang đầu';
  override lastPageLabel = 'Trang cuối';

  override getRangeLabel = (
    page: number,
    pageSize: number,
    length: number
  ): string => {
    if (length === 0 || pageSize === 0) {
      return `0 của ${length}`;
    }
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} của ${length}`;
  };
}
