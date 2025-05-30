import { Component, HostListener } from '@angular/core';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Exam } from '../../models/exam.model';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { ExamService } from '../../services/exam.service';
import { DatePipe } from '@angular/common';
import { FilterUserQuiz, UserQuiz } from '../../models/userQuiz.model';
import { DoExamService } from '../../../student/services/do-exam.service';
import { ExamExtendService } from '../../services/exam-extend.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import {
  ExamGroup,
  ExamUser,
  FilterExamGroup,
  FilterExamUser,
} from '../../models/examExtend.model';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { GroupService } from '../../services/group.service';
import { Group } from '../../models/group.model';
import { DialogService } from '../../../shared/services/dialog.service';
import { VietnamesePaginatorIntl } from '../../../shared/vietnamese-paginator-intl';
import { AuthService } from '../../../core/auth/services/auth.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { QuizService } from '../../../teacher/services/quiz.service';
import { MatDialog } from '@angular/material/dialog';
import { UserQuizDeleteConfirmDialogComponent } from '../user-quiz-delete-confirm-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-exam-detail',
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
    MatExpansionModule,
    MatCardModule,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './exam-detail.component.html',
  styleUrl: './exam-detail.component.scss',
  providers: [
    DatePipe,
    { provide: MatPaginatorIntl, useClass: VietnamesePaginatorIntl },
  ],
})
export class ExamDetailComponent {
  exam: Exam = {
    id: '',
    name: '',
    accessCode: '',
    startTime: '',
    endTime: '',
    description: '',
    isActive: true,
  };

  role: string | null = '';

  originalExam: Exam | null = null;
  originalExamGroups: string[] = [];
  originalExamUsers: string[] = [];

  isLoading = false;
  isExamUpdateLoading = false;
  isAddUserLoading = false;
  isAddGroupLoading = false;
  isExportingParticipants = false;
  isExportingScores = false;

  loadingStates: { [key: string]: boolean } = {};
  constructor(
    private route: ActivatedRoute,
    private notification: SnackbarService,
    private examService: ExamService,
    private examExtendService: ExamExtendService,
    private quizService: QuizService,
    private router: Router,
    private userService: UserService,
    private groupService: GroupService,
    private dialogService: DialogService,
    private doExamService: DoExamService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getUserRole();
    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.loadExamDetails(examId);
    }

    // Lắng nghe tìm kiếm student
    this.studentAddFilterCtrl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((term) => this.loadStudentAddOptions(term || ''));

    // Lắng nghe tìm kiếm group
    this.groupAddFilterCtrl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((term) => this.loadGroupAddOptions(term || ''));
  }

  goBack(): void {
    if (this.role === 'Teacher') {
      this.router.navigate(['/teacher/exam']);
    } else if (this.role === 'Admin') {
      this.router.navigate(['/admin/exam']);
    }
  }

  // exam detail
  convertToLocalDateFormat(date: string): string {
    const dateObj = new Date(date);
    const day = ('0' + dateObj.getDate()).slice(-2);
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const year = dateObj.getFullYear();
    const hours = ('0' + dateObj.getHours()).slice(-2);
    const minutes = ('0' + dateObj.getMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`; // Định dạng chuẩn "yyyy-MM-ddTHH:mm"
  }

  isEndTimeValid(): boolean {
    if (!this.exam.startTime || !this.exam.endTime) {
      return true; // Nếu chưa nhập đủ thì không báo lỗi này, lỗi required khác xử lý
    }
    const start = new Date(this.exam.startTime).getTime();
    const end = new Date(this.exam.endTime).getTime();
    return end - start >= 3600000; // 3600000 ms = 1 giờ
  }

  loadExamDetails(examId: string): void {
    if (examId) {
      this.examService.getExamById(examId).subscribe(
        (response) => {
          this.exam = response;
          this.exam.startTime = this.convertToLocalDateFormat(
            this.exam.startTime
          );
          this.exam.endTime = this.convertToLocalDateFormat(this.exam.endTime);

          this.loadExamGroups();
          this.loadExamUsers();
          this.loadUserQuizzes();
          this.originalExam = JSON.parse(JSON.stringify(this.exam));
        },
        (error) => {
          console.error('Error fetching teacher details', error);
        }
      );
    }
  }

  updateExam(form: NgForm): void {
    if (form.invalid) {
      this.notification.error(
        'Vui lòng điền đầy đủ thông tin hợp lệ trước khi cập nhật'
      );
      return;
    }
    if (!this.isEndTimeValid()) {
      this.notification.error(
        'Thời điểm kết thúc phải lớn hơn thời điểm bắt đầu ít nhất 1 giờ'
      );
      return;
    }

    if (!this.isExamInfoChanged()) {
      this.notification.info('Không có thông tin thay đổi');
      return;
    }

    this.dialogService
      .confirm({
        title: 'Xác nhận cập nhật',
        message: 'Bạn có chắc chắn muốn cập nhật thông tin kỳ thi này?',
        confirmText: 'Cập nhật',
        cancelText: 'Hủy',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.performExamUpdate();
        }
      });
  }

  private performExamUpdate(): void {
    this.isExamUpdateLoading = true;
    this.examService.updateExam(this.exam.id, this.exam).subscribe({
      next: (response) => {
        this.notification.success('Cập nhật thông tin kỳ thi thành công');
        this.loadExamDetails(this.exam.id);
        this.isExamUpdateLoading = false;
      },
      error: (error) => {
        this.notification.error(
          error?.error?.message || 'Có lỗi xảy ra khi cập nhật thông tin!'
        );
        this.isExamUpdateLoading = false;
      },
    });
  }

  navigateBack(): void {
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
            this.navigateToQuizList();
          }
        });
    } else {
      this.navigateToQuizList();
    }
  }

  navigateToQuizList() {
    if (this.role === 'Admin') {
      this.router.navigate(['/admin/exam', this.exam.id, 'add-quiz']);
    } else if (this.role === 'Teacher') {
      this.router.navigate(['/teacher/exam', this.exam.id, 'add-quiz']);
    }
  }

  // ExamGroup
  filteredExamGroupDataSource: ExamGroup[] = [];
  totalExamGroups: number = 0;
  pageSizeExamGroup: number = 5;
  filterExamGroup: FilterExamGroup = {};

  examGroupDisplayedColumns = ['name', 'manager', 'actions'];

  // ExamUser
  filteredExamUserDataSource: ExamUser[] = [];
  totalExamUsers = 0;
  pageSizeExamUser = 5;
  filterExamUser: FilterExamUser = {};

  examUserDisplayedColumns = ['studentCode', 'fullName', 'actions'];

  // Load ExamGroup
  loadExamGroups(
    pageIndex: number = 1,
    pageSize: number = this.pageSizeExamGroup
  ): void {
    this.filterExamGroup.examId = this.exam.id;

    this.examExtendService
      .getFilterExamGroup(
        pageIndex,
        pageSize,
        'createdAt',
        'asc',
        this.filterExamGroup
      )
      .subscribe((result) => {
        this.filteredExamGroupDataSource = result.items;
        this.totalExamGroups = result.totalPages * pageSize;
        this.originalExamGroups = result.items.map((g: any) => g.groupId);
      });
  }

  // Load ExamUser
  loadExamUsers(
    pageIndex: number = 1,
    pageSize: number = this.pageSizeExamUser
  ): void {
    this.filterExamUser.examId = this.exam.id;

    this.examExtendService
      .getFilterExamUser(
        pageIndex,
        pageSize,
        'fullName',
        'desc',
        this.filterExamUser
      )
      .subscribe((result) => {
        this.filteredExamUserDataSource = result.items;
        this.totalExamUsers = result.totalPages * pageSize;
        this.originalExamUsers = result.items.map((u: any) => u.userId);
      });
  }

  // ExamGroup methods
  applyExamGroupFilter(): void {
    this.loadExamGroups();
  }

  clearExamGroupFilter(): void {
    this.filterExamGroup = {
      examId: this.exam.id,
    };
    this.loadExamGroups();
  }

  pageChangedExamGroup(event: any): void {
    this.loadExamGroups(event.pageIndex + 1, event.pageSize);
  }

  // ExamUser methods
  applyExamUserFilter(): void {
    this.loadExamUsers();
  }

  clearExamUserFilter(): void {
    this.filterExamUser = {
      examId: this.exam.id,
    };
    this.loadExamUsers();
  }

  pageChangedExamUser(event: any): void {
    this.loadExamUsers(event.pageIndex + 1, event.pageSize);
  }

  navigateToAddQuiz() {
    this.router.navigate(['/admin/exam', this.exam.id, 'add-quiz']);
  }

  // Add Remove user
  showAddUserRow = false;
  selectedAddUserId: string | null = null;
  studentAddOptions: User[] = [];
  studentAddFilterCtrl = new FormControl('');

  loadStudentAddOptions(searchTerm: string = ''): void {
    this.userService
      .getFilterUser('student', 1, 100, 'studentCode', 'asc', {
        name: searchTerm,
      })
      .subscribe(
        (res) => {
          this.studentAddOptions = res.items;
        },
        (err) => console.error(err)
      );
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
    if (this.selectedAddUserId) {
      this.isAddUserLoading = true;
      this.examExtendService
        .addExamUser(this.exam.id, this.selectedAddUserId)
        .subscribe({
          next: (res: any) => {
            this.notification.success(
              res.message || 'Thêm thành viên thành công!'
            );
            this.showAddUserRow = false;
            this.selectedAddUserId = null;
            this.loadExamUsers();
            this.isAddUserLoading = false;
          },
          error: (err: any) => {
            this.notification.error(err?.error?.message || 'Có lỗi xảy ra!');
            this.isAddUserLoading = false;
          },
        });
    }
  }

  cancelAddUser(): void {
    this.showAddUserRow = false;
    this.selectedAddUserId = null;
  }

  removeUserFromExam(user: ExamUser): void {
    this.dialogService.confirmDelete(user.fullName).subscribe((confirmed) => {
      if (confirmed) {
        this.examExtendService
          .deleteExamUser(this.exam.id, user.userId)
          .subscribe({
            next: () => {
              this.notification.success('Xóa thành viên thành công!');
              this.loadExamUsers();
              this.loadExamGroups();
              delete this.loadingStates[`user-${user.userId}`];
            },
            error: (error) => {
              this.notification.error('Xóa thất bại!');
              console.error(error);
              delete this.loadingStates[`user-${user.userId}`];
            },
          });
      }
    });
  }

  // Add Remove group
  showAddGroupRow = false;
  selectedAddgroupId: string | null = null;
  groupAddOptions: Group[] = [];
  groupAddFilterCtrl = new FormControl('');

  loadGroupAddOptions(searchTerm: string = ''): void {
    this.groupService
      .getFilteredGroups(1, 100, 'createdAt', 'asc', {
        name: searchTerm,
      })
      .subscribe(
        (res) => {
          this.groupAddOptions = res.items;
        },
        (err) => console.error(err)
      );
  }

  onGroupSelectOpen(opened: boolean): void {
    if (opened) {
      this.loadGroupAddOptions(this.groupAddFilterCtrl.value || '');
    }
  }

  compareGroupIds(id1: string, id2: string): boolean {
    return id1 && id2 ? id1 === id2 : id1 === id2;
  }

  confirmAddGroup(): void {
    if (this.selectedAddgroupId) {
      this.isAddGroupLoading = true;
      this.examExtendService
        .addExamGroup(this.exam.id, this.selectedAddgroupId)
        .subscribe({
          next: (res: any) => {
            this.notification.success(
              res.message || 'Thêm thành viên thành công!'
            );
            this.showAddGroupRow = false;
            this.selectedAddgroupId = null;
            this.loadExamUsers();
            this.loadExamGroups();
            this.isAddGroupLoading = false;
          },
          error: (err: any) => {
            this.notification.error(err?.error?.message || 'Có lỗi xảy ra!');
            this.isAddGroupLoading = false;
          },
        });
    }
  }

  cancelAddGroup(): void {
    this.showAddGroupRow = false;
    this.selectedAddgroupId = null;
  }

  removeGroupFromExam(group: ExamGroup): void {
    this.dialogService.confirmDelete(group.groupName).subscribe((confirmed) => {
      if (confirmed) {
        this.loadingStates[`group-${group.groupId}`] = true;
        this.examExtendService
          .deleteExamGroup(this.exam.id, group.groupId)
          .subscribe({
            next: () => {
              this.notification.success('Xóa nhóm thành công!');
              this.loadExamUsers();
              this.loadExamGroups();
              delete this.loadingStates[`group-${group.groupId}`];
            },
            error: (error) => {
              this.notification.error('Xóa thất bại!');
              console.error(error);
              delete this.loadingStates[`group-${group.groupId}`];
            },
          });
      }
    });
  }

  // UserQuiz list
  filteredUserQuizDataSource: UserQuiz[] = [];
  totalUserQuizzes: number = 0;
  pageSizeUserQuiz: number = 5;
  filterUserQuiz: FilterUserQuiz = {};

  userQuizDisplayedColumns = [
    'quizName',
    'studentCode',
    'fullName',
    'startedAt',
    'finishedAt',
    'score',
    'actions',
  ];

  // Load UserQuiz data
  loadUserQuizzes(
    pageIndex: number = 1,
    pageSize: number = this.pageSizeUserQuiz
  ): void {
    this.filterUserQuiz.examId = this.exam.id; // Set examId mặc định

    this.doExamService
      .getFilterUserQuiz(
        pageIndex,
        pageSize,
        'startedAt',
        'desc',
        this.filterUserQuiz
      )
      .subscribe((result) => {
        this.filteredUserQuizDataSource = result.items;
        this.totalUserQuizzes = result.totalPages * pageSize;
      });
  }

  // Filter methods
  applyUserQuizFilter(): void {
    this.loadUserQuizzes();
  }

  clearUserQuizFilter(): void {
    this.filterUserQuiz = {
      examId: this.exam.id, // Giữ lại examId khi clear filter
    };
    this.loadUserQuizzes();
  }

  pageChangedUserQuiz(event: any): void {
    this.loadUserQuizzes(event.pageIndex + 1, event.pageSize);
  }

  isExamInfoChanged(): boolean {
    if (!this.originalExam) return false;
    // Chỉ so sánh các trường được chỉnh sửa
    return (
      this.exam.name !== this.originalExam.name ||
      this.exam.accessCode !== this.originalExam.accessCode ||
      this.exam.description !== this.originalExam.description ||
      this.exam.startTime !== this.originalExam.startTime ||
      this.exam.endTime !== this.originalExam.endTime ||
      this.exam.isActive !== this.originalExam.isActive
    );
  }

  isExamGroupsChanged(): boolean {
    // So sánh ID nhóm
    const currentGroupIds = (this.filteredExamGroupDataSource ?? [])
      .map((g) => g.groupId)
      .sort();
    const originalIds = (this.originalExamGroups ?? []).slice().sort();
    return JSON.stringify(currentGroupIds) !== JSON.stringify(originalIds);
  }

  isExamUsersChanged(): boolean {
    // So sánh ID user
    const currentUserIds = (this.filteredExamUserDataSource ?? [])
      .map((u) => u.userId)
      .sort();
    const originalIds = (this.originalExamUsers ?? []).slice().sort();
    return JSON.stringify(currentUserIds) !== JSON.stringify(originalIds);
  }

  hasUnsavedChanges(): boolean {
    // Check cả info, group, user
    return (
      this.isExamInfoChanged() ||
      this.isExamGroupsChanged() ||
      this.isExamUsersChanged() ||
      this.showAddUserRow || // Nếu đang thêm user mà chưa xác nhận
      this.showAddGroupRow // Nếu đang thêm group mà chưa xác nhận
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges()) $event.returnValue = true;
  }

  // Export excel list exam participants
  exportExamParticipants(): void {
    if (!this.exam.id) {
      this.notification.error('Không tìm thấy thông tin kỳ thi');
      return;
    }
    this.isExportingParticipants = true;
    this.examExtendService.exportExamParticipants(this.exam.id).subscribe({
      next: (res: Blob) => {
        const fileName = `danhsach_sinhvien_${this.exam.name || 'exam'}.xlsx`;
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        this.isExportingParticipants = false;
      },
      error: (err) => {
        this.notification.error('Không thể xuất danh sách. Vui lòng thử lại!');
        this.isExportingParticipants = false;
      },
    });
  }

  // Export excel list exam participants
  exportUserQuizzes(): void {
    if (!this.exam.id) {
      this.notification.error('Không tìm thấy thông tin kỳ thi');
      return;
    }

    this.isExportingScores = true;
    this.quizService.exportUserQuizzes(this.exam.id).subscribe({
      next: (res: Blob) => {
        const fileName = `bangdiem_sinhvien_${this.exam.name || 'exam'}.xlsx`;
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        this.isExportingScores = false;
      },
      error: (err) => {
        this.notification.error('Không thể xuất danh sách. Vui lòng thử lại!');
        this.isExportingScores = false;
      },
    });
  }

  openDeleteConfirmDialog(quiz: UserQuiz): void {
    if (this.loadingStates[`quiz-${quiz.id}`]) {
      return; // Prevent multiple clicks
    }
    const dialogRef = this.dialog.open(UserQuizDeleteConfirmDialogComponent, {
      width: '450px',
      data: {
        quiz: quiz,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.deleteUserQuiz(quiz.id);
      }
    });
  }

  // Thêm method xóa userQuiz
  deleteUserQuiz(userQuizId: string): void {
    this.loadingStates[`quiz-${userQuizId}`] = true;
    this.doExamService.cancelExam(userQuizId).subscribe({
      next: () => {
        this.notification.success('Hủy bài thi thành công!');
        this.loadUserQuizzes();
        delete this.loadingStates[`quiz-${userQuizId}`];
      },
      error: (error) => {
        this.notification.error(
          error?.error?.message || 'Có lỗi xảy ra khi hủy bài thi!'
        );
        delete this.loadingStates[`quiz-${userQuizId}`];
      },
    });
  }

  isItemLoading(type: string, id: string): boolean {
    return !!this.loadingStates[`${type}-${id}`];
  }
}
