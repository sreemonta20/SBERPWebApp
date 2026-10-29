import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService, LoaderService, NotificationService } from '@app/core/services';
import { PayrollService } from '@app/core/services/payroll.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/**
 * Payroll runs: list + process a month + view the resulting payslips + push the
 * run through approve / paid / cancel. Processing and status changes are SP-driven
 * so payslips and loan installments stay consistent.
 */
@Component({
  selector: 'app-payroll-run',
  standalone: false,
  templateUrl: './payroll-run.component.html',
  styleUrls: ['./payroll-run.component.css'],
})
export class PayrollRunComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' | 'payslips' = 'list';

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public list: any[] = [];
  public searchTerm = '';
  public readonly STATUS = { Draft: 1, Processed: 2, Approved: 3, Paid: 4, Cancelled: 5 };
  public months = [
    { v: 1, n: 'January' }, { v: 2, n: 'February' }, { v: 3, n: 'March' }, { v: 4, n: 'April' },
    { v: 5, n: 'May' }, { v: 6, n: 'June' }, { v: 7, n: 'July' }, { v: 8, n: 'August' },
    { v: 9, n: 'September' }, { v: 10, n: 'October' }, { v: 11, n: 'November' }, { v: 12, n: 'December' },
  ];

  public form!: FormGroup;
  public selectedRun: any = null;
  public payslips: any[] = [];
  public payslipDetail: any = null;

  public deleteConfirmationMessage = '';
  private pending: { id: string; status: number } | null = null;
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private payrollService: PayrollService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isCreate = p.IsCreate; this.isUpdate = p.IsUpdate;
    this.initForm();
    this.loadPaging();
  }

  initForm(): void {
    const now = new Date();
    const y = now.getFullYear(); const m = now.getMonth() + 1;
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0);
    this.form = this.formBuilder.group({
      payMonth: [m, Validators.required],
      payYear: [y, Validators.required],
      periodStart: [first.toISOString().slice(0, 10), Validators.required],
      periodEnd: [last.toISOString().slice(0, 10), Validators.required],
      workingDays: [last.getDate(), Validators.required],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: '', SortColumnDirection: 'desc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.payrollService.getAllPayrollRunsPagingWithSearch(filter as any).subscribe({
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

  openProcessForm(): void { if (!this.isCreate) return; this.initForm(); this.viewMode = 'form'; }
  cancelForm(): void { this.viewMode = 'list'; }

  // keep period + working days roughly in sync when month/year change
  onPeriodChange(): void {
    const { payMonth, payYear } = this.form.value;
    if (!payMonth || !payYear) return;
    const first = new Date(payYear, payMonth - 1, 1);
    const last = new Date(payYear, payMonth, 0);
    this.form.patchValue({
      periodStart: first.toISOString().slice(0, 10),
      periodEnd: last.toISOString().slice(0, 10),
      workingDays: last.getDate(),
    });
  }

  process(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifyService.showWarning('Please fill the required fields', MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    const request = { ...this.form.value, createUpdateBy: this.appUserProfileId };
    this.loadingService.setLoading(true);
    this.payrollService.processPayrollRun(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) {
          this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE);
          this.viewMode = 'list'; this.loadPaging();
        } else this.notifyService.showWarning(res?.message || 'Processing failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  viewPayslips(run: any): void {
    this.selectedRun = run;
    this.loadingService.setLoading(true);
    this.payrollService.getPayslipsByRun(run.id).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        this.payslips = (res?.success && Array.isArray(res.result)) ? res.result : [];
        this.viewMode = 'payslips';
      },
      error: (e) => this.handleError(e),
    });
  }

  openPayslip(ps: any): void {
    this.payrollService.getPayslipDetail(ps.Id || ps.id).subscribe({
      next: (res: any) => { this.payslipDetail = res?.result || null; },
      error: (e) => this.handleError(e),
    });
  }
  closePayslip(): void { this.payslipDetail = null; }

  reprocess(): void {
    if (!this.selectedRun) return;
    this.initForm();
    this.form.patchValue({
      payMonth: this.selectedRun.payMonth, payYear: this.selectedRun.payYear,
      workingDays: this.selectedRun.workingDays,
    });
    this.onPeriodChange();
    this.viewMode = 'form';
  }

  approve(run: any): void { this.confirmStatus(run, this.STATUS.Approved, `Approve payroll ${run.runCode}? It will lock for editing.`); }
  markPaid(run: any): void { this.confirmStatus(run, this.STATUS.Paid, `Mark payroll ${run.runCode} as paid?`); }
  cancel(run: any): void { this.confirmStatus(run, this.STATUS.Cancelled, `Cancel payroll ${run.runCode}? Loan recoveries for this run will be reversed.`); }

  private confirmStatus(run: any, status: number, msg: string): void {
    if (!this.isUpdate) return;
    this.pending = { id: run.id, status };
    this.deleteConfirmationMessage = msg;
    this.confirmDialog?.open();
  }

  executeStatus(): void {
    if (!this.pending) return;
    this.loadingService.setLoading(true);
    this.payrollService.setPayrollRunStatus({ id: this.pending.id, statusId: this.pending.status, createUpdateBy: this.appUserProfileId }).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pending = null;
      },
      error: (e) => { this.handleError(e); this.pending = null; },
    });
  }

  monthName(m: number): string { return this.months.find((x) => x.v === m)?.n || String(m); }

  statusBadgeClass(statusId: number): string {
    switch (statusId) {
      case this.STATUS.Draft: return 'badge badge-secondary';
      case this.STATUS.Processed: return 'badge badge-info';
      case this.STATUS.Approved: return 'badge badge-primary';
      case this.STATUS.Paid: return 'badge badge-success';
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
