import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService, HumanResourcesService,
} from '@app/core/services';
import { SeparationService } from '@app/core/services/separation.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs';

/**
 * Separation (offboarding) — list + detail. The detail screen drives the whole
 * lifecycle: submit -> approve (seeds clearances) -> clear each department ->
 * exit interview -> settle (queues the offboarded event for Security).
 */
@Component({
  selector: 'app-separation',
  standalone: false,
  templateUrl: './separation.component.html',
  styleUrls: ['./separation.component.css'],
})
export class SeparationComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' | 'detail' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public list: any[] = [];
  public employees: any[] = [];
  public searchTerm = '';

  public readonly STATUS = { Draft: 1, Pending: 2, Approved: 3, InClearance: 4, Settled: 5, Completed: 6, Cancelled: 7 };
  public readonly CLR = { Pending: 1, Cleared: 2, Blocked: 3 };
  public separationTypes = [
    { id: 1, name: 'Resignation' }, { id: 2, name: 'Termination' }, { id: 3, name: 'Retirement' },
    { id: 4, name: 'End of Contract' }, { id: 5, name: 'Death' },
  ];

  public form!: FormGroup;
  public exitForm!: FormGroup;
  public showExitForm = false;

  public detail: any = null;
  public clearances: any[] = [];

  public deleteConfirmationMessage = '';
  private pendingDeleteId = '';
  private pendingAction: { kind: 'status' | 'approve' | 'settle'; status?: number } | null = null;
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private separationService: SeparationService,
    private hrService: HumanResourcesService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().pipe(take(1)).subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isCreate = p.IsCreate; this.isUpdate = p.IsUpdate; this.isDelete = p.IsDelete;
    this.initForm();
    this.initExitForm();
    this.loadPaging();
    this.loadEmployees();
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      employeeId: ['', Validators.required],
      separationTypeId: [1, Validators.required],
      reason: [''],
      noticeDate: [null],
      requestedLastWorkingDate: [null],
      noticePeriodDays: [null],
      isNoticeWaived: [false],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  initExitForm(): void {
    this.exitForm = this.formBuilder.group({
      id: [null],
      separationId: [''],
      interviewDate: [null],
      interviewerId: [''],
      primaryReason: [''],
      overallExperienceRating: [null],
      wouldRecommend: [null],
      feedback: [''],
      suggestions: [''],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: '', SortColumnDirection: 'desc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.separationService.getAllSeparationsPagingWithSearch(filter as any).subscribe({
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

  // ---- list -> form ----
  openCreateForm(): void { if (!this.isCreate) return; this.isEdit = false; this.initForm(); this.viewMode = 'form'; }

  edit(row: any): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.form.patchValue({
      id: row.id, employeeId: row.employeeId, separationTypeId: row.separationTypeId,
      noticeDate: this.toDateInput(row.noticeDate), createUpdateBy: this.appUserProfileId,
    });
    // pull full record for the editable fields not in the list row
    this.separationService.getSeparationDetail(row.id).subscribe({
      next: (res: any) => {
        const d = res?.result; if (!d) return;
        this.form.patchValue({
          reason: d.Reason ?? d.reason,
          requestedLastWorkingDate: this.toDateInput(d.RequestedLastWorkingDate ?? d.requestedLastWorkingDate),
          noticePeriodDays: d.NoticePeriodDays ?? d.noticePeriodDays,
          isNoticeWaived: d.IsNoticeWaived ?? d.isNoticeWaived ?? false,
        });
      }, error: () => {},
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
    this.separationService.createUpdateSeparation(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE); this.viewMode = 'list'; this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  // ---- detail ----
  open(row: any): void {
    this.loadingService.setLoading(true);
    this.separationService.getSeparationDetail(row.id).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        const d = res?.result;
        if (!res?.success || !d) { this.notifyService.showWarning('Could not load separation', MessageConstants.GENERAL_WARNING_TITLE); return; }
        this.detail = d;
        this.clearances = (d.Clearances || d.clearances || []).map((c: any) => ({
          id: c.Id || c.id,
          departmentId: c.DepartmentId ?? c.departmentId,
          departmentName: c.DepartmentName || c.departmentName,
          clearanceStatusId: c.ClearanceStatusId ?? c.clearanceStatusId,
          clearanceStatusName: c.ClearanceStatusName || c.clearanceStatusName,
          remarks: c.Remarks || c.remarks || '',
          duesAmount: c.DuesAmount ?? c.duesAmount ?? null,
        }));
        // hydrate exit interview into its form if present
        const x = d.ExitInterview || d.exitInterview;
        this.showExitForm = false;
        this.initExitForm();
        this.exitForm.patchValue({ separationId: d.Id || d.id });
        if (x) {
          this.exitForm.patchValue({
            id: x.Id || x.id,
            interviewDate: this.toDateInput(x.InterviewDate ?? x.interviewDate),
            interviewerId: x.InterviewerId ?? x.interviewerId ?? '',
            primaryReason: x.PrimaryReason ?? x.primaryReason ?? '',
            overallExperienceRating: x.OverallExperienceRating ?? x.overallExperienceRating ?? null,
            wouldRecommend: x.WouldRecommend ?? x.wouldRecommend ?? null,
            feedback: x.Feedback ?? x.feedback ?? '',
            suggestions: x.Suggestions ?? x.suggestions ?? '',
          });
        }
        this.viewMode = 'detail';
      },
      error: (e) => this.handleError(e),
    });
  }

  back(): void { this.viewMode = 'list'; this.detail = null; this.clearances = []; }
  get statusId(): number { return this.detail ? (this.detail.StatusId ?? this.detail.statusId) : 0; }
  get separationId(): string { return this.detail ? (this.detail.Id || this.detail.id) : ''; }

  get allCleared(): boolean {
    return this.clearances.length > 0 && this.clearances.every((c) => c.clearanceStatusId === this.CLR.Cleared);
  }
  get anyBlocked(): boolean { return this.clearances.some((c) => c.clearanceStatusId === this.CLR.Blocked); }

  // ---- clearance line actions ----
  setClearance(line: any, statusId: number): void {
    if (!this.isUpdate) return;
    this.loadingService.setLoading(true);
    this.separationService.setClearanceStatus({
      id: line.id, clearanceStatusId: statusId, remarks: line.remarks,
      duesAmount: line.duesAmount, createUpdateBy: this.appUserProfileId,
    }).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.refreshDetail(); }
        else this.notifyService.showWarning(res?.message || 'Update failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  private refreshDetail(): void {
    if (!this.separationId) return;
    this.separationService.getSeparationDetail(this.separationId).subscribe({
      next: (res: any) => {
        const d = res?.result; if (!d) return;
        this.detail = d;
        this.clearances = (d.Clearances || d.clearances || []).map((c: any) => ({
          id: c.Id || c.id, departmentId: c.DepartmentId ?? c.departmentId,
          departmentName: c.DepartmentName || c.departmentName,
          clearanceStatusId: c.ClearanceStatusId ?? c.clearanceStatusId,
          clearanceStatusName: c.ClearanceStatusName || c.clearanceStatusName,
          remarks: c.Remarks || c.remarks || '', duesAmount: c.DuesAmount ?? c.duesAmount ?? null,
        }));
      }, error: () => {},
    });
  }

  // ---- exit interview ----
  toggleExitForm(): void { this.showExitForm = !this.showExitForm; }

  saveExitInterview(): void {
    const v = this.exitForm.value;
    const request = {
      actionName: v.id ? 'Update' : 'Save', ...v,
      separationId: this.separationId, createUpdateBy: this.appUserProfileId,
    };
    this.loadingService.setLoading(true);
    this.separationService.createUpdateExitInterview(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE); this.showExitForm = false; this.refreshDetail(); }
        else this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  // ---- workflow ----
  submit(row?: any): void {
    const id = row ? row.id : this.separationId;
    this.pendingDeleteId = ''; this.pendingAction = { kind: 'status', status: this.STATUS.Pending };
    this.pendingTargetId = id;
    this.deleteConfirmationMessage = 'Submit this separation for approval?';
    this.confirmDialog?.open();
  }
  approve(): void {
    this.pendingDeleteId = ''; this.pendingAction = { kind: 'approve' }; this.pendingTargetId = this.separationId;
    this.deleteConfirmationMessage = 'Approve this separation? A clearance checklist will be created.';
    this.confirmDialog?.open();
  }
  settle(): void {
    this.pendingDeleteId = ''; this.pendingAction = { kind: 'settle' }; this.pendingTargetId = this.separationId;
    this.deleteConfirmationMessage = 'Settle this separation? This finalises offboarding and disables system access.';
    this.confirmDialog?.open();
  }
  complete(): void {
    this.pendingDeleteId = ''; this.pendingAction = { kind: 'status', status: this.STATUS.Completed }; this.pendingTargetId = this.separationId;
    this.deleteConfirmationMessage = 'Mark this separation Completed?';
    this.confirmDialog?.open();
  }
  cancel(row?: any): void {
    const id = row ? row.id : this.separationId;
    this.pendingDeleteId = ''; this.pendingAction = { kind: 'status', status: this.STATUS.Cancelled }; this.pendingTargetId = id;
    this.deleteConfirmationMessage = 'Cancel this separation? It will be withdrawn.';
    this.confirmDialog?.open();
  }

  private pendingTargetId = '';

  remove(row: any): void {
    if (!this.isDelete || !row?.id) return;
    this.pendingAction = null; this.pendingDeleteId = row.id;
    this.deleteConfirmationMessage = `Separation ${row.separationCode} will be removed. Continue?`;
    this.confirmDialog?.open();
  }

  confirmDialogYes(): void {
    if (this.pendingDeleteId) { this.executeDelete(); return; }
    if (!this.pendingAction) return;
    const a = this.pendingAction;
    this.loadingService.setLoading(true);
    let obs;
    if (a.kind === 'approve') {
      obs = this.separationService.approveSeparation({ id: this.pendingTargetId, lastWorkingDate: this.detail?.LastWorkingDate ?? null, createUpdateBy: this.appUserProfileId });
    } else if (a.kind === 'settle') {
      obs = this.separationService.settleSeparation({ id: this.pendingTargetId, settlementRemarks: this.detail?.SettlementRemarks ?? null, isRehireEligible: this.detail?.IsRehireEligible ?? null, createUpdateBy: this.appUserProfileId });
    } else {
      obs = this.separationService.setSeparationStatus({ id: this.pendingTargetId, statusId: a.status, createUpdateBy: this.appUserProfileId });
    }
    obs.subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) {
          this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE);
          if (this.viewMode === 'detail') this.refreshDetail(); else this.loadPaging();
          if (a.kind === 'settle' || a.status === this.STATUS.Completed || a.status === this.STATUS.Cancelled) { /* stay or go back per UX */ }
        } else this.notifyService.showWarning(res?.message || 'Failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pendingAction = null; this.pendingTargetId = '';
      },
      error: (e) => { this.handleError(e); this.pendingAction = null; this.pendingTargetId = ''; },
    });
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.separationService.deleteSeparation(this.pendingDeleteId).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Removed', MessageConstants.GENERAL_SUCCESS_TITLE); this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Remove failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pendingDeleteId = '';
      },
      error: (e) => { this.handleError(e); this.pendingDeleteId = ''; },
    });
  }

  statusBadgeClass(statusId: number): string {
    switch (statusId) {
      case this.STATUS.Draft: return 'badge badge-secondary';
      case this.STATUS.Pending: return 'badge badge-warning';
      case this.STATUS.Approved: return 'badge badge-info';
      case this.STATUS.InClearance: return 'badge badge-primary';
      case this.STATUS.Settled: return 'badge badge-success';
      case this.STATUS.Completed: return 'badge badge-dark';
      case this.STATUS.Cancelled: return 'badge badge-danger';
      default: return 'badge badge-light';
    }
  }
  clrBadgeClass(statusId: number): string {
    switch (statusId) {
      case this.CLR.Pending: return 'badge badge-warning';
      case this.CLR.Cleared: return 'badge badge-success';
      case this.CLR.Blocked: return 'badge badge-danger';
      default: return 'badge badge-light';
    }
  }

  toDateInput(v: any): string | null {
    if (!v) return null;
    const d = new Date(v); return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
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
