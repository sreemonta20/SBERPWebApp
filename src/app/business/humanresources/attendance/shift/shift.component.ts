import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService,
} from '@app/core/services';
import { AttendanceService } from '@app/core/services/attendance.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/** Shift CRUD. Same discipline as DepartmentComponent. */
@Component({
  selector: 'app-shift',
  standalone: false,
  templateUrl: './shift.component.html',
  styleUrls: ['./shift.component.css'],
})
export class ShiftComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public shiftList: any[] = [];
  public searchTerm = '';

  public shiftForm!: FormGroup;
  public deleteConfirmationMessage = '';
  private pendingDeleteId = '';
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private attendanceService: AttendanceService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isCreate = p.IsCreate; this.isUpdate = p.IsUpdate; this.isDelete = p.IsDelete;
    this.initializeForm();
    this.loadShiftsPaging();
  }

  initializeForm(): void {
    this.shiftForm = this.formBuilder.group({
      id: [null],
      shiftCode: ['', Validators.required],
      name: ['', Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['18:00', Validators.required],
      isNightShift: [false],
      breakMinutes: [60],
      graceInMinutes: [10],
      graceOutMinutes: [10],
      fullDayHours: [8],
      halfDayHours: [4],
      weekOffDays: ['0,6'],
      description: [''],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadShiftsPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: 'ShiftCode', SortColumnDirection: 'asc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.attendanceService.getAllShiftsPagingWithSearch(filter as any).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success && res.result) {
          this.shiftList = res.result.items || [];
          this.totalRows = res.result.rowCount || 0;
          this.pageCount = res.result.pageCount || 0;
          this.currentPage = res.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else { this.shiftList = []; this.totalRows = 0; this.pageCount = 0; }
      },
      error: (e) => this.handleError(e),
    });
  }

  openCreateForm(): void {
    if (!this.isCreate) return;
    this.isEdit = false;
    this.initializeForm();
    this.viewMode = 'form';
  }

  editShift(row: any): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.shiftForm.patchValue({
      id: row.id, shiftCode: row.shiftCode, name: row.name,
      startTime: row.startTime, endTime: row.endTime, isNightShift: row.isNightShift,
      breakMinutes: row.breakMinutes, graceInMinutes: row.graceInMinutes, graceOutMinutes: row.graceOutMinutes,
      fullDayHours: row.fullDayHours, halfDayHours: row.halfDayHours, weekOffDays: row.weekOffDays,
      createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }

  cancelForm(): void { this.viewMode = 'list'; this.isEdit = false; }

  saveShift(): void {
    if (this.shiftForm.invalid) {
      this.shiftForm.markAllAsTouched();
      this.notifyService.showWarning('Please fill the required fields', MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    const request = { actionName: this.isEdit ? 'Update' : 'Save', ...this.shiftForm.value, createUpdateBy: this.appUserProfileId };
    this.loadingService.setLoading(true);
    this.attendanceService.createUpdateShift(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) {
          this.notifyService.showSuccess(res.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE);
          this.viewMode = 'list'; this.loadShiftsPaging();
        } else this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  deleteShift(row: any): void {
    if (!this.isDelete || !row?.id) return;
    this.pendingDeleteId = row.id;
    this.deleteConfirmationMessage = `Shift ${row.name} will be inactivated. Continue?`;
    this.confirmDialog?.open();
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.attendanceService.deleteShift(this.pendingDeleteId).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Removed', MessageConstants.GENERAL_SUCCESS_TITLE); this.loadShiftsPaging(); }
        else this.notifyService.showWarning(res?.message || 'Remove failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pendingDeleteId = '';
      },
      error: (e) => { this.handleError(e); this.pendingDeleteId = ''; },
    });
  }

  changePage(page: number): void { if (page >= 1 && page <= this.pageCount) { this.currentPage = page; this.loadShiftsPaging(); } }
  changePageSize(event: any): void { this.pageSize = +event.target.value; this.currentPage = 1; this.loadShiftsPaging(); }
  search(): void { this.currentPage = 1; this.loadShiftsPaging(); }
  updatePageIndices(): void { this.startPage = (this.currentPage - 1) * this.pageSize + 1; this.endPage = this.startPage - 1 + this.shiftList.length; }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
