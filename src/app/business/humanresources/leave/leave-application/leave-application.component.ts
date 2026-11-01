import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService, HumanResourcesService,
} from '@app/core/services';
import { LeaveService } from '@app/core/services/leave.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs';

/**
 * Leave applications: list + apply + approve/reject/cancel. The apply form
 * shows a live balance strip for the chosen employee/year. All balance moves
 * happen server-side via SPs; the UI just reflects the result.
 */
@Component({
  selector: 'app-leave-application',
  standalone: false,
  templateUrl: './leave-application.component.html',
  styleUrls: ['./leave-application.component.css'],
})
export class LeaveApplicationComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public list: any[] = [];
  public employees: any[] = [];
  public leaveTypes: any[] = [];
  public balances: any[] = [];
  public searchTerm = '';
  public readonly STATUS = { Pending: 1, Approved: 2, Rejected: 3, Cancelled: 4, Withdrawn: 5 };

  public form!: FormGroup;
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;
  public deleteConfirmationMessage = '';
  private pending: { id: string; status: number } | null = null;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private leaveService: LeaveService,
    private hrService: HumanResourcesService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().pipe(take(1)).subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isCreate = p.IsCreate; this.isUpdate = p.IsUpdate;
    this.initForm();
    this.loadPaging();
    this.loadEmployees();
    this.loadLeaveTypes();
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      employeeId: ['', Validators.required],
      leaveTypeId: ['', Validators.required],
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      isHalfDay: [false],
      reason: [''],
      contactDuringLeave: [''],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: '', SortColumnDirection: 'desc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.leaveService.getAllLeaveApplicationsPagingWithSearch(filter as any).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success && res.result) {
          this.list = res.result.items || [];
          this.totalRows = res.result.rowCount || 0;
          this.pageCount = res.result.pageCount || 0;
          this.currentPage = res.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else { this.list = []; this.totalRows = 0; this.pageCount = 0; }
      },
      error: (e) => this.handleError(e),
    });
  }

  loadEmployees(): void {
    this.hrService.getAllEmployees().subscribe({
      next: (r: any) => { if (r?.success && Array.isArray(r.result)) this.employees = r.result; }, error: () => {},
    });
  }
  loadLeaveTypes(): void {
    this.leaveService.getLeaveTypesLookup().subscribe({
      next: (r: any) => { if (r?.success && Array.isArray(r.result)) this.leaveTypes = r.result; }, error: () => {},
    });
  }

  openCreateForm(): void { if (!this.isCreate) return; this.initForm(); this.balances = []; this.viewMode = 'form'; }
  cancelForm(): void { this.viewMode = 'list'; }

  onEmployeeChange(): void {
    const empId = this.form.value.employeeId;
    if (!empId) { this.balances = []; return; }
    const year = new Date().getFullYear();
    this.leaveService.getEmployeeLeaveBalances(empId, year).subscribe({
      next: (r: any) => { this.balances = (r?.success && Array.isArray(r.result)) ? r.result : []; },
      error: () => { this.balances = []; },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifyService.showWarning('Please fill the required fields', MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    const request = { ...this.form.value, createUpdateBy: this.appUserProfileId };
    this.loadingService.setLoading(true);
    this.leaveService.applyLeave(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) {
          this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE);
          this.viewMode = 'list'; this.loadPaging();
        } else this.notifyService.showWarning(res?.message || 'Apply failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  approve(row: any): void { this.confirmStatus(row, this.STATUS.Approved, `Approve leave ${row.applicationCode}?`); }
  reject(row: any): void { this.confirmStatus(row, this.STATUS.Rejected, `Reject leave ${row.applicationCode}?`); }
  cancel(row: any): void { this.confirmStatus(row, this.STATUS.Cancelled, `Cancel leave ${row.applicationCode}?`); }

  private confirmStatus(row: any, status: number, msg: string): void {
    if (!this.isUpdate) return;
    this.pending = { id: row.id, status };
    this.deleteConfirmationMessage = msg;
    this.confirmDialog?.open();
  }

  executeStatus(): void {
    if (!this.pending) return;
    this.leaveService.setLeaveApplicationStatus({
      id: this.pending.id, statusId: this.pending.status,
      approverId: this.appUserProfileId, createUpdateBy: this.appUserProfileId,
    }).subscribe({
      next: (res: any) => {
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pending = null;
      },
      error: (e) => { this.handleError(e); this.pending = null; },
    });
  }

  statusBadgeClass(statusId: number): string {
    switch (statusId) {
      case this.STATUS.Pending: return 'badge badge-warning';
      case this.STATUS.Approved: return 'badge badge-success';
      case this.STATUS.Rejected: return 'badge badge-danger';
      case this.STATUS.Cancelled: return 'badge badge-secondary';
      case this.STATUS.Withdrawn: return 'badge badge-dark';
      default: return 'badge badge-light';
    }
  }

  changePage(page: number): void { if (page >= 1 && page <= this.pageCount) { this.currentPage = page; this.loadPaging(); } }
  changePageSize(event: any): void { this.pageSize = +event.target.value; this.currentPage = 1; this.loadPaging(); }
  search(): void { this.currentPage = 1; this.loadPaging(); }
  updatePageIndices(): void { this.startPage = (this.currentPage - 1) * this.pageSize + 1; this.endPage = this.startPage - 1 + this.list.length; }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
