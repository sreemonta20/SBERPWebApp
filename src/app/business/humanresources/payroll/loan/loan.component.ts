import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService, HumanResourcesService,
} from '@app/core/services';
import { PayrollService } from '@app/core/services/payroll.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs';

/** Employee loans/advances. Recovery happens automatically inside the payroll
 *  run (one installment per payslip, capped at outstanding). Here we just raise,
 *  edit (before any recovery), and close/cancel. */
@Component({
  selector: 'app-loan',
  standalone: false,
  templateUrl: './loan.component.html',
  styleUrls: ['./loan.component.css'],
})
export class LoanComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public list: any[] = [];
  public employees: any[] = [];
  public searchTerm = '';
  public readonly STATUS = { Active: 1, Closed: 2, Cancelled: 3 };

  public form!: FormGroup;
  public deleteConfirmationMessage = '';
  private pending: { id: string; status: number } | null = null;
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private payrollService: PayrollService,
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
  }

  initForm(): void {
    const now = new Date();
    this.form = this.formBuilder.group({
      id: [null],
      employeeId: ['', Validators.required],
      principalAmount: [0, Validators.required],
      installmentAmount: [0, Validators.required],
      totalInstallments: [1, Validators.required],
      startMonth: [now.getMonth() + 1, Validators.required],
      startYear: [now.getFullYear(), Validators.required],
      reason: [''],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: '', SortColumnDirection: 'desc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.payrollService.getAllLoansPagingWithSearch(filter as any).subscribe({
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

  openCreateForm(): void { if (!this.isCreate) return; this.isEdit = false; this.initForm(); this.viewMode = 'form'; }

  edit(row: any): void {
    if (!this.isUpdate) return;
    if (row.paidInstallments > 0) { this.notifyService.showWarning('Loan already has recoveries; terms are locked.', MessageConstants.GENERAL_WARNING_TITLE); return; }
    this.isEdit = true;
    this.form.patchValue({
      id: row.id, employeeId: row.employeeId, principalAmount: row.principalAmount,
      installmentAmount: row.installmentAmount, totalInstallments: row.totalInstallments,
      startMonth: row.startMonth, startYear: row.startYear, reason: row.reason, createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }

  cancelForm(): void { this.viewMode = 'list'; this.isEdit = false; }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifyService.showWarning('Please fill the required fields', MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    const request = { actionName: this.isEdit ? 'Update' : 'Save', ...this.form.value, createUpdateBy: this.appUserProfileId };
    this.loadingService.setLoading(true);
    this.payrollService.createUpdateLoan(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE); this.viewMode = 'list'; this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  close(row: any): void { this.confirmStatus(row, this.STATUS.Closed, `Mark loan ${row.loanCode} as closed?`); }
  cancel(row: any): void { this.confirmStatus(row, this.STATUS.Cancelled, `Cancel loan ${row.loanCode}?`); }

  private confirmStatus(row: any, status: number, msg: string): void {
    if (!this.isUpdate) return;
    this.pending = { id: row.id, status };
    this.deleteConfirmationMessage = msg;
    this.confirmDialog?.open();
  }

  executeStatus(): void {
    if (!this.pending) return;
    this.loadingService.setLoading(true);
    this.payrollService.setLoanStatus({ id: this.pending.id, statusId: this.pending.status, createUpdateBy: this.appUserProfileId }).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pending = null;
      },
      error: (e) => { this.handleError(e); this.pending = null; },
    });
  }

  statusBadgeClass(statusId: number): string {
    switch (statusId) {
      case this.STATUS.Active: return 'badge badge-primary';
      case this.STATUS.Closed: return 'badge badge-success';
      case this.STATUS.Cancelled: return 'badge badge-danger';
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
